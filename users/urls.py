from django.urls import path
from . import api_views

urlpatterns = [
    # API Routes
    path('api/login/', api_views.api_login, name='api_login'),
    path('api/ballot/', api_views.api_ballot, name='api_ballot'),
    path('api/vote/', api_views.api_submit_vote, name='api_vote'),
    
    # Admin API Routes
    path('api/admin/login/', api_views.api_admin_login, name='api_admin_login'),
    path('api/admin/stats/', api_views.api_dashboard_stats, name='api_dashboard_stats'),
    path('api/admin/voters/', api_views.api_admin_voters, name='api_admin_voters'),
    path('api/admin/voters/<int:pk>/', api_views.api_admin_voter_detail, name='api_admin_voter_detail'),
    path('api/admin/candidates/', api_views.api_admin_candidates, name='api_admin_candidates'),
    path('api/admin/candidates/<int:pk>/', api_views.api_admin_candidate_detail, name='api_admin_candidate_detail'),
    path('api/admin/positions/', api_views.api_admin_positions, name='api_admin_positions'),
    path('api/admin/positions/<int:pk>/', api_views.api_admin_position_detail, name='api_admin_position_detail'),
    path('api/admin/title/', api_views.api_election_title, name='api_election_title'),
    path('api/admin/votes/', api_views.api_admin_votes, name='api_admin_votes'),
    path('api/admin/votes/reset/', api_views.api_admin_reset_votes, name='api_admin_reset_votes'),
]
