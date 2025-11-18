from flask import Blueprint, request, jsonify
from db import get_db_connection

category_routes = Blueprint("category_routes", __name__)

# Lấy tất cả category
@category_routes.get("/categories")
def get_categories():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM categories ORDER BY category_id DESC")
    rows = cur.fetchall()
    cur.close(); conn.close()
    return jsonify(rows)



# Lấy 1 category
@category_routes.get("/categories/<int:id>")
def get_category(id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM categories WHERE category_id=%s", (id,))
    row = cur.fetchone()
    cur.close(); conn.close()
    return jsonify(row)

# Thêm category
@category_routes.post("/categories")
def add_category():
    data = request.json
    name = data.get("name")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO categories (name) VALUES (%s)", (name,))
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"message": "Category created!"})

# Cập nhật
@category_routes.put("/categories/<int:id>")
def update_category(id):
    data = request.json
    name = data.get("name")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE categories SET name=%s WHERE category_id=%s", (name, id))
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"message": "Category updated!"})

# Xóa
@category_routes.delete("/categories/<int:id>")
def delete_category(id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM categories WHERE category_id=%s", (id,))
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"message": "Category deleted!"})
