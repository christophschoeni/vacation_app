"""Custom user model: email is the login identifier, there is no username.

Set as AUTH_USER_MODEL before the first migration. Introducing this later is
painful in Django, which is why the local database is reset when this lands.
Social logins (Apple, Google) attach to the same user via a later migration.
"""

import secrets
import uuid
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self) -> str:
        return self.email


def _generate_code() -> str:
    """A 6-digit numeric code, zero-padded (e.g. '004271')."""
    return f"{secrets.randbelow(1_000_000):06d}"


class PasswordResetCode(models.Model):
    """A short-lived 6-digit code emailed to a user to reset their password.

    Codes are single-use and expire after settings.PASSWORD_RESET_CODE_TTL_MINUTES.
    We keep the flow in-app (code entry) rather than using web reset links.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="password_reset_codes",
    )
    code = models.CharField(max_length=6, default=_generate_code)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["user", "code"])]

    def __str__(self) -> str:
        return f"reset code for {self.user.email}"

    def is_valid(self) -> bool:
        if self.used_at is not None:
            return False
        ttl = timedelta(minutes=settings.PASSWORD_RESET_CODE_TTL_MINUTES)
        return timezone.now() <= self.created_at + ttl
