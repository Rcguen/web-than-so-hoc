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
from vnpay_service import create_vnpay_url

from pdf_loader import extract_text_from_pdf as read_pdf_text

from pdf_service import generate_numerology_pdf
from mail_service import send_numerology_pdf
from ai_service import generate_full_report

# =====================================================
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "avatars")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

CORS(app)
app.register_blueprint(auth)
app.register_blueprint(profile)
app.register_blueprint(product_routes, url_prefix="/api")
app.register_blueprint(category_routes, url_prefix="/api")
app.register_blueprint(order_routes, url_prefix="/api")
app.register_blueprint(shipping_routes, url_prefix="/api")


app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024  # 2MB

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

        from mail_service import send_simple_mail
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

# ===================================================
# AI SERVICE
# ===================================================


# @app.post("/api/ai/summary")
# def ai_summary():
#     data = request.json or {}

#     name = data.get("name")
#     birth_date = data.get("birth_date")
#     numbers = data.get("numbers")

#     if not name or not birth_date or not numbers:
#         return jsonify({"error": "Thiếu dữ liệu"}), 400

#     # Lấy kiến thức từ DB
#     conn = get_db_connection()
#     cur = conn.cursor(dictionary=True)

#     query = """
#         SELECT type, content
#         FROM numerology_knowledge
#         WHERE (number=%s AND type='life_path')
#            OR (number=%s AND type='destiny')
#            OR (number=%s AND type='soul')
#            OR (number=%s AND type='personality')
#     """
#     cur.execute(query, (
#         numbers["life_path"],
#         numbers["destiny"],
#         numbers["soul"],
#         numbers["personality"]
#     ))
#     rows = cur.fetchall()
#     cur.close()
#     conn.close()

#     knowledge_text = "\n".join([r["content"] for r in rows])

#     text = generate_summary(
#         name=name,
#         birth_date=birth_date,
#         numbers=numbers,
#         knowledge=knowledge_text
#     )

#     return jsonify({"summary": text})


@app.post("/api/ai/full-report")
def ai_full_report():
    data = request.json

    name = data["name"]
    birth_date = data["birth_date"]
    email = data["email"]
    numbers = data["numbers"]

    # 1️⃣ Sinh nội dung phân tích (AI hoặc fallback)
    ai_text = generate_full_report(
        name=name,
        birth_date=birth_date,
        numbers=numbers
    )

    # 2️⃣ Tạo PDF
    pdf_path = generate_numerology_pdf(
        full_name=name,
        birth_date=birth_date,
        numbers=numbers,
        ai_content=ai_text
    )

    # 3️⃣ Gửi mail
    send_numerology_pdf(
        to_email=email,
        full_name=name,
        pdf_path=pdf_path
    )

    return jsonify({
        "message": "Đã gửi báo cáo PDF về email"
    })



@app.route("/api/knowledge", methods=["POST"])
def get_knowledge():
    data = request.json

    life_path = data["life_path"]
    destiny = data["destiny"]
    soul = data["soul"]
    personality = data["personality"]

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    query = """
        SELECT type, content
        FROM numerology_knowledge
        WHERE (number=%s AND type='life_path')
           OR (number=%s AND type='destiny')
           OR (number=%s AND type='soul')
           OR (number=%s AND type='personality')
    """

    cur.execute(query, (life_path, destiny, soul, personality))
    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify({
        "knowledge": rows
    })

@app.post("/api/chat")
def chat():
    user_message = (request.json.get("message", "") or "").strip()

    if not user_message:
        return jsonify({"reply": "Bạn vui lòng nhập câu hỏi 😊"})

    try:
        # 1️⃣ Nếu là câu hỏi Thần số học → xử lý chuyên biệt
        if is_numerology_question(user_message):
            # Fast path: direct lookup for queries like "số chủ đạo 8" or "life path 3"
            direct = lookup_number_meaning(user_message)
            if direct:
                return jsonify({"reply": direct})

            # Otherwise search KB snippets
            snippets = fetch_numerology_snippets(user_message)
            contents = [s.get("content") for s in snippets if s.get("content")]
            if contents:
                reply = "\n\n".join(contents)
            else:
                reply = numerology_ai_answer(user_message)

        # 2️⃣ Nếu KHÔNG liên quan → dùng Gemini
        else:
            reply = answer_with_gemini(user_message)

        return jsonify({"reply": reply})

    except Exception as e:
        print("Chat handler error:", e)
        return jsonify({"reply": "Mình đã gặp lỗi khi xử lý yêu cầu. Vui lòng thử lại sau."}), 500

def is_numerology_question(text):
    keywords = [
        "thần số học",
        "life path", "số chủ đạo",
        "destiny", "soul", "personality",
        "ngày sinh", "con số"
    ]
    return any(k in text.lower() for k in keywords)



def fallback_answer(text, use_gemini: bool = True):
    """Return a friendly fallback message for queries outside the numerology KB.

    If `use_gemini` is True and `GEMINI_API_KEY` is set, attempt to get an
    AI-generated answer via `answer_with_gemini`. If the AI returns a clear
    reply, forward it to the user; otherwise return helpful suggestions.
    """
    text = (text or "").strip()

    # Helpful example prompts to guide users when they ask vague or unsupported questions
    examples = (
        "Bạn có thể thử các câu ví dụ sau:\n"
        "- 'Ý nghĩa số Life Path 3 là gì?'\n"
        "- 'Tôi sinh ngày 1990-05-23, số Destiny của tôi là bao nhiêu?'\n"
        "- 'Giải thích con số Soul 7'\n"
        "Hoặc gửi họ tên và ngày sinh để nhận báo cáo chi tiết."
    )

    base_msg = (
        "Mình không tìm thấy thông tin phù hợp trong dữ liệu Thần số học. "
        f"\n\n{examples}"
    )

    # If the user sent a long or specific question and Gemini is available, try AI as a fallback
    if use_gemini and GEMINI_API_KEY:
        try:
            ai_reply = answer_with_gemini(text)
            # Filter out obvious AI-system messages
            bad_indicators = ["AI chưa được cấu hình", "AI đang quá tải", "AI không trả lời", "AI đang gặp lỗi"]
            if ai_reply and not any(ind in ai_reply for ind in bad_indicators):
                return ai_reply
        except Exception as e:
            print("fallback -> Gemini error:", e)

    return base_msg

def fetch_numerology_snippets(question, limit=5):
    """Return list of rows (dict) matching the question."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT type, content
        FROM numerology_knowledge
        WHERE content LIKE %s OR title LIKE %s
        LIMIT %s
    """, (f"%{question}%", f"%{question}%", limit))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return rows


def lookup_number_meaning(question):
    """If the question mentions a single number (e.g. 'số chủ đạo 8'), try
    to find a matching record in numerology_meanings and return a short
    formatted answer. Returns None if not found.
    """
    import re
    m = re.search(r"\b(\d{1,2})\b", question)
    if not m:
        return None

    num = int(m.group(1))
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT number, title, description, category
            FROM numerology_meanings
            WHERE number = %s
            LIMIT 3
        """, (num,))
        rows = cur.fetchall()
        cur.close(); conn.close()

        if not rows:
            return None

        # Format short answer using available rows
        parts = []
        for r in rows:
            title = r.get("title") or f"Ý nghĩa số {r.get('number')}"
            desc = r.get("description") or ""
            parts.append(f"{title}: {desc}")

        return "\n\n".join(parts)

    except Exception as e:
        print("lookup_number_meaning error:", e)
        return None


def search_numerology_knowledge(question):
    """Keep compatibility: return formatted string if snippets exist, otherwise not-found message."""
    rows = fetch_numerology_snippets(question)
    if not rows:
        return "Mình chưa tìm thấy thông tin phù hợp trong dữ liệu Thần số học."
    return "\n\n".join(r["content"] for r in rows)


def numerology_ai_answer(question):
    """Conservative AI fallback that only uses DB snippets; returns cautious message if none."""
    snippets = fetch_numerology_snippets(question, limit=5)

    if not snippets:
        # No KB to ground the AI — be conservative
        return "Mình chưa tìm thấy thông tin phù hợp trong dữ liệu Thần số học."

    # Compose a strict instruction and include snippets as evidence
    snippets_text = "\n\n".join(f"[{i+1}] ({s['type']}) {s['content']}" for i, s in enumerate(snippets))

    instruction = (
        "Bạn là trợ lý Thần số học. Trả lời bằng tiếng Việt. "
        "**Chỉ** sử dụng thông tin có trong các đoạn dưới đây để trả lời (không suy diễn, không thêm thông tin). "
        "Nếu đoạn dữ liệu không đủ để trả lời, trả lời: 'Mình chưa tìm thấy thông tin phù hợp trong dữ liệu Thần số học.' "
        "Trả lời ngắn gọn và có thể trích dẫn số đoạn (ví dụ: [1])."
    )

    payload_text = f"{instruction}\n\nEVIDENCE:\n{snippets_text}\n\nQUESTION: {question}"

    # Call Gemini directly with low temperature to avoid hallucination
    if not GEMINI_API_KEY:
        return "Mình chưa tìm thấy thông tin phù hợp trong dữ liệu Thần số học."

    try:
        res = requests.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            params={"key": GEMINI_API_KEY},
            json={
                "contents": [{"parts": [{"text": payload_text}]}],
                "generationConfig": {"temperature": 0.0, "maxOutputTokens": 300}
            },
            timeout=15
        )
        res.raise_for_status()
        data = res.json()

        candidates = data.get("candidates", [])
        if not candidates:
            return "Mình chưa tìm thấy thông tin phù hợp trong dữ liệu Thần số học."

        content = candidates[0].get("content", {})
        parts = content.get("parts", [])
        if parts and isinstance(parts, list):
            text_out = parts[-1].get("text", "").strip()
            # If model refuses or says it can't find answer, normalize that message
            negative_phrases = ["mình chưa tìm thấy", "không tìm thấy", "không có thông tin"]
            if any(p in text_out.lower() for p in negative_phrases):
                return "Mình chưa tìm thấy thông tin phù hợp trong dữ liệu Thần số học."
            # Avoid conditional/hypothetical answers
            if any(ci in text_out.lower() for ci in ["nếu", "giả sử", "if", "assuming"]):
                return "Mình chưa tìm thấy thông tin phù hợp trong dữ liệu Thần số học."
            return text_out

        if isinstance(content, dict) and content.get("text"):
            txt = content.get("text")
            if any(p in txt.lower() for p in ["mình chưa tìm thấy", "không tìm thấy", "không có thông tin"]):
                return "Mình chưa tìm thấy thông tin phù hợp trong dữ liệu Thần số học."
            return txt

        return "Mình chưa tìm thấy thông tin phù hợp trong dữ liệu Thần số học."

    except requests.exceptions.RequestException as e:
        print("Numerology AI request error:", e)
        return "Mình chưa tìm thấy thông tin phù hợp trong dữ liệu Thần số học."
    except Exception as e:
        print("Numerology AI error:", e)
        return "Mình chưa tìm thấy thông tin phù hợp trong dữ liệu Thần số học."
def answer_with_gemini(text):
    """Call Gemini generative API and return reply text.

    - Resolve time-sensitive queries locally (today/tomorrow/yesterday).
    - Recognize common holidays (e.g., Giáng sinh) and answer deterministically.
    - Prepend a system note with the current date to ground the model for other queries.
    - If the model returns a hypothetical/conditional answer ("nếu", "giả sử", "if"),
      return the standard fallback: "AI không trả lời được, vui lòng thử lại sau."
    """
    if not GEMINI_API_KEY:
        return "AI chưa được cấu hình. Vui lòng cấu hình GEMINI_API_KEY."

    text = (text or "").strip()
    lower = text.lower()
    today = datetime.now()

    # Local deterministic date handling
    if any(p in lower for p in ["hôm nay", "ngày hôm nay", "hôm nay là ngày", "today is", "what's the date", "what date"]):
        return today.strftime("%d/%m/%Y")

    if any(p in lower for p in ["ngày mai", "mai", "tomorrow"]):
        return (today + timedelta(days=1)).strftime("%d/%m/%Y")

    if any(p in lower for p in ["hôm qua", "hôm trước", "yesterday"]):
        return (today - timedelta(days=1)).strftime("%d/%m/%Y")

    # Holiday mapping (deterministic answers)
    holidays = {
        "giáng sinh": (25, 12), "christmas": (25, 12),
        "năm mới": (1, 1), "tết dương lịch": (1, 1), "new year": (1, 1)
    }
    for k, (day_num, month_num) in holidays.items():
        if k in lower:
            return f"{day_num:02d}/{month_num:02d}/{today.year}"

    # Build payload with system note to ground model time
    today_str = today.strftime("%d/%m/%Y")
    system_note = (
        f"[System note] Today's date is {today_str}. "
        "When answering questions about dates, use this exact date and format DD/MM/YYYY."
    )

    try:
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": system_note},
                        {"text": text}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 256
            }
        }

        res = requests.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            params={"key": GEMINI_API_KEY},
            json=payload,
            timeout=15
        )
        res.raise_for_status()
        data = res.json()

        candidates = data.get("candidates", [])
        if not candidates:
            return "AI không trả lời được, vui lòng thử lại sau."

        content = candidates[0].get("content", {})
        parts = content.get("parts", [])
        if parts and isinstance(parts, list):
            text_out = parts[-1].get("text", "").strip()
            # reject conditional/hypothetical answers
            lower_out = text_out.lower()
            conditional_indicators = ["nếu", "giả sử", "if", "assuming"]
            if any(ci in lower_out for ci in conditional_indicators):
                return "AI không trả lời được, vui lòng thử lại sau."
            if text_out:
                return text_out

        if isinstance(content, dict) and content.get("text"):
            txt = content.get("text")
            lower_txt = txt.lower()
            if any(ci in lower_txt for ci in ["nếu", "giả sử", "if", "assuming"]):
                return "AI không trả lời được, vui lòng thử lại sau."
            return txt

        return "AI không trả lời được, vui lòng thử lại sau."

    except requests.exceptions.RequestException as e:
        print("Gemini request error:", e)
        return "AI không trả lời được, vui lòng thử lại sau."
    except Exception as e:
        print("Gemini error:", e)
        return "AI không trả lời được, vui lòng thử lại sau."

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
# 🚀 MAIN ENTRY
# =====================================================
if __name__ == "__main__":
    app.run(debug=True)
