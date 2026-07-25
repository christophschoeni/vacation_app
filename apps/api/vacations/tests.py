"""Smoke tests for the Phase 1 backend skeleton."""

from datetime import date
from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Expense, Vacation


@pytest.mark.django_db
def test_health_endpoint_reports_ok():
    client = APIClient()
    response = client.get(reverse("health"))
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": True}


@pytest.mark.django_db
def test_schema_endpoint_serves_openapi():
    client = APIClient()
    response = client.get(reverse("schema"))
    assert response.status_code == 200


@pytest.mark.django_db
def test_vacation_and_expense_persist_with_cascade():
    vacation = Vacation.objects.create(
        destination="Lisbon",
        country="Portugal",
        hotel="Hotel Alfama",
        start_date=date(2026, 8, 1),
        end_date=date(2026, 8, 10),
        budget=Decimal("2000.00"),
        currency="EUR",
    )
    Expense.objects.create(
        vacation=vacation,
        amount=Decimal("42.50"),
        currency="EUR",
        amount_chf=Decimal("40.00"),
        category="food",
        description="Dinner",
        date=date(2026, 8, 2),
    )
    assert vacation.expenses.count() == 1

    # BaseModel gives every row a UUID id and timestamps.
    assert vacation.id is not None
    assert vacation.created_at is not None
    assert vacation.deleted_at is None

    # Cascade delete removes dependent expenses.
    vacation.delete()
    assert Expense.objects.count() == 0
