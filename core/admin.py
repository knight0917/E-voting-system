from django.contrib import admin
from .models import Position, Candidate, Title

@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ('description', 'max_vote', 'priority')
    search_fields = ('description',)
    ordering = ('priority',)

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ('firstname', 'lastname', 'position', 'party_name')
    list_filter = ('position', 'party_type')
    search_fields = ('firstname', 'lastname', 'platform')

@admin.register(Title)
class TitleAdmin(admin.ModelAdmin):
    list_display = ('header',)
