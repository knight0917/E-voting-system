from rest_framework import serializers
from .models import Position, Candidate, Title

class CandidateSerializer(serializers.ModelSerializer):
    position_name = serializers.CharField(source='position.description', read_only=True)
    
    class Meta:
        model = Candidate
        fields = [
            'id', 'position', 'position_name', 'candidate_id', 
            'firstname', 'lastname', 'photo', 'manifesto', 
            'identity_type', 'identity_number', 'gender', 'address',
            'party_type', 'party_name', 'symbol', 
            'is_approved'
        ]

class PositionSerializer(serializers.ModelSerializer):
    candidates = CandidateSerializer(many=True, read_only=True)
    slug = serializers.SerializerMethodField()

    class Meta:
        model = Position
        fields = ['id', 'description', 'max_vote', 'priority', 'candidates', 'slug']
        
    def get_slug(self, obj):
        import re
        text = obj.description.lower()
        return re.sub(r'[^a-z0-9]+', '_', text).strip('_')

class TitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Title
        fields = ['id', 'header']
