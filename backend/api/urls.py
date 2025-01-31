from django.urls import path
from .views import get_access_token, get_student_details

urlpatterns = [
    path("token/", get_access_token, name="get_access_token"),
    path("student-details/<str:student_id>/", get_student_details, name="get_student_details"),
]
