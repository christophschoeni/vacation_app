"""Idempotently create the local test accounts and print their credentials.

Run by scripts/dev.sh on every start so the test logins always exist (surviving
a `db:reset`) and are shown in the terminal. Dev-only: refuses to run when
DEBUG is off, so it can never seed known-password accounts in production.
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

User = get_user_model()

# Kept in sync with what the app/dev docs reference.
TEST_USERS = [
    {"email": "testuser@ferien.app", "password": "testpass9876", "display_name": "Test User"},
    {"email": "live@test.com", "password": "live-pass-9876", "display_name": "Live Test"},
]


class Command(BaseCommand):
    help = "Create/refresh the local test users (dev only) and print their logins."

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("seed_test_users only runs with DEBUG=True (dev only).")

        for spec in TEST_USERS:
            user, created = User.objects.get_or_create(
                email=spec["email"],
                defaults={"display_name": spec["display_name"], "is_active": True},
            )
            # Always (re)set the password so a known credential is guaranteed,
            # even if the row already existed with a different one.
            user.set_password(spec["password"])
            user.is_active = True
            user.save()
            self.stdout.write(f"  {'created' if created else 'ok'}: {spec['email']}")

        # Machine-readable block dev.sh greps for, then prints nicely.
        self.stdout.write("TEST_LOGINS_BEGIN")
        for spec in TEST_USERS:
            self.stdout.write(f"{spec['email']} / {spec['password']}")
        self.stdout.write("TEST_LOGINS_END")
