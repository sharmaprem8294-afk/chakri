from django.contrib import admin
from .models import WorkerProfile


@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'profession', 'experience_years', 'location', 'created_at')
    search_fields = ('name', 'profession', 'location')
