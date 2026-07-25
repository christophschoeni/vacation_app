from django.contrib import admin

from .models import Expense, Vacation


@admin.register(Vacation)
class VacationAdmin(admin.ModelAdmin):
    list_display = ("destination", "country", "start_date", "end_date", "currency")
    list_filter = ("country", "currency")
    search_fields = ("destination", "country", "hotel")
    date_hierarchy = "start_date"


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("description", "amount", "currency", "category", "date", "vacation")
    list_filter = ("category", "currency")
    search_fields = ("description",)
    date_hierarchy = "date"
    raw_id_fields = ("vacation",)
