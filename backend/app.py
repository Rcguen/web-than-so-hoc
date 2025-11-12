from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_db_connection
from auth import auth
from datetime import datetime

app = Flask(__name__)
CORS(app)
app.register_blueprint(auth)

@app.get("/api/health")
def health():
    return jsonify({"status": "ok"}), 200

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

@app.route('/api/numerology/calculate', methods=['POST'])
def calculate_numerology():
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        birth_date = data.get('birth_date', '').strip()
        user_id = data.get('user_id')

        if not name or not birth_date:
            return jsonify({'error': 'Thiếu họ tên hoặc ngày sinh'}), 400

        # ------------------------------
        # 1️⃣ Con Số Chủ Đạo (Life Path)
        digits = [int(ch) for ch in birth_date if ch.isdigit()]
        life_path = sum(digits)
        while life_path > 9 and life_path not in (11, 22, 33):
            life_path = sum(int(c) for c in str(life_path))

        # ------------------------------
        # 2️⃣ Sứ Mệnh (Destiny Number)
        letters = [c.lower() for c in name if c.isalpha()]
        letter_map = {
            **dict.fromkeys("aijqy", 1),
            **dict.fromkeys("bkr", 2),
            **dict.fromkeys("clgs", 3),
            **dict.fromkeys("dmt", 4),
            **dict.fromkeys("ehnx", 5),
            **dict.fromkeys("uvw", 6),
            **dict.fromkeys("oz", 7),
            **dict.fromkeys("fp", 8),
        }
        total = sum(letter_map.get(c, 0) for c in letters)
        while total > 9 and total not in (11, 22, 33):
            total = sum(int(c) for c in str(total))
        destiny = total

        # ------------------------------
        # 3️⃣ Linh Hồn (Soul Number)
        vowels = [c for c in letters if c in "aeiou"]
        soul = sum(letter_map.get(c, 0) for c in vowels)
        while soul > 9 and soul not in (11, 22, 33):
            soul = sum(int(c) for c in str(soul))

        # ------------------------------
        # 4️⃣ Nhân Cách (Personality Number)
        consonants = [c for c in letters if c not in "aeiou"]
        personality = sum(letter_map.get(c, 0) for c in consonants)
        while personality > 9 and personality not in (11, 22, 33):
            personality = sum(int(c) for c in str(personality))

        # ------------------------------
        # 5️⃣ Ngày Sinh (Birthday Number)
        try:
            day = int(birth_date.split('-')[2])
        except:
            day = 0
        birthday = day if day <= 9 or day in (11, 22) else sum(map(int, str(day)))

        # ------------------------------
        # 6️⃣ Trưởng Thành (Maturity Number)
        maturity = life_path + destiny
        while maturity > 9 and maturity not in (11, 22, 33):
            maturity = sum(int(c) for c in str(maturity))

        # ------------------------------
        # Lưu vào cơ sở dữ liệu
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO numerology_results 
            (user_id, name, birth_date, category, life_path_number, destiny_number, soul_number, summary) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id, name, birth_date, 'lookup',
            life_path, destiny, soul,
            f"LifePath={life_path}, Destiny={destiny}, Soul={soul}"
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'name': name,
            'birthDate': birth_date,
            'lifePath': life_path,
            'destiny': destiny,
            'soul': soul,
            'personality': personality,
            'birthday': birthday,
            'maturity': maturity
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

    data = request.get_json()
    name = data["name"]
    birth_date = data["birth_date"]
    user_id = data.get("user_id")

    nums = calculate_from_name(name)
    vowels = [c for c in name.upper() if c in "AEIOU"]
    consonants = [c for c in name.upper() if c.isalpha() and c not in "AEIOU"]

    life_path = reduce_number(sum(int(x) for x in birth_date.replace("-", "")))
    destiny = reduce_number(sum(calculate_from_name(name)))
    soul = reduce_number(sum(calculate_from_name("".join(vowels))))
    personality = reduce_number(sum(calculate_from_name("".join(consonants))))
    maturity = reduce_number(life_path + destiny)
    birth_day = reduce_number(int(birth_date.split("-")[2]))

    result = {
        "name": name,
        "birthDate": birth_date,
        "lifePath": life_path,
        "destiny": destiny,
        "soul": soul,
        "personality": personality,
        "maturity": maturity,
        "birthDay": birth_day
    }

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO numerology_results (user_id, name, birth_date, category,
        life_path_number, destiny_number, soul_number, summary, created_at)
        VALUES (%s, %s, %s, 'detail', %s, %s, %s, '', NOW())
    """, (user_id, name, birth_date, life_path, destiny, soul))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify(result)


@app.route("/api/numerology/history/<int:user_id>", methods=["GET"])
def get_history(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT result_id, name, birth_date, life_path_number, destiny_number, soul_number, summary, created_at
        FROM numerology_results
        WHERE user_id = %s
        ORDER BY created_at DESC
    """, (user_id,))

    results = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(results)


@app.get("/api/numerology/meaning/<int:number>")
def get_meaning(number: int):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM numerology_meanings WHERE number=%s", (number,))
    row = cur.fetchone()
    cur.close(); conn.close()
    if not row:
        return jsonify({'error': 'Không tìm thấy ý nghĩa cho con số này'}), 404
    return jsonify(row), 200

@app.route("/api/numerology/details/<int:result_id>", methods=["GET"])
def get_numerology_details(result_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Lấy dữ liệu chính từ kết quả
    cursor.execute("""
        SELECT result_id, user_id, name, birth_date,
               life_path_number, destiny_number, soul_number,
               summary, created_at
        FROM numerology_results
        WHERE result_id = %s
    """, (result_id,))
    result = cursor.fetchone()

    if not result:
        cursor.close()
        conn.close()
        return jsonify({"error": "Không tìm thấy kết quả"}), 404

    # Lấy diễn giải từ bảng meanings
    cursor.execute("""
        SELECT number, title, description
        FROM numerology_meanings
        WHERE number IN (%s, %s, %s)
    """, (
        result["life_path_number"],
        result["destiny_number"],
        result["soul_number"]
    ))
    meanings = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({
        "info": result,
        "meanings": meanings
    })
@app.route('/api/numerology/birth-chart', methods=['POST'])
def birth_chart():
    try:
        data = request.get_json()
        birth_date = data.get('birth_date')

        if not birth_date:
            return jsonify({'error': 'Thiếu ngày sinh'}), 400

        # Tách từng số
        digits = [int(ch) for ch in birth_date if ch.isdigit()]

        # Đếm số lần xuất hiện (1 đến 9)
        chart = {i: digits.count(i) for i in range(1, 10)}

        return jsonify({'chart': chart})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/numerology/meaning/<string:type>/<int:number>', methods=['GET'])
def get_numerology_meaning(type, number):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT * FROM numerology_meanings
            WHERE category = %s AND number = %s
            LIMIT 1
        """, (type, number))
        meaning = cursor.fetchone()

        cursor.close()
        conn.close()

        if meaning:
            return jsonify({
                "number": meaning["number"],
                "title": meaning["title"],
                "description": meaning["description"]
            })
        else:
            return jsonify({
                "number": number,
                "title": f"Ý nghĩa số {number}",
                "description": "Chưa có mô tả trong cơ sở dữ liệu."
            })

    except Exception as e:
        print("Lỗi API /meaning:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
