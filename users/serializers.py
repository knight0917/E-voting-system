from rest_framework import serializers
from .models import Voter, Vote
from core.models import Candidate, Position

class VoterSerializer(serializers.ModelSerializer):
    has_voted = serializers.SerializerMethodField()

    class Meta:
        model = Voter
        fields = ['id', 'voters_id', 'firstname', 'middlename', 'lastname', 'photo', 'aadhaar_hash', 'address', 'has_voted', 'age', 'identity_type', 'gender']
        extra_kwargs = {'password': {'write_only': True}}
        
    def get_has_voted(self, obj):
        return Vote.objects.filter(voter=obj).exists()

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['id', 'voter', 'candidate', 'position', 'timestamp']
