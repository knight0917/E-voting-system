from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Voter, Vote
from core.models import Position, Candidate, Title
from core.serializers import PositionSerializer, CandidateSerializer, TitleSerializer
import bcrypt

@api_view(['POST'])
def api_login(request):
    voter_id = request.data.get('voter_id')
    password = request.data.get('password')
    
    try:
        voter = Voter.objects.get(voters_id=voter_id)
        if bcrypt.checkpw(password.encode('utf-8'), voter.password.encode('utf-8')):
            return Response({'token': voter.id, 'user': {'firstname': voter.firstname, 'lastname': voter.lastname, 'photo': voter.photo.url if voter.photo else None}})
        else:
            return Response({'error': 'Incorrect password'}, status=status.HTTP_400_BAD_REQUEST)
    except Voter.DoesNotExist:
         return Response({'error': 'Voter not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def api_ballot(request):
    voter_id = request.query_params.get('token')
    if not voter_id:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
    positions = Position.objects.order_by('priority')
    serializer = PositionSerializer(positions, many=True)
    
    # Get Election Title
    title_obj = Title.objects.first()
    election_title = title_obj.header if title_obj else "Secure Aadhaar-Based E-Voting System"
    
    has_voted = Vote.objects.filter(voter_id=voter_id).exists()
    
    return Response({
        'positions': serializer.data, 
        'already_voted': has_voted,
        'election_title': election_title
    })

@api_view(['POST'])
def api_submit_vote(request):
    voter_id = request.data.get('token')
    votes_data = request.data.get('votes') # expecting {position_id: [candidate_id]}
    
    if not voter_id:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
    try:
        voter = Voter.objects.get(id=voter_id)
        if Vote.objects.filter(voter=voter).exists():
             return Response({'error': 'Already voted'}, status=status.HTTP_400_BAD_REQUEST)
             
        votes_to_cast = []
        for pos_id, candidates in votes_data.items():
            for cand_id in candidates:
                votes_to_cast.append(Vote(voter=voter, candidate_id=cand_id, position_id=pos_id))
        
        Vote.objects.bulk_create(votes_to_cast)
        return Response({'success': True})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Count

@api_view(['POST'])
def api_admin_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user is not None:
        if user.is_staff or user.is_superuser:
            return Response({'token': f"admin_{user.id}", 'user': {'username': user.username, 'is_admin': True}})
        else:
             return Response({'error': 'Not authorized as admin'}, status=status.HTTP_403_FORBIDDEN)
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def api_dashboard_stats(request):
    # Retrieve summary stats
    position_count = Position.objects.count()
    candidate_count = Candidate.objects.count()
    voter_count = Voter.objects.count()
    vote_count = Vote.objects.count()
    
    # Get tally: Positions -> Candidates -> Vote Count
    positions = Position.objects.prefetch_related('candidates').all().order_by('priority')
    tally = []
    
    for pos in positions:
        candidates = []
        for cand in pos.candidates.all():
            c_votes = Vote.objects.filter(candidate=cand).count()
            candidates.append({
                'id': cand.id,
                'name': f"{cand.firstname} {cand.lastname}",
                'votes': c_votes
            })
        # Sort candidates by votes descending
        candidates.sort(key=lambda x: x['votes'], reverse=True)
        tally.append({
            'position': pos.description,
            'candidates': candidates
        })
        
    return Response({
        'summary': {
            'positions': position_count,
            'candidates': candidate_count,
            'voters': voter_count,
            'votes_cast': vote_count
        },
        'tally': tally
    })

# --- Voter Management APIs ---
from .serializers import VoterSerializer
import random
import string

def generate_voter_id():
    # Simple logic: 3 letters + 6 digits
    letters = ''.join(random.choices(string.ascii_uppercase, k=3))
    digits = ''.join(random.choices(string.digits, k=6))
    return f"{letters}{digits}"

@api_view(['GET', 'POST'])
def api_admin_voters(request):
    if request.method == 'GET':
        voters = Voter.objects.all().order_by('-id')
        serializer = VoterSerializer(voters, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        data = request.data.copy()
        
        # Auto-generate Voter ID if not provided
        if 'voters_id' not in data or not data['voters_id']:
            while True:
                vid = generate_voter_id()
                if not Voter.objects.filter(voters_id=vid).exists():
                    data['voters_id'] = vid
                    break
        
        # Hash password
        raw_password = data.get('password')
        if raw_password:
             hashed = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt())
             data['password'] = hashed.decode('utf-8')
        
        serializer = VoterSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def api_admin_voter_detail(request, pk):
    try:
        voter = Voter.objects.get(pk=pk)
    except Voter.DoesNotExist:
        return Response({'error': 'Voter not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        data = request.data.copy()
        
        if 'password' in data and data['password']:
             hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
             data['password'] = hashed.decode('utf-8')
        elif 'password' in data:
            del data['password']

        serializer = VoterSerializer(voter, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        voter.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --- Candidate Management APIs ---

def generate_candidate_id():
    letters = ''.join(random.choices(string.ascii_uppercase, k=3))
    digits = ''.join(random.choices(string.digits, k=6))
    return f"C{letters}{digits}"

@api_view(['GET', 'POST'])
def api_admin_candidates(request):
    if request.method == 'GET':
        candidates = Candidate.objects.all().order_by('-id')
        serializer = CandidateSerializer(candidates, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        data = request.data.copy()
        
        # Generate ID
        if 'candidate_id' not in data or not data['candidate_id']:
             while True:
                cid = generate_candidate_id()
                if not Candidate.objects.filter(candidate_id=cid).exists():
                    data['candidate_id'] = cid
                    break
        
        serializer = CandidateSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def api_admin_candidate_detail(request, pk):
    try:
        candidate = Candidate.objects.get(pk=pk)
    except Candidate.DoesNotExist:
        return Response({'error': 'Candidate not found'}, status=status.HTTP_404_NOT_FOUND)
        
    if request.method == 'PUT':
        serializer = CandidateSerializer(candidate, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        candidate.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
def api_admin_positions(request):
    if request.method == 'GET':
        positions = Position.objects.all().order_by('priority')
        serializer = PositionSerializer(positions, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        serializer = PositionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def api_admin_position_detail(request, pk):
    try:
        position = Position.objects.get(pk=pk)
    except Position.DoesNotExist:
         return Response({'error': 'Position not found'}, status=status.HTTP_404_NOT_FOUND)
         
    if request.method == 'PUT':
        serializer = PositionSerializer(position, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'DELETE':
        position.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
def api_election_title(request):
    if request.method == 'GET':
        title = Title.objects.first()
        if not title:
            return Response({'header': 'Voting System'})
        return Response(TitleSerializer(title).data)
    
    elif request.method == 'POST':
        title = Title.objects.first()
        if title:
            # Update existing
            serializer = TitleSerializer(title, data=request.data)
        else:
            # Create new
            serializer = TitleSerializer(data=request.data)
            
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
