from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt, datetime
from db import get_db_connection

auth = Blueprint("auth", __name__)
SECRET_KEY = "thansohoc_secret_key"  # nhớ chuyển .env khi deploy

def make_token(user_id: int):
    payload = {"user_id": user_id, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

@auth.post("/api/register")
def register():
    data = request.get_json() or {}
    full_name = data.get("full_name", "").strip()
    email     = (data.get("email") or "").strip().lower()
    password  = data.get("password", "")
    gender    = data.get("gender", "Khác")
    role      = "User"

    if not full_name or not email or not password:
        return jsonify({"message": "Thiếu thông tin bắt buộc"}), 400

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT user_id FROM users WHERE email=%s", (email,))
    if cur.fetchone():  # ✅ fix chỗ này
        cur.close(); conn.close()
        return jsonify({"message": "Email đã tồn tại"}), 409

    password_hash = generate_password_hash(password)
    cur.execute(
        "INSERT INTO users (full_name, email, password, gender, role) VALUES (%s, %s, %s, %s, %s)",
        (full_name, email, password_hash, gender, role)
    )
    conn.commit()
    user_id = cur.lastrowid
    # sau khi tạo user
    cur.execute(
        "INSERT IGNORE INTO wallets (user_id, balance) VALUES (%s, 0)",
        (user_id,)
)

    cur.close(); conn.close()

    token = make_token(user_id)
    return jsonify({"token": token, "user": {"user_id": user_id, "full_name": full_name, "email": email, "gender": gender, "role": role}}), 201

@auth.post("/api/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"message": "Thiếu email hoặc mật khẩu"}), 400

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cur.fetchone()
    cur.close(); conn.close()

    if not user:
        return jsonify({"message": "Sai email hoặc mật khẩu"}), 401

    stored = user["password"]
    ok = False
    try: ok = check_password_hash(stored, password)
    except Exception: ok = (stored == password)

    if not ok:
        return jsonify({"message": "Sai email hoặc mật khẩu"}), 401

    token = make_token(user["user_id"])
    return jsonify({
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "gender": user.get("gender", "Khác"),
            "role": (user.get("role") or "user").lower()

        }
    }), 200
