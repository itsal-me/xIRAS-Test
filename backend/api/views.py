
from django.http import JsonResponse
from rest_framework.decorators import api_view
import requests

import os
from dotenv import load_dotenv

load_dotenv()

API_TOKEN_URL = os.getenv("API_TOKEN_URL")
STUDENT_DETAILS_URL = os.getenv("STUDENT_DETAILS_URL")

@api_view(["POST"])
def get_access_token(request):
    username = request.data.get("username")
    password = request.data.get("password")

    headers = {
        "Content-Type": "application/json",
        "Origin": "https://irasv1.iub.edu.bd",
        "Referer": "https://irasv1.iub.edu.bd/"
    }

    if not username or not password:
        return JsonResponse({"error": "Email and password are required"}, status=400)

    response = requests.post(API_TOKEN_URL, json={"email": username, "password": password}, headers=headers)

    if response.status_code == 200:
        return JsonResponse(response.json())
    return JsonResponse({"error": "Invalid credentials"}, status=response.status_code)




@api_view(["GET"])
def get_student_details(request, student_id):
    access_token = request.headers.get("Authorization")  # Get token from frontend request

    if not access_token:
        return JsonResponse({"error": "Missing access token"}, status=401)

    # Forward the request to the external student details API
    headers = {"Authorization": access_token}  # Use the same token received
    response = requests.get(STUDENT_DETAILS_URL.format(student_id), headers=headers)

    if response.status_code == 200:
        return JsonResponse(response.json())  # Return student data
    return JsonResponse({"error": "Failed to fetch student details"}, status=response.status_code)
