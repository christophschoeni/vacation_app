"""Domain models mirrored from the app's Drizzle schema (lib/db/schema.ts).

Field names and semantics track the on-device SQLite schema so the sync layer
(Phase 3) can map rows directly. Monetary amounts are stored as decimals here
(Postgres) even though the app uses SQLite REAL — the server is the source of
truth for money and should not carry float rounding error.

A user/owner FK is intentionally absent: accounts arrive in Phase 2, at which
point these gain an `owner` (and, for collaboration, a membership model).
"""

from decimal import Decimal

from django.conf import settings
from django.db import models

from core.models import BaseModel


class ExpenseCategory(models.TextChoices):
    TRANSPORT = "transport", "Transport"
    ACCOMMODATION = "accommodation", "Accommodation"
    FOOD = "food", "Food"
    ENTERTAINMENT = "entertainment", "Entertainment"
    SHOPPING = "shopping", "Shopping"
    OTHER = "other", "Other"


class Vacation(BaseModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vacations",
    )
    destination = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    hotel = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    budget = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    # Currency the budget is expressed in (the user's system currency).
    budget_currency = models.CharField(max_length=3, default="CHF")
    # Currency used for this vacation's expenses.
    currency = models.CharField(max_length=3, default="CHF")
    image_url = models.URLField(max_length=1024, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["start_date"]),
            models.Index(fields=["country"]),
        ]

    def __str__(self) -> str:
        return f"{self.destination} ({self.start_date}–{self.end_date})"


class Expense(BaseModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="expenses",
    )
    vacation = models.ForeignKey(
        Vacation,
        on_delete=models.CASCADE,
        related_name="expenses",
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3)
    # Amount converted to the system reference currency (CHF), stored so reports
    # don't depend on live FX. Named amount_chf to match the app's schema.
    amount_chf = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(
        max_length=20,
        choices=ExpenseCategory.choices,
        default=ExpenseCategory.OTHER,
    )
    description = models.TextField()
    date = models.DateField()
    image_url = models.URLField(max_length=1024, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["vacation"]),
            models.Index(fields=["category"]),
            models.Index(fields=["date"]),
        ]

    def __str__(self) -> str:
        return f"{self.description}: {self.amount} {self.currency}"

    @property
    def amount_decimal(self) -> Decimal:
        return self.amount
