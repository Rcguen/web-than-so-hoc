import requests from dotenv 

URL = "http://localhost:5000/api/ai/full-report"

payload = {
    "name": "Nguyễn Quốc Vương",
    "birth_date": "2004-10-04",
    "email": "test@gmail.com",
    "numbers": {
        "life_path": 3,
        "destiny": 5,
        "soul": 7,
        "personality": 1
    }
}

r = requests.post(URL, json=payload)
print(r.status_code)
print(r.json())
