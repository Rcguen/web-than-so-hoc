from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt, datetime

from db import get_db_connection  # đã có sẵn từ trước

auth = Blueprint("auth", __name__)

# ⚠️ Đổi khoá bí mật này ở môi trường thật
SECRET_KEY = "thansohoc_secret_key"

def make_token(user_id: int):
    """Tạo JWT token hết hạn sau 2 giờ"""
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

@auth.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    full_name = data.get("full_name", "").strip()
    email     = data.get("email", "").strip().lower()
    password  = data.get("password", "")
    gender    = data.get("gender", "Khác")
    role      = "User"  # mặc định

    if not full_name or not email or not password:
        return jsonify({"message": "Thiếu thông tin bắt buộc"}), 400

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    # Kiểm tra email tồn tại
    cur.execute("SELECT user_id FROM users WHERE email=%s", (email,))
    if cur.fetchone():
        cur.close(); conn.close()
        return jsonify({"message": "Email đã tồn tại"}), 400

    # Khuyến nghị: lưu mật khẩu dạng hash
    password_hash = generate_password_hash(password)

    cur.execute(
        """
        INSERT INTO users (full_name, email, password, gender, role)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (full_name, email, password_hash, gender, role)
    )
    conn.commit()
    user_id = cur.lastrowid

    cur.close(); conn.close()

    return jsonify({"message": "Đăng ký thành công", "user_id": user_id}), 201


@auth.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"message": "Thiếu email hoặc mật khẩu"}), 400

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cur.fetchone()
    cur.close(); conn.close()

    if not user:
        return jsonify({"message": "Sai email hoặc mật khẩu"}), 401

    stored_pw = user["password"]

    # Cho phép đăng nhập cả 2 trường hợp:
    # 1) mật khẩu đã được hash (mới đăng ký)
    # 2) mật khẩu thuần (nếu DB đang có dữ liệu cũ) – THẦY GIỮ LẠI để em test nhanh
    ok = False
    try:
        # thử check theo hash
        ok = check_password_hash(stored_pw, password)
    except Exception:
        ok = False

    if not ok:
        # fallback: nếu stored_pw là plain text trùng
        ok = (stored_pw == password)

    if not ok:
        return jsonify({"message": "Sai email hoặc mật khẩu"}), 401

    token = make_token(user["user_id"])

    # Trả về đúng shape mà frontend đang kỳ vọng:
    return jsonify({
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "gender": user.get("gender", "Khác"),
            "role": user.get("role", "User"),
            "created_at": user.get("created_at")
        }
    }), 200


# (Tuỳ chọn) Lấy thông tin user từ token để hiện "Hồ sơ"
@auth.route("/api/me", methods=["GET"])
def me():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"message": "Thiếu token"}), 401

    token = auth_header.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token hết hạn"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Token không hợp lệ"}), 401

    user_id = payload["user_id"]

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT user_id, full_name, email, gender, role, created_at FROM users WHERE user_id=%s", (user_id,))
    user = cur.fetchone()
    cur.close(); conn.close()

    if not user:
        return jsonify({"message": "Không tìm thấy user"}), 404

    return jsonify({"user": user})