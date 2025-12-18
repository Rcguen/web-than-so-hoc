import requests
import json

URL = "http://localhost:5000/api/knowledge"

payload = {
    "life_path": 3,
    "destiny": 5,
    "soul": 7,
    "personality": 1
}

print("📤 Gửi request:")
print(json.dumps(payload, indent=2, ensure_ascii=False))

response = requests.post(URL, json=payload)

print("\n📥 Response status:", response.status_code)
print("📥 Dữ liệu trả về:")

print(json.dumps(response.json(), indent=2, ensure_ascii=False))
