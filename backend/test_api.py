import requests
import json

url = "http://127.0.0.1:8000/chat"
headers = {
    "Content-Type": "application/json",
    "X-API-KEY": "railmind-hackathon-2026"
}
data = {
    "message": "Is train 12301 delayed today?"
}

print("Pinging FastAPI server...")
try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
