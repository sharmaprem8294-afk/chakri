from rest_framework import serializers
from .models import WorkerProfile


class WorkerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerProfile
        fields = ['id', 'name', 'profession', 'experience_years', 'location', 'skills', 'created_at']


class TranscriptInputSerializer(serializers.Serializer):
    transcript = serializers.CharField(allow_blank=False, trim_whitespace=True)
