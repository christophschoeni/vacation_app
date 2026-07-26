"""Auth flow tests: register, login, refresh, /me, and access control."""

import pytest
from django.contrib.auth import get_user_model
from django.core import mail
from django.urls import reverse
from rest_framework.test import APIClient

from .models import PasswordResetCode

User = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.mark.django_db
def test_register_creates_user(client):
    response = client.post(
        reverse("register"),
        {"email": "new@example.com", "password": "s3cure-pass-99", "display_name": "New"},
        format="json",
    )
    assert response.status_code == 201
    assert response.data["email"] == "new@example.com"
    assert "password" not in response.data
    assert User.objects.filter(email="new@example.com").exists()


@pytest.mark.django_db
def test_register_rejects_weak_password(client):
    response = client.post(
        reverse("register"),
        {"email": "weak@example.com", "password": "123"},
        format="json",
    )
    assert response.status_code == 400
    assert not User.objects.filter(email="weak@example.com").exists()


@pytest.mark.django_db
def test_login_returns_tokens_and_me_works(client):
    User.objects.create_user(email="log@example.com", password="s3cure-pass-99")

    login = client.post(
        reverse("login"),
        {"email": "log@example.com", "password": "s3cure-pass-99"},
        format="json",
    )
    assert login.status_code == 200
    access = login.data["access"]
    assert login.data["refresh"]

    # /me requires the access token.
    me = client.get(reverse("me"), HTTP_AUTHORIZATION=f"Bearer {access}")
    assert me.status_code == 200
    assert me.data["email"] == "log@example.com"


@pytest.mark.django_db
def test_me_requires_authentication(client):
    assert client.get(reverse("me")).status_code == 401


@pytest.mark.django_db
def test_refresh_issues_new_access_token(client):
    User.objects.create_user(email="ref@example.com", password="s3cure-pass-99")
    login = client.post(
        reverse("login"),
        {"email": "ref@example.com", "password": "s3cure-pass-99"},
        format="json",
    )
    refresh = login.data["refresh"]

    response = client.post(reverse("token-refresh"), {"refresh": refresh}, format="json")
    assert response.status_code == 200
    assert response.data["access"]


# --- Password reset --------------------------------------------------------


@pytest.mark.django_db
def test_password_reset_emails_a_code_and_lets_user_set_new_password(client):
    user = User.objects.create_user(email="reset@example.com", password="old-pass-1234")

    # 1. Request a code.
    resp = client.post(reverse("password-reset"), {"email": "reset@example.com"}, format="json")
    assert resp.status_code == 200
    assert len(mail.outbox) == 1
    code = PasswordResetCode.objects.get(user=user).code
    assert code in mail.outbox[0].body

    # 2. Confirm with the code + a new password.
    resp = client.post(
        reverse("password-reset-confirm"),
        {"email": "reset@example.com", "code": code, "new_password": "brand-new-9988"},
        format="json",
    )
    assert resp.status_code == 200

    # 3. The new password works; the old one no longer does.
    user.refresh_from_db()
    assert user.check_password("brand-new-9988")
    assert not user.check_password("old-pass-1234")


@pytest.mark.django_db
def test_password_reset_request_does_not_reveal_unknown_email(client):
    resp = client.post(reverse("password-reset"), {"email": "nobody@example.com"}, format="json")
    # Same 200 as a known email, and no mail sent.
    assert resp.status_code == 200
    assert len(mail.outbox) == 0


@pytest.mark.django_db
def test_password_reset_confirm_rejects_wrong_code(client):
    User.objects.create_user(email="wrong@example.com", password="old-pass-1234")
    client.post(reverse("password-reset"), {"email": "wrong@example.com"}, format="json")

    resp = client.post(
        reverse("password-reset-confirm"),
        {"email": "wrong@example.com", "code": "000000", "new_password": "brand-new-9988"},
        format="json",
    )
    assert resp.status_code == 400


@pytest.mark.django_db
def test_password_reset_code_is_single_use(client):
    user = User.objects.create_user(email="single@example.com", password="old-pass-1234")
    client.post(reverse("password-reset"), {"email": "single@example.com"}, format="json")
    code = PasswordResetCode.objects.get(user=user).code

    first = client.post(
        reverse("password-reset-confirm"),
        {"email": "single@example.com", "code": code, "new_password": "brand-new-9988"},
        format="json",
    )
    assert first.status_code == 200

    # Reusing the same code fails.
    second = client.post(
        reverse("password-reset-confirm"),
        {"email": "single@example.com", "code": code, "new_password": "another-pass-7766"},
        format="json",
    )
    assert second.status_code == 400
