from django.core.management.base import BaseCommand
from core.models import Position, Candidate
from users.models import Voter, Vote
from datetime import datetime
import re
import csv
import io

class Command(BaseCommand):
    help = 'Seeds the database from votesystem.sql'

    def parse_row(self, row_str):
        reader = csv.reader(io.StringIO(row_str), quotechar="'", skipinitialspace=True)
        try:
            return next(reader)
        except StopIteration:
            return []

    def handle(self, *args, **options):
        try:
            with open('database/votesystem.sql', 'r', encoding='utf-8') as f:
                content = f.read()
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR('database/votesystem.sql not found'))
            return

        # Clear existing data
        Vote.objects.all().delete()
        Candidate.objects.all().delete()
        Position.objects.all().delete()
        Voter.objects.all().delete()

        # Positions
        self.stdout.write("Seeding Positions...")
        pos_pattern = r"INSERT INTO `positions` .*? VALUES\s*(.*?);"
        pos_matches = re.search(pos_pattern, content, re.DOTALL)
        if pos_matches:
            rows = re.findall(r"\((.*?)\)(?:,|$)", pos_matches.group(1))
            for row_str in rows:
                cols = self.parse_row(row_str)
                if not cols or len(cols) < 4: continue
                # id, description, max_vote, priority
                Position.objects.create(
                    id=int(cols[0]),
                    description=cols[1],
                    max_vote=int(cols[2]),
                    priority=int(cols[3])
                )

        # Candidates
        self.stdout.write("Seeding Candidates...")
        cand_pattern = r"INSERT INTO `candidates` .*? VALUES\s*(.*?);"
        cand_matches = re.search(cand_pattern, content, re.DOTALL)
        if cand_matches:
            rows = re.findall(r"\((.*?)\)(?:,|$)", cand_matches.group(1))
            for row_str in rows:
                cols = self.parse_row(row_str)
                if not cols or len(cols) < 6: continue
                # id, position_id, firstname, lastname, photo, platform
                try:
                    pos = Position.objects.get(id=int(cols[1]))
                    Candidate.objects.create(
                        id=int(cols[0]),
                        position=pos,
                        firstname=cols[2],
                        lastname=cols[3],
                        photo=cols[4],
                        platform=cols[5]
                    )
                except Position.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Position {cols[1]} not found for candidate {cols[2]}"))


        # Voters
        self.stdout.write("Seeding Voters...")
        voter_pattern = r"INSERT INTO `voters` .*? VALUES\s*(.*?);"
        voter_matches = re.search(voter_pattern, content, re.DOTALL)
        if voter_matches:
            rows = re.findall(r"\((.*?)\)(?:,|$)", voter_matches.group(1))
            for row_str in rows:
                cols = self.parse_row(row_str)
                if not cols or len(cols) < 6: continue
                # id, voters_id, password, firstname, lastname, photo
                Voter.objects.create(
                    id=int(cols[0]),
                    voters_id=cols[1],
                    password=cols[2],
                    firstname=cols[3],
                    lastname=cols[4],
                    photo=cols[5]
                )

        # Votes
        self.stdout.write("Seeding Votes...")
        vote_pattern = r"INSERT INTO `votes` .*? VALUES\s*(.*?);"
        vote_matches = re.search(vote_pattern, content, re.DOTALL)
        if vote_matches:
            rows = re.findall(r"\((.*?)\)(?:,|$)", vote_matches.group(1))
            for row_str in rows:
                cols = self.parse_row(row_str)
                if not cols or len(cols) < 4: continue
                # id, voters_id, candidate_id, position_id
                try:
                    voter = Voter.objects.get(id=int(cols[1]))
                    candidate = Candidate.objects.get(id=int(cols[2]))
                    pos = Position.objects.get(id=int(cols[3]))
                    Vote.objects.create(
                        id=int(cols[0]),
                        voter=voter,
                        candidate=candidate,
                        position=pos
                    )
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Skipping vote {cols[0]}: {e}"))

        self.stdout.write(self.style.SUCCESS('Successfully seeded database'))
