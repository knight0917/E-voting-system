from django.db import models

class Position(models.Model):
    description = models.CharField(max_length=50)
    max_vote = models.IntegerField()
    priority = models.IntegerField()

    def __str__(self):
        return self.description

class Candidate(models.Model):
    position = models.ForeignKey(Position, on_delete=models.CASCADE, related_name='candidates')
    candidate_id = models.CharField(max_length=15, unique=True, null=True, blank=True) # Automated ID
    firstname = models.CharField(max_length=30)
    lastname = models.CharField(max_length=30)
    photo = models.ImageField(upload_to='candidates/photos/', blank=True, null=True)
    platform = models.TextField(blank=True, null=True) # Made optional
    
    # Identity
    IDENTITY_TYPE_CHOICES = [
        ('aadhaar', 'Aadhaar Card'),
        ('voter_id', 'Voter ID Card'),
        ('passport', 'Passport'),
    ]
    identity_type = models.CharField(max_length=20, choices=IDENTITY_TYPE_CHOICES, default='aadhaar')
    identity_number = models.CharField(max_length=50, blank=True, null=True)
    
    # Personal Info
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Male')
    address = models.TextField(blank=True, null=True)
    
    # Party Info
    PARTY_TYPE_CHOICES = [
        ('party', 'Political Party'),
        ('independent', 'Independent'),
    ]
    party_type = models.CharField(max_length=20, choices=PARTY_TYPE_CHOICES, default='independent')
    party_name = models.CharField(max_length=100, blank=True, null=True)
    symbol = models.ImageField(upload_to='candidates/symbols/', blank=True, null=True)
    
    # Legacy/Meta
    aadhaar_hash = models.CharField(max_length=255, blank=True, null=True) # Keeping for safety during migration, verify if needed
    party_symbol = models.CharField(max_length=150, blank=True, null=True) # Legacy
    is_approved = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.firstname} {self.lastname}"

class Title(models.Model):
    header = models.CharField(max_length=100, default="Voting System")
    
    def __str__(self):
        return self.header
