from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_db_connection
from auth import auth
from datetime import datetime
from shop.product_routes import product_routes
from shop.category_routes import category_routes
from flask import send_from_directory
import os
from shop.order_routes import order_routes
from shop.profile_routes import profile


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

# =====================================================
# 🚀 MAIN ENTRY
# =====================================================
if __name__ == "__main__":
    app.run(debug=True)
