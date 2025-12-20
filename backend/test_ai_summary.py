import requests

URL = "http://127.0.0.1:5000/api/ai/summary"

payload = {
    "name": "Nguyễn Văn A",
    "birth_date": "1999-08-25",
    "numbers": {
        "life_path": 5,
        "destiny": 3,
        "soul": 7,
        "personality": 1
    }
}

res = requests.post(URL, json=payload)

print("Status code:", res.status_code)
print("Raw response text:")
print(res.text)   # 🔥 IN RA TEXT THÔ
