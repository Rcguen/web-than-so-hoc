import os
import uuid
import jwt
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from db import get_db_connection
from auth import SECRET_KEY   # đảm bảo SECRET_KEY đúng file của em

profile = Blueprint("profile", __name__)

# ===============================
# CONFIG
# ===============================
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


# ===============================
# JWT HELPER
# ===============================
def get_user_id_from_token():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload.get("user_id")
    except Exception:
        return None


# ===============================
# GET PROFILE
# ===============================
@profile.get("/api/profile")
def get_profile():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT user_id, full_name, email, gender, role,
               avatar_url, phone, address
        FROM users
        WHERE user_id = %s
    """, (user_id,))
    user = cur.fetchone()

    cur.close()
    conn.close()

    if not user:
        return jsonify({"message": "User not found"}), 404

    user["role"] = (user.get("role") or "user").lower()
    return jsonify({"user": user}), 200


# ===============================
# UPDATE PROFILE (TEXT INFO)
# ===============================
@profile.put("/api/profile")
def update_profile():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json() or {}

    full_name = (data.get("full_name") or "").strip()
    gender = (data.get("gender") or "Khác").strip()
    phone = (data.get("phone") or "").strip()
    address = (data.get("address") or "").strip()

    if not full_name:
        return jsonify({"message": "Họ tên không được để trống"}), 400

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        UPDATE users
        SET full_name=%s, gender=%s, phone=%s, address=%s
        WHERE user_id=%s
    """, (
        full_name,
        gender,
        phone or None,
        address or None,
        user_id
    ))
    conn.commit()

    cur.execute("""
        SELECT user_id, full_name, email, gender, role,
               avatar_url, phone, address
        FROM users
        WHERE user_id = %s
    """, (user_id,))
    user = cur.fetchone()

    cur.close()
    conn.close()

    user["role"] = (user.get("role") or "user").lower()
    return jsonify({
        "message": "Cập nhật hồ sơ thành công",
        "user": user
    }), 200


# ===============================
# UPLOAD AVATAR
# ===============================
@profile.post("/api/profile/avatar")
def upload_avatar():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    if "avatar" not in request.files:
        return jsonify({"message": "Không có file avatar"}), 400

    file = request.files["avatar"]

    if file.filename == "":
        return jsonify({"message": "File không hợp lệ"}), 400

    if not allowed_file(file.filename):
        return jsonify({"message": "Chỉ cho phép png / jpg / jpeg / webp"}), 400

    # Tạo tên file an toàn + unique
    safe_name = secure_filename(file.filename)
    ext = safe_name.rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"

    upload_dir = current_app.config.get("UPLOAD_FOLDER")
    if not upload_dir:
        return jsonify({"message": "Server chưa cấu hình UPLOAD_FOLDER"}), 500

    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, filename)
    file.save(filepath)

    avatar_url = f"/uploads/avatars/{filename}"

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute(
        "UPDATE users SET avatar_url=%s WHERE user_id=%s",
        (avatar_url, user_id)
    )
    conn.commit()

    cur.execute("""
        SELECT user_id, full_name, email, gender, role,
               avatar_url, phone, address
        FROM users
        WHERE user_id = %s
    """, (user_id,))
    user = cur.fetchone()

    cur.close()
    conn.close()

    user["role"] = (user.get("role") or "user").lower()

    return jsonify({
        "message": "Upload avatar thành công",
        "user": user
    }), 200
