import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'evoting.settings')
django.setup()

from django.contrib.auth.models import User

def create_admin(username, password):
    if User.objects.filter(username=username).exists():
        print(f"User {username} already exists")
    else:
        User.objects.create_superuser(username=username, email=f'{username}@example.com', password=password)
        print(f"Created superuser {username}")

create_admin('election_commission', 'admin123')
create_admin('higher_authority', 'admin123')
