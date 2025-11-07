from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_db_connection  # import file db.py


app = Flask(__name__)
CORS(app)

@app.route('/api/numerology/calculate', methods=['POST'])
def calculate_numerology():
    data = request.get_json()
    name = data.get('name', '')
    birth_date = data.get('birth_date', '')

    if not birth_date:
        return jsonify({'error': 'Thiếu ngày sinh'}), 400

    # --- Chuyển chuỗi ngày sinh về dạng datetime chuẩn ---
    from datetime import datetime
    try:
        date_obj = datetime.strptime(birth_date, "%Y-%m-%d")
    except ValueError:
        try:
            date_obj = datetime.strptime(birth_date, "%m/%d/%Y")
        except ValueError:
            return jsonify({'error': 'Định dạng ngày sinh không hợp lệ'}), 400

    # --- Tính con số chủ đạo ---
    digits = [int(ch) for ch in date_obj.strftime("%Y%m%d")]
    life_path = sum(digits)
    while life_path > 9 and life_path not in [11, 22, 33]:
        life_path = sum([int(ch) for ch in str(life_path)])

    # --- Lưu vào MySQL ---
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "INSERT INTO history_lookup (name, birth_date, life_path) VALUES (%s, %s, %s)"
    cursor.execute(sql, (name, birth_date, life_path))
    conn.commit()
    cursor.close()
    conn.close()

    # --- Trả JSON cho React ---
    print("📩 Dữ liệu nhận được:", data)
    print("📊 Chuỗi ngày sinh:", birth_date)
    print("💫 Kết quả:", life_path)
    return jsonify({
        'name': name,
        'birthDate': date_obj.strftime("%Y-%m-%d"),
        'lifePath': life_path
    })

    
# API xem lịch sử tra cứu
@app.route('/api/numerology/history', methods=['GET'])
def get_history():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM history_lookup ORDER BY created_at DESC")
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(results)

# API lấy ý nghĩa con số
@app.route('/api/numerology/meaning/<int:number>', methods=['GET'])
def get_meaning(number):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM numerology_meanings WHERE number = %s", (number,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()

    if not result:
        return jsonify({'error': 'Không tìm thấy ý nghĩa cho con số này'}), 404
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)

