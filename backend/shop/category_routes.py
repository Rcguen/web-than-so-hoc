from flask import Blueprint, request, jsonify
from db import get_db_connection

category_routes = Blueprint("category_routes", __name__)


# ============================
# PUBLIC: Get all categories
# ============================
@category_routes.get("/categories")
def get_all_categories_public():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("SELECT * FROM categories ORDER BY category_id DESC")
    categories = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(categories)


# ============================
# PUBLIC: Get single category
# ============================
@category_routes.get("/categories/<int:id>")
def get_category_public(id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("SELECT * FROM categories WHERE category_id = %s", (id,))
    category = cur.fetchone()

    cur.close()
    conn.close()

    return jsonify(category)


# ============================
# ADMIN: Get all categories
# ============================
@category_routes.get("/admin/categories")
def admin_get_categories():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("SELECT * FROM categories ORDER BY category_id DESC")
    categories = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify({"categories": categories})


# ============================
# ADMIN: Create category
# ============================
@category_routes.post("/admin/categories")
def admin_create_category():
    data = request.json
    name = data.get("category_name")

    if not name:
        return jsonify({"error": "category_name is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("INSERT INTO categories (category_name) VALUES (%s)", (name,))
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "created"})


# ============================
# ADMIN: Update category
# ============================
@category_routes.put("/admin/categories/<int:id>")
def admin_update_category(id):
    data = request.json
    name = data.get("category_name")

    if not name:
        return jsonify({"error": "category_name is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "UPDATE categories SET category_name = %s WHERE category_id = %s",
        (name, id)
    )
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "updated"})


# ============================
# ADMIN: Delete category
# ============================
@category_routes.delete("/admin/categories/<int:id>")
def admin_delete_category(id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM categories WHERE category_id = %s", (id,))
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "deleted"})
