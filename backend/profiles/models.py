from django.db import models


class WorkerProfile(models.Model):
    name = models.CharField(max_length=120, blank=True, null=True)
    profession = models.CharField(max_length=120, blank=True, null=True)
    experience_years = models.CharField(max_length=50, blank=True, null=True)
    location = models.CharField(max_length=120, blank=True, null=True)
    skills = models.JSONField(blank=True, null=True, default=list)
    raw_transcript = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name or 'Unknown'} — {self.profession or 'N/A'}"
