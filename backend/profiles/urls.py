from django.urls import path
from .views import ExtractProfileView, WorkerProfileListView,ParseSearchQueryView

urlpatterns = [
    path('extract-profile/', ExtractProfileView.as_view(), name='extract-profile'),
    path('profiles/', WorkerProfileListView.as_view(), name='profile-list'),
    path('parse-search/', ParseSearchQueryView.as_view(), name='parse-search'),
]