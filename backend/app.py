from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import requests
from db import get_db_connection
from auth import auth
from datetime import datetime, timedelta
from shop.product_routes import product_routes
from shop.category_routes import category_routes
from flask import send_from_directory
import os
import hmac
import hashlib
from shop.order_routes import order_routes
from shop.profile_routes import profile
from shipping.shipping_routes import shipping_routes
from dotenv import load_dotenv
from services.vnpay_service import create_vnpay_url
from services.momo_service import create_momo_payment

from services.pdf_loader import load_pdf_pages

from services.pdf_service import generate_numerology_pdf
from services.mail_service import send_numerology_pdf
from services.ai_service import build_summary_prompt, call_gemini, generate_summary_report

from routes.knowledge_routes import knowledge_bp
from routes.ai_routes import ai_bp
from routes.numerology_routes import external_bp
from routes.love_routes import love_bp


# =====================================================
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
app = Flask(__name__)   

CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "avatars")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def create_app():
    app = Flask(__name__)   

    CORS(app)
    app.register_blueprint(auth)
    app.register_blueprint(profile)
    app.register_blueprint(product_routes, url_prefix="/api")
    app.register_blueprint(category_routes, url_prefix="/api")
    app.register_blueprint(order_routes, url_prefix="/api")
    app.register_blueprint(shipping_routes, url_prefix="/api")
    app.register_blueprint(knowledge_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(external_bp)
    app.register_blueprint(love_bp)

    app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
    app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024  # 2MB

    @app.get("/")
    def health():
        return {"status": "ok"}, 200
    return app
# =====================================================
# 🔢 1. HÀM TÍNH TOÁN BIỂU ĐỒ SINH MỆNH (Pythagoras)
# =====================================================
def compute_birth_chart_counts(birth_date: str):
    digits = [int(ch) for ch in birth_date if ch.isdigit()]
    counts = {i: 0 for i in range(1, 10)}
    for d in digits:
        if 1 <= d <= 9:
            counts[d] += 1
    return counts

def compute_arrows(counts: dict):
    """Tính 7 cặp mũi tên mạnh – yếu + 1 mũi tên kế hoạch (1–2–3)."""
    pair_specs = [
        {"seq": [1, 5, 9], "strong": "Quyết tâm (1–5–9)",         "weak": "Trì hoãn – trống 1–5–9"},
        {"seq": [3, 5, 7], "strong": "Tâm linh (3–5–7)",          "weak": "Hoài nghi – trống 3–5–7"},
        {"seq": [3, 6, 9], "strong": "Trí tuệ (3–6–9)",           "weak": "Trí nhớ ngắn hạn – trống 3–6–9"},
        {"seq": [2, 5, 8], "strong": "Cân bằng cảm xúc (2–5–8)",  "weak": "Nhạy cảm – trống 2–5–8"},
        {"seq": [4, 5, 6], "strong": "Ý chí (4–5–6)",             "weak": "Uất giận – trống 4–5–6"},
        {"seq": [7, 8, 9], "strong": "Hoạt động/Xã hội (7–8–9)",  "weak": "Thụ động – trống 7–8–9"},
        {"seq": [1, 4, 7], "strong": "Thực tế (1–4–7)",           "weak": "Thiếu trật tự – trống 1–4–7"},
    ]

    plan_spec = {"seq": [1, 2, 3], "strong": "Kế hoạch (1–2–3)"}
    arrows_strong, arrows_weak = [], []

    for spec in pair_specs:
        seq = spec["seq"]
        if all(counts[n] > 0 for n in seq):
            arrows_strong.append(spec["strong"])
        elif all(counts[n] == 0 for n in seq):
            arrows_weak.append(spec["weak"])

    if all(counts[n] > 0 for n in plan_spec["seq"]):
        arrows_strong.append(plan_spec["strong"])

    return arrows_strong, arrows_weak

@app.route("/api/numerology/birth-chart", methods=["POST"])
def birth_chart():
    data = request.get_json() or {}
    birth_date = data.get("birth_date")
    if not birth_date:
        return jsonify({"error": "Missing birth_date"}), 400

    counts = compute_birth_chart_counts(birth_date)
    arrows_strong, arrows_weak = compute_arrows(counts)

    return jsonify({
        "chart": counts,
        "arrows": {
            "strong": arrows_strong,
            "weak": arrows_weak
        }
    })

@app.route("/api/numerology/name-chart", methods=["POST"])
def name_chart():
    data = request.get_json() or {}
    name = data.get("name")
    if not name:
        return jsonify({"error": "Missing name"}), 400

    # Tạo bản đồ chữ cái -> số (giống Destiny Number)
    letter_map = {
        **dict.fromkeys("aijqy", 1), **dict.fromkeys("bkr", 2),
        **dict.fromkeys("clgs", 3), **dict.fromkeys("dmt", 4),
        **dict.fromkeys("ehnx", 5), **dict.fromkeys("uvw", 6),
        **dict.fromkeys("oz", 7), **dict.fromkeys("fp", 8),
    }

    # Đếm số lần xuất hiện 1–9
    letters = [c.lower() for c in name if c.isalpha()]
    counts = {i: 0 for i in range(1, 10)}
    for c in letters:
        val = letter_map.get(c, 0)
        if val:
            counts[val] += 1

    # Dùng lại hàm tính mũi tên đã có
    arrows_strong, arrows_weak = compute_arrows(counts)

    return jsonify({
        "chart": counts,
        "arrows": {
            "strong": arrows_strong,
            "weak": arrows_weak
        }
    })

@app.route("/api/numerology/life-pinnacles", methods=["POST"])
def life_pinnacles():
    """
    Tính 4 đỉnh cao cuộc đời (Pinnacles) và 4 thử thách (Challenges)
    dựa trên ngày sinh theo trường phái Pythagoras.
    """
    data = request.get_json() or {}
    birth_date = data.get("birth_date")
    if not birth_date:
        return jsonify({"error": "Thiếu birth_date"}), 400

    try:
        year, month, day = map(int, birth_date.split("-"))
    except:
        return jsonify({"error": "Định dạng ngày sinh không hợp lệ (YYYY-MM-DD)"}), 400

    def r(num):
        while num > 9 and num not in (11, 22, 33):
            num = sum(int(c) for c in str(num))
        return num

    # Gộp các phần số học
    day_r, month_r, year_r = r(day), r(month), r(sum(int(c) for c in str(year)))

    # Tính 4 đỉnh cao
    pinnacle_1 = r(day_r + month_r)
    pinnacle_2 = r(day_r + year_r)
    pinnacle_3 = r(pinnacle_1 + pinnacle_2)
    pinnacle_4 = r(month_r + year_r)

    # Tính 4 thử thách
    challenge_1 = abs(day_r - month_r)
    challenge_2 = abs(day_r - year_r)
    challenge_3 = abs(challenge_1 - challenge_2)
    challenge_4 = abs(month_r - year_r)

    # Độ tuổi đạt đỉnh
    ages = [28, 37, 46, 55]

    return jsonify({
        "birth_date": birth_date,
        "pinnacles": [
            {"index": 1, "value": pinnacle_1, "age": ages[0]},
            {"index": 2, "value": pinnacle_2, "age": ages[1]},
            {"index": 3, "value": pinnacle_3, "age": ages[2]},
            {"index": 4, "value": pinnacle_4, "age": ages[3]},
        ],
        "challenges": [
            {"index": 1, "value": challenge_1},
            {"index": 2, "value": challenge_2},
            {"index": 3, "value": challenge_3},
            {"index": 4, "value": challenge_4},
        ]
    })



# =====================================================
# 🌙 2. CÔNG CỤ HỖ TRỢ TÍNH TOÁN 6 CHỈ SỐ CHÍNH
# =====================================================
def reduce_number(num):
    while num > 9 and num not in (11, 22, 33):
        num = sum(int(d) for d in str(num))
    return num

def calculate_from_name(name):
    letters = [c.upper() for c in name if c.isalpha()]
    values = { 
        **dict.fromkeys("AJS", 1), **dict.fromkeys("BKT", 2), **dict.fromkeys("CLU", 3),
        **dict.fromkeys("DMV", 4), **dict.fromkeys("ENW", 5), **dict.fromkeys("FOX", 6),
        **dict.fromkeys("GPY", 7), **dict.fromkeys("HQZ", 8), **dict.fromkeys("IR", 9)
    }
    nums = [values[c] for c in letters if c in values]
    return nums

# =====================================================
# 🔮 3. API TÍNH TOÁN KẾT QUẢ THẦN SỐ HỌC
# =====================================================
@app.route('/api/numerology/calculate', methods=['POST'])
def calculate_numerology():
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        birth_date = data.get('birth_date', '').strip()
        user_id = data.get('user_id')

        if not name or not birth_date:
            return jsonify({'error': 'Thiếu họ tên hoặc ngày sinh'}), 400

        # --- Các chỉ số ---
        digits = [int(ch) for ch in birth_date if ch.isdigit()]
        life_path = reduce_number(sum(digits))

        letters = [c.lower() for c in name if c.isalpha()]
        letter_map = {
            **dict.fromkeys("aijqy", 1), **dict.fromkeys("bkr", 2),
            **dict.fromkeys("clgs", 3), **dict.fromkeys("dmt", 4),
            **dict.fromkeys("ehnx", 5), **dict.fromkeys("uvw", 6),
            **dict.fromkeys("oz", 7), **dict.fromkeys("fp", 8),
        }

        total = sum(letter_map.get(c, 0) for c in letters)
        destiny = reduce_number(total)

        vowels = [c for c in letters if c in "aeiou"]
        soul = reduce_number(sum(letter_map.get(c, 0) for c in vowels))

        consonants = [c for c in letters if c not in "aeiou"]
        personality = reduce_number(sum(letter_map.get(c, 0) for c in consonants))

        day = int(birth_date.split('-')[2])
        birthday = day if day <= 9 or day in (11, 22) else reduce_number(day)

        maturity = reduce_number(life_path + destiny)

        # --- Lưu DB ---
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO numerology_results 
            (user_id, name, birth_date, category, life_path_number, destiny_number, soul_number, summary)
            VALUES (%s, %s, %s, 'lookup', %s, %s, %s, %s)
        """, (
            user_id, name, birth_date, life_path, destiny, soul,
            f"LifePath={life_path}, Destiny={destiny}, Soul={soul}"
        ))
        conn.commit(); cursor.close(); conn.close()

        return jsonify({
            'name': name, 'birthDate': birth_date,
            'lifePath': life_path, 'destiny': destiny,
            'soul': soul, 'personality': personality,
            'birthday': birthday, 'maturity': maturity
        })
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# =====================================================
# 🕰️ 4. LỊCH SỬ TRA CỨU
# =====================================================
@app.route("/api/numerology/history/<int:user_id>", methods=["GET"])
def get_history(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT result_id, name, birth_date, life_path_number, destiny_number, soul_number, summary, created_at
        FROM numerology_results
        WHERE user_id = %s ORDER BY created_at DESC
    """, (user_id,))
    results = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify(results)

# =====================================================
# 📘 5. LẤY Ý NGHĨA CỦA CÁC CHỈ SỐ
# =====================================================
@app.route('/api/numerology/meaning/<string:category>/<int:number>', methods=['GET'])
def get_numerology_meaning(category, number):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM numerology_meanings
            WHERE category = %s AND number = %s
            LIMIT 1
        """, (category, number))
        meaning = cursor.fetchone()
        cursor.close(); conn.close()

        if meaning:
            return jsonify({
                "number": meaning["number"],
                "title": meaning["title"],
                "description": meaning["description"],
                "category": meaning["category"]
            })
        else:
            return jsonify({
                "number": number,
                "title": f"Ý nghĩa số {number}",
                "description": "Chưa có mô tả trong cơ sở dữ liệu.",
                "category": category
            })
    except Exception as e:
        print("Lỗi API /meaning:", e)
        return jsonify({"error": str(e)}), 500

# =====================================================
# ❤️ 6. HEALTH CHECK
# =====================================================
@app.get("/api/health")
def health():
    return jsonify({"status": "ok"}), 200

@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    upload_folder = os.path.join(os.getcwd(), 'uploads')
    return send_from_directory(upload_folder, filename)

# Cho phép truy cập ảnh
@app.route("/uploads/avatars/<filename>")
def uploaded_avatar(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


@app.get("/api/numerology/details/<int:result_id>")
def get_numerology_details(result_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    # 1️⃣ Lấy thông tin chính
    cur.execute("""
        SELECT *
        FROM numerology_results
        WHERE result_id = %s
    """, (result_id,))
    info = cur.fetchone()

    if not info:
        return jsonify({"error": "NOT_FOUND"}), 404

    # 2️⃣ Lấy diễn giải
    cur.execute("""
        SELECT title, number, description
        FROM numerology_meanings
        WHERE number IN (%s, %s, %s)
    """, (
        info["life_path_number"],
        info["destiny_number"],
        info["soul_number"]
    ))

    meanings = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify({
        "info": info,
        "meanings": meanings
    })





@app.route("/api/admin/dashboard")
def admin_dashboard():
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)

        # Tổng user
        cur.execute("SELECT COUNT(*) AS total FROM users")
        total_users = cur.fetchone()["total"]

        # Tổng lượt tra cứu
        cur.execute("SELECT COUNT(*) AS total FROM numerology_results")
        total_lookups = cur.fetchone()["total"]

        # Thống kê life path
        cur.execute("""
            SELECT life_path_number, COUNT(*) AS total
            FROM numerology_results
            WHERE life_path_number IS NOT NULL
            GROUP BY life_path_number
            ORDER BY life_path_number
        """)
        life_path_stats = cur.fetchall()

        # Lookup theo ngày
        cur.execute("""
            SELECT DATE(created_at) AS date, COUNT(*) AS total
            FROM numerology_results
            GROUP BY DATE(created_at)
            ORDER BY date
        """)
        lookup_by_day = cur.fetchall()

        # Orders theo ngày
        cur.execute("""
            SELECT DATE(created_at) AS date, COUNT(*) AS total
            FROM orders
            GROUP BY DATE(created_at)
            ORDER BY date
        """)
        orders_by_day = cur.fetchall()

        return jsonify({
            "total_users": total_users,
            "total_lookups": total_lookups,
            "life_path_stats": life_path_stats,
            "lookup_by_day": lookup_by_day,
            "orders_by_day": orders_by_day
        })

    except Exception as e:
        print("❌ Dashboard error:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        try:
            cur.close()
            conn.close()
        except:
            pass

@app.get("/api/admin/users")
def admin_get_users():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT 
            user_id,
            full_name,
            email,
            role,
            created_at,
            is_active
        FROM users
        ORDER BY user_id DESC
    """)

    users = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify({"users": users})


@app.post("/api/support/message")
def support_message():
    """Accept a support message from the frontend, save it to DB and send an email to site admin."""
    data = request.get_json() or {}
    # name & email are automatic from authenticated user; frontend does not need to send them
    message = (data.get("message") or "").strip()
    user_id = data.get("user_id")  # optional if frontend passes it

    if not message:
        return jsonify({"error": "Thiếu message"}), 400

    # Destination: use MAIL_FROM or MAIL_USER as admin inbox
    to_addr = os.getenv("SUPPORT_EMAIL") or os.getenv("MAIL_FROM") or os.getenv("MAIL_USER")
    if not to_addr:
        return jsonify({"error": "Mail chưa được cấu hình"}), 500

    try:
        # If Authorization present, prefer the authenticated user id over client-supplied user_id
        auth_header = request.headers.get('Authorization', '')
        user_name = 'Khách'
        user_email = None
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1].strip()
            try:
                import jwt
                from auth import SECRET_KEY
                payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
                user_id = payload.get('user_id')
                # fetch user info
                tmp_conn = get_db_connection()
                tmp_cur = tmp_conn.cursor(dictionary=True)
                tmp_cur.execute("SELECT full_name, email FROM users WHERE user_id=%s", (user_id,))
                urow = tmp_cur.fetchone()
                try:
                    tmp_cur.close(); tmp_conn.close()
                except:
                    pass
                if urow:
                    user_name = urow.get('full_name') or 'Khách'
                    user_email = urow.get('email')
            except Exception:
                # ignore token errors, keep client-supplied user_id
                pass

        import secrets
        owner_secret = secrets.token_hex(16)

        # Try to insert with owner_secret; if the column doesn't exist, add it and retry
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute(
                "INSERT INTO admin_messages (user_id, user_name, message, owner_secret, status, created_at) VALUES (%s,%s,%s,%s,'new',NOW())",
                (user_id, user_name, message, owner_secret)
            )
        except Exception as ins_e:
            msg = str(ins_e)
            if "Unknown column" in msg or "1054" in msg:
                print("support_message: owner_secret column missing, attempting to add it to the table")
                try:
                    cur.execute("ALTER TABLE admin_messages ADD COLUMN owner_secret VARCHAR(64) NULL")
                    conn.commit()
                    cur.execute(
                        "INSERT INTO admin_messages (user_id, user_name, message, owner_secret, status, created_at) VALUES (%s,%s,%s,%s,'new',NOW())",
                        (user_id, user_name, message, owner_secret)
                    )
                except Exception as add_e:
                    print("support_message: failed to add owner_secret column", add_e)
                    cur.close(); conn.close()
                    return jsonify({"error": str(add_e)}), 500
            else:
                cur.close(); conn.close()
                return jsonify({"error": str(ins_e)}), 500

        inserted_id = cur.lastrowid
        conn.commit()
        cur.close(); conn.close()

        print(f"support_message: inserted id={inserted_id} owner_secret={owner_secret} user_id={user_id}")

        from services.mail_service import send_simple_mail
        subject = f"[Hỗ trợ website] Tin nhắn từ {user_name}"
        body = f"Tên: {user_name}\nEmail: {user_email or 'Không cung cấp'}\n\n{message}\n\nID tin nhắn: {inserted_id}\nOwner token: {owner_secret}"
        send_simple_mail(to_addr, subject, body)

        return jsonify({"message": "Đã gửi thông điệp đến Admin.", "id": inserted_id, "owner_secret": owner_secret})

    except Exception as e:
        print("Support message error:", e)
        try:
            cur.close(); conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500

@app.put("/api/admin/users/<int:user_id>/role")
def admin_update_user_role(user_id):
    data = request.get_json()
    role = data.get("role")

    if role not in ["User", "Admin"]:
        return jsonify({"message": "Role không hợp lệ"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "UPDATE users SET role=%s WHERE user_id=%s",
        (role, user_id)
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Cập nhật role thành công"})

@app.put("/api/admin/users/<int:user_id>/toggle")
def admin_toggle_user(user_id):
    conn = get_db_connection()
    cur = conn.cursor()


@app.get('/api/support/message/<int:msg_id>')
def get_support_message(msg_id):
    """Retrieve a support message by id.

    Access rules:
    - If message has user_id set, the requester must present a valid token with same user_id or admin
    - Otherwise, the requester can present the owner_secret query param received when creating the message
    """

    access_token = (request.args.get('access_token') or '').strip() or None

    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM admin_messages WHERE id=%s", (msg_id,))
        row = cur.fetchone()
        cur.close(); conn.close()

        if not row:
            return jsonify({"message": "Not found"}), 404

        # if access_token provided and matches owner_secret, allow
        if access_token and row.get('owner_secret') and access_token == row.get('owner_secret'):
            # do not leak owner_secret back
            filtered = {k: v for k, v in row.items() if k != 'owner_secret'}
            return jsonify(filtered)

        # if row has user_id, check token matches or allow admin
        if row.get('user_id'):
            auth_header = request.headers.get('Authorization','')
            if not auth_header.startswith('Bearer '):
                return jsonify({'message':'Unauthorized'}), 401
            token = auth_header.split(' ',1)[1].strip()
            try:
                import jwt
                from auth import SECRET_KEY
                payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
                requester_id = payload.get('user_id')
                if requester_id == row.get('user_id'):
                    filtered = {k: v for k, v in row.items() if k != 'owner_secret'}
                    return jsonify(filtered)
                # if requester is admin, allow
                conn = get_db_connection()
                cur = conn.cursor(dictionary=True)
                cur.execute("SELECT role FROM users WHERE user_id=%s", (requester_id,))
                r = cur.fetchone()
                cur.close(); conn.close()
                if r and (r.get('role') or '').lower() == 'admin':
                    filtered = {k: v for k, v in row.items() if k != 'owner_secret'}
                    return jsonify(filtered)
                return jsonify({'message':'Forbidden'}), 403
            except Exception as e:
                print('get_support_message auth error', e)
                return jsonify({'message':'Unauthorized'}), 401

        # anonymous message: only admin can fetch
        auth_header = request.headers.get('Authorization','')
        if not auth_header.startswith('Bearer '):
            return jsonify({'message':'Unauthorized'}), 401
        token = auth_header.split(' ',1)[1].strip()
        try:
            import jwt
            from auth import SECRET_KEY
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            requester_id = payload.get('user_id')
            conn = get_db_connection()
            cur = conn.cursor(dictionary=True)
            cur.execute("SELECT role FROM users WHERE user_id=%s", (requester_id,))
            r = cur.fetchone()
            cur.close(); conn.close()
            if r and (r.get('role') or '').lower() == 'admin':
                filtered = {k: v for k, v in row.items() if k != 'owner_secret'}
                return jsonify(filtered)
            return jsonify({'message':'Forbidden'}), 403
        except Exception as e:
            print('get_support_message auth error', e)
            return jsonify({'message':'Unauthorized'}), 401

    except Exception as e:
        print('get_support_message error', e)
        try:
            cur.close(); conn.close()
        except:
            pass
        return jsonify({'error':str(e)}), 500
    cur.execute("""
        UPDATE users
        SET is_active = NOT is_active
        WHERE user_id = %s
    """, (user_id,))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Đã cập nhật trạng thái user"})


#======================================================
# ADMIN CHAT
#======================================================

@app.post("/api/admin-chat")
def send_admin_chat():
    """Create a support/admin message from a user.

    Expected JSON: { user_id: int|null, name: str, message: str }
    """
    data = request.json or {}
    name = data.get("name")
    message = (data.get("message") or "").strip()
    user_id = data.get("user_id")

    if not message:
        return jsonify({"error": "Thiếu message"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO admin_messages (user_id, user_name, message, status, created_at) VALUES (%s,%s,%s,'new',NOW())",
            (user_id, name, message)
        )
        inserted_id = cur.lastrowid
        conn.commit()
        cur.close(); conn.close()

        return jsonify({"success": True, "id": inserted_id}), 201

    except Exception as e:
        print("send_admin_chat error:", e)
        try:
            cur.close()
            conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500


@app.get("/api/admin-chat")
def get_admin_chat():
    """List admin messages. Requires admin role.

    Query params:
    - status: 'new' | 'replied' | 'all' (default 'all')
    - limit: int
    """
    # Authenticate and authorize
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"message": "Unauthorized"}), 401

    token = auth_header.split(" ", 1)[1].strip()
    try:
        import jwt
        from auth import SECRET_KEY
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        print("get_admin_chat auth success: user_id=", user_id)
    except jwt.ExpiredSignatureError:
        print("get_admin_chat auth error: token expired")
        return jsonify({"message": "Token expired"}), 401
    except jwt.InvalidTokenError as e:
        print("get_admin_chat auth error: invalid token", e)
        return jsonify({"message": "Invalid token"}), 401
    except Exception as e:
        print("get_admin_chat auth error:", e)
        return jsonify({"message": "Unauthorized"}), 401

    # check role
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT role FROM users WHERE user_id=%s", (user_id,))
        row = cur.fetchone()
        if not row or (row.get("role") or "").lower() != "admin":
            cur.close(); conn.close()
            return jsonify({"message": "Forbidden"}), 403
    except Exception as e:
        print("get_admin_chat auth error:", e)
        try:
            cur.close(); conn.close()
        except:
            pass
        return jsonify({"message": "Unauthorized"}), 401

    status = request.args.get("status", "all")
    try:
        limit = int(request.args.get("limit", 100))
    except:
        limit = 100

    try:
        if status == "new":
            cur.execute("SELECT * FROM admin_messages WHERE status <> 'replied' ORDER BY created_at DESC LIMIT %s", (limit,))
        elif status == "replied":
            cur.execute("SELECT * FROM admin_messages WHERE status = 'replied' ORDER BY created_at DESC LIMIT %s", (limit,))
        else:
            cur.execute("SELECT * FROM admin_messages ORDER BY created_at DESC LIMIT %s", (limit,))

        rows = cur.fetchall()
        # Debug logging: print number of rows and a sample for troubleshooting
        try:
            print(f"get_admin_chat: returning {len(rows)} rows")
            if len(rows) > 0:
                sample = rows[0]
                # print keys only to avoid binary data dumps
                print("get_admin_chat sample keys:", list(sample.keys()))
        except Exception as dbg_e:
            print("get_admin_chat debug print error:", dbg_e)

        cur.close(); conn.close()
        return jsonify(rows)

    except Exception as e:
        print("get_admin_chat error:", e)
        try:
            cur.close(); conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500


@app.post("/api/admin-chat/reply")
def reply_admin_chat():
    """Admin replies to a message. Expected JSON: { id: int, reply: str }

    Requires Authorization: Bearer <token> (admin role)
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"message": "Unauthorized"}), 401

    token = auth_header.split(" ", 1)[0].strip()
    token = auth_header.split(" ", 1)[1].strip() if " " in auth_header else token
    try:
        import jwt
        from auth import SECRET_KEY
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        print("reply_admin_chat auth success: user_id=", user_id)
    except jwt.ExpiredSignatureError:
        print("reply_admin_chat auth error: token expired")
        return jsonify({"message": "Token expired"}), 401
    except jwt.InvalidTokenError as e:
        print("reply_admin_chat auth error: invalid token", e)
        return jsonify({"message": "Invalid token"}), 401
    except Exception as e:
        print("reply_admin_chat auth error:", e)
        return jsonify({"message": "Unauthorized"}), 401

    data = request.json or {}
    msg_id = data.get("id")
    reply_text = (data.get("reply") or "").strip()

    if not msg_id or not reply_text:
        return jsonify({"error": "Thiếu id hoặc reply"}), 400

    # check admin role
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT role FROM users WHERE user_id=%s", (user_id,))
        row = cur.fetchone()
        if not row or (row.get("role") or "").lower() != "admin":
            cur.close(); conn.close()
            return jsonify({"message": "Forbidden"}), 403

        # fetch message to get recipient email/user_id
        cur.execute("SELECT * FROM admin_messages WHERE id=%s", (msg_id,))
        msg_row = cur.fetchone()

        # perform reply
        cur2 = conn.cursor()
        try:
            cur2.execute(
                "UPDATE admin_messages SET reply=%s, status='replied', replied_by=%s, replied_at=NOW() WHERE id=%s",
                (reply_text, user_id, msg_id)
            )
            conn.commit()
            print("reply_admin_chat: updated with replied_by/replied_at")
        except Exception as upd_e:
            msg = str(upd_e)
            if "Unknown column" in msg or "1054" in msg:
                try:
                    print("reply_admin_chat: replied_by/replied_at columns missing, using fallback update")
                    cur2.execute(
                        "UPDATE admin_messages SET reply=%s, status='replied' WHERE id=%s",
                        (reply_text, msg_id)
                    )
                    conn.commit()
                except Exception as fallback_e:
                    print("reply_admin_chat: fallback update failed", fallback_e)
                    cur2.close(); cur.close(); conn.close()
                    return jsonify({"error": str(fallback_e)}), 500
            else:
                print("reply_admin_chat: update error", upd_e)
                cur2.close(); cur.close(); conn.close()
                return jsonify({"error": str(upd_e)}), 500



        cur2.close(); cur.close(); conn.close()

        return jsonify({"success": True})

    except Exception as e:
        print("reply_admin_chat error:", e)
        try:
            cur.close(); conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500


@app.get('/api/me')
def api_me():
    """Return user info from JWT token. Returns 401 on invalid/expired token."""
    auth_header = request.headers.get('Authorization','')
    if not auth_header.startswith('Bearer '):
        return jsonify({'message':'Unauthorized'}), 401
    token = auth_header.split(' ',1)[1].strip()
    try:
        import jwt
        from auth import SECRET_KEY
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute('SELECT user_id, full_name, email, role FROM users WHERE user_id=%s', (user_id,))
        row = cur.fetchone()
        cur.close(); conn.close()
        if not row:
            return jsonify({'message':'Unauthorized'}), 401
        # normalize role
        row['role'] = (row.get('role') or '').lower()
        return jsonify({'user': row})
    except jwt.ExpiredSignatureError:
        print('api_me: token expired')
        return jsonify({'message':'Token expired'}), 401
    except jwt.InvalidTokenError as e:
        print('api_me: invalid token', e)
        return jsonify({'message':'Invalid token'}), 401
    except Exception as e:
        print('api_me error', e)
        return jsonify({'message':'Unauthorized'}), 401
# ====================================================
#   VNPAY PAYMENT CALLBACK
# ===================================================
import urllib.parse



@app.post("/api/vnpay/create-payment")
def create_payment():
    data = request.json

    payment_url = create_vnpay_url(
        order_id=data["orderId"],
        amount=data["amount"],
        ip_addr=request.remote_addr,
        tmn_code=os.getenv("VNP_TMN_CODE"),
        hash_secret=os.getenv("VNP_HASH_SECRET"),
        return_url=os.getenv("VNP_RETURN_URL"),
        pay_url=os.getenv("VNP_PAY_URL"),
    )

    return jsonify({"paymentUrl": payment_url})


@app.get("/api/vnpay/return")
def vnpay_return():
    params = request.args.to_dict()
    # remove secure hash params before verification
    received_hash = params.pop("vnp_SecureHash", None)
    params.pop("vnp_SecureHashType", None)

    # Build the query string exactly like `create_vnpay_url` used (sorted + urlencode)
    sorted_params = sorted(params.items())
    query_string = urllib.parse.urlencode(sorted_params)

    calculated_hash = hmac.new(
        os.getenv("VNP_HASH_SECRET").encode(),
        query_string.encode(),
        hashlib.sha512
    ).hexdigest()

    print("vnpay_return params:", params)
    print("calculated_hash:", calculated_hash)
    print("received_hash:", received_hash)

    frontend = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Compare case-insensitive (some providers return upper-case hex)
    if not received_hash or calculated_hash.lower() != received_hash.lower():
        print("vnpay_return: hash mismatch -> fail")
        return redirect(f"{frontend}/payment-fail")

    # check response code
    if params.get("vnp_ResponseCode") == "00":
        # ✅ THANH TOÁN THÀNH CÔNG — update order in DB
        try:
            order_ref = params.get("vnp_TxnRef")
            txn_no = params.get("vnp_TransactionNo")
            # vnp_Amount is integer (amount*100)
            amount = int(params.get("vnp_Amount", 0))
            paid_amount = amount / 100.0

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("""
                UPDATE orders
                SET payment_status='PAID', transaction_id=%s
                WHERE order_id=%s
            """, (txn_no or None, order_ref))
            conn.commit()
            cur.close(); conn.close()
            print(f"vnpay_return: order {order_ref} marked as PAID, txn={txn_no}, amount={paid_amount}")
        except Exception as e:
            print("vnpay_return DB update error:", e)

        return redirect(f"{frontend}/payment-success")
    else:
        print("vnpay_return: vnp_ResponseCode != 00 -> fail", params.get("vnp_ResponseCode"))
        return redirect(f"{frontend}/payment-fail")

# =====================================================
#       MOMO PAYMENT CALLBACK
# =====================================================

@app.post("/api/momo/create-payment")
def momo_create_payment():
    data = request.json

    result = create_momo_payment(
        order_id=data["orderId"],
        amount=data["amount"],
        return_url=os.getenv("MOMO_RETURN_URL"),
        ipn_url=os.getenv("MOMO_IPN_URL"),
        partner_code=os.getenv("MOMO_PARTNER_CODE"),
        access_key=os.getenv("MOMO_ACCESS_KEY"),
        secret_key=os.getenv("MOMO_SECRET_KEY"),
        endpoint=os.getenv("MOMO_ENDPOINT")
    )

    if "payUrl" in result:
        return jsonify({"payUrl": result["payUrl"]})
    else:
        # log để debug
        return jsonify(result), 400

@app.get("/api/momo/return")
def momo_return():
    result_code = request.args.get("resultCode")

    if result_code == "0":
        return redirect("http://localhost:3000/payment-success")
    else:
        return redirect("http://localhost:3000/payment-fail")


@app.post("/api/momo/ipn")
def momo_ipn():
    data = request.json

    if data.get("resultCode") == 0:
        # update order = PAID
        pass
    else:
        # FAILED / CANCELED
        pass

    return {"message": "OK"}

# ====================================================
# Related Products
# ====================================================

# GET /api/products/<int:product_id>/related
@app.route("/api/products/<int:product_id>/related", methods=["GET"])
def get_related_products(product_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Lấy category_id của sản phẩm hiện tại
    cursor.execute(
        "SELECT category_id FROM products WHERE product_id = %s",
        (product_id,)
    )
    product = cursor.fetchone()
    if not product:
        return jsonify([])

    category_id = product["category_id"]

    # Lấy sản phẩm liên quan
    cursor.execute("""
        SELECT product_id, product_name, price, image_url
        FROM products
        WHERE category_id = %s
        AND product_id != %s
        LIMIT 4
    """, (category_id, product_id))

    related = cursor.fetchall()
    conn.close()

    return jsonify(related)


# =====================================================
# 🚀 MAIN ENTRY
# =====================================================
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
