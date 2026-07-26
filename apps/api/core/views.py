"""Cross-cutting views that don't belong to a single domain app."""

from django.db import connection
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthView(APIView):
    """Liveness/readiness probe: reports app status and database connectivity."""

    permission_classes = [AllowAny]

    @extend_schema(
        summary="Health check",
        responses={200: None, 503: None},
    )
    def get(self, request: Request) -> Response:
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            db_ok = True
        except Exception:
            db_ok = False

        payload = {"status": "ok" if db_ok else "degraded", "database": db_ok}
        code = status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(payload, status=code)
