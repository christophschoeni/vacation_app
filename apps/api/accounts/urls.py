"""Auth routes under /api/auth/."""

from django.urls import path
from rest_framework_simplejwt.views import (
    TokenBlacklistView,
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import MeView, RegisterView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    # Login: POST {email, password} -> {access, refresh}
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    # Logout: POST {refresh} -> blacklists the refresh token
    path("logout/", TokenBlacklistView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
]
