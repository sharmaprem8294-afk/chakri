from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from .models import WorkerProfile
from .serializers import TranscriptInputSerializer, WorkerProfileSerializer
from .services import extract_profile_fields


class ExtractProfileView(APIView):
    """POST { "transcript": "..." } -> structured profile fields,
    saved as a WorkerProfile row and returned to the frontend."""

    def post(self, request):
        input_serializer = TranscriptInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        transcript = input_serializer.validated_data['transcript']

        fields = extract_profile_fields(transcript)

        profile = WorkerProfile.objects.create(
            name=fields.get('name'),
            profession=fields.get('profession'),
            experience_years=fields.get('experience_years'),
            location=fields.get('location'),
            skills=fields.get('skills') or [],
            raw_transcript=transcript,
        )

        output_serializer = WorkerProfileSerializer(profile)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
class WorkerProfileListView(ListAPIView):
    serializer_class = WorkerProfileSerializer

    def get_queryset(self):
        queryset = WorkerProfile.objects.all().order_by('-id')

        role = self.request.query_params.get('role')
        min_experience = self.request.query_params.get('min_experience')
        location = self.request.query_params.get('location')   # ADD THIS LINE

        if role:
            queryset = queryset.filter(profession__icontains=role)

        if min_experience:
            queryset = queryset.filter(experience_years__gte=min_experience)

        if location:                                            # ADD THIS BLOCK
            queryset = queryset.filter(location__icontains=location)

        return queryset
class ParseSearchQueryView(APIView):
    """POST { "transcript": "..." } -> structured search filters
    (role, experience, location) extracted from spoken text.
    Nothing is saved — this is search, not registration."""

    def post(self, request):
        input_serializer = TranscriptInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        transcript = input_serializer.validated_data['transcript']

        fields = extract_profile_fields(transcript)

        return Response({
            'role': fields.get('profession'),
            'min_experience': fields.get('experience_years'),
            'location': fields.get('location'),
        })
