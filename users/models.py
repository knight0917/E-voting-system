from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class VoterManager(BaseUserManager):
    def create_user(self, voters_id, password=None, **extra_fields):
        if not voters_id:
            raise ValueError('The Voter ID must be set')
        user = self.model(voters_id=voters_id, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

class Voter(models.Model):
    voters_id = models.CharField(max_length=15, unique=True)
    password = models.CharField(max_length=60)
    firstname = models.CharField(max_length=30)
    middlename = models.CharField(max_length=30, blank=True, null=True)
    lastname = models.CharField(max_length=30)
    photo = models.ImageField(upload_to='voters/', blank=True, null=True)
    
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Male')

    IDENTITY_TYPE_CHOICES = [
        ('aadhaar', 'Aadhaar Card'),
        ('voter_id', 'Voter ID Card'),
        ('passport', 'Passport'),
    ]
    
    identity_type = models.CharField(max_length=20, choices=IDENTITY_TYPE_CHOICES, default='aadhaar')
    aadhaar_hash = models.CharField(max_length=255, unique=True) # Identity No (Keeping legacy name for now)
    dob = models.DateField(null=True, blank=True)
    age = models.IntegerField(default=18)
    address = models.TextField()
    
    def __str__(self):
        return f"{self.firstname} {self.lastname}"

from core.models import Position, Candidate

class Vote(models.Model):
    voter = models.ForeignKey(Voter, on_delete=models.CASCADE, related_name='votes')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='votes')
    position = models.ForeignKey(Position, on_delete=models.CASCADE, related_name='votes')
    timestamp = models.DateTimeField(auto_now_add=True)
