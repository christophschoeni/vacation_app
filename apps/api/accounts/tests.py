"""Auth flow tests: register, login, refresh, /me, and access control."""

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

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
