"""Auth views: register, and the current-user endpoint.

Login (obtain token), refresh, and logout (blacklist) are wired directly to
simplejwt's views in accounts/urls.py.
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PasswordResetCode
from .serializers import (
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Create a new account. Public."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    """Return the authenticated user."""

    @extend_schema(responses=UserSerializer)
    def get(self, request: Request) -> Response:
        return Response(UserSerializer(request.user).data)


class PasswordResetRequestView(APIView):
    """Email a 6-digit reset code. Public.

    Always returns 200 regardless of whether the email exists, so the endpoint
    can't be used to enumerate accounts.
    """

    permission_classes = [permissions.AllowAny]

    @extend_schema(request=PasswordResetRequestSerializer, responses={200: None})
    def post(self, request: Request) -> Response:
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user is not None:
            reset = PasswordResetCode.objects.create(user=user)
            send_mail(
                subject="Dein Ferien Budget Code",
                message=(
                    f"Dein Code zum Zurücksetzen des Passworts lautet: {reset.code}\n\n"
                    f"Er ist {settings.PASSWORD_RESET_CODE_TTL_MINUTES} Minuten gültig. "
                    "Wenn du das nicht angefordert hast, ignoriere diese E-Mail."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )

        return Response(status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """Verify a reset code and set a new password. Public."""

    permission_classes = [permissions.AllowAny]

    @extend_schema(request=PasswordResetConfirmSerializer, responses={200: None, 400: None})
    def post(self, request: Request) -> Response:
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        code = serializer.validated_data["code"]
        new_password = serializer.validated_data["new_password"]

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        reset = (
            PasswordResetCode.objects.filter(user=user, code=code, used_at__isnull=True)
            .order_by("-created_at")
            .first()
            if user
            else None
        )

        if reset is None or not reset.is_valid():
            return Response(
                {"code": ["Ungültiger oder abgelaufener Code."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save(update_fields=["password"])
        reset.used_at = timezone.now()
        reset.save(update_fields=["used_at"])
        # Invalidate any other outstanding codes for this user.
        PasswordResetCode.objects.filter(user=user, used_at__isnull=True).update(
            used_at=timezone.now()
        )

        return Response(status=status.HTTP_200_OK)
