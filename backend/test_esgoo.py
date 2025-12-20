import requests
import json

url = "http://127.0.0.1:5000/api/numerology/external/Nguyễn Văn A/25-12-1985"

res = requests.get(url)

print("Status:", res.status_code)
print(json.dumps(res.json(), indent=2, ensure_ascii=False))
