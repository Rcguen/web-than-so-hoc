from flask import Blueprint, request, jsonify
from db import get_db_connection

product_routes = Blueprint("product_routes", __name__)

# =====================================================
# PUBLIC API — LẤY TẤT CẢ SẢN PHẨM
# =====================================================
@product_routes.get("/products")
def get_products():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT 
            p.product_id,
            p.product_name,
            p.price,
            p.description,
            p.image_url,
            c.category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        ORDER BY p.product_id DESC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify({"products": rows})


# =====================================================
# PUBLIC API — SẢN PHẨM THEO DANH MỤC
# =====================================================
@product_routes.get("/products/category/<int:category_id>")
def get_products_by_category(category_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT product_id, product_name, price, description, image_url
        FROM products
        WHERE category_id = %s
    """, (category_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify({"products": rows})


# =====================================================
# PUBLIC API — LẤY CHI TIẾT 1 SẢN PHẨM
# =====================================================
@product_routes.get("/products/<int:product_id>")
def get_product(product_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT 
            p.product_id,
            p.product_name,
            p.price,
            p.description,
            p.image_url,
            c.category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE p.product_id = %s
        LIMIT 1
    """, (product_id,))

    row = cur.fetchone()
    cur.close()
    conn.close()

    return jsonify({"product": row})


# =====================================================
# ADMIN — LIST PRODUCTS
# =====================================================
@product_routes.get("/admin/products")
def admin_get_products():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT 
            p.product_id,
            p.product_name,
            p.price,
            p.image_url,
            p.description,
            p.category_id,
            c.category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        ORDER BY p.product_id DESC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify({"products": rows})


# =====================================================
# ADMIN — GET 1 PRODUCT
# =====================================================
@product_routes.get("/admin/products/<int:product_id>")
def admin_get_product(product_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("SELECT * FROM products WHERE product_id = %s", (product_id,))
    row = cur.fetchone()

    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Product not found"}), 404

    return jsonify({"product": row})


# =====================================================
# ADMIN — CREATE PRODUCT
# =====================================================
@product_routes.post("/admin/products")
def admin_create_product():
    data = request.json

    name = data.get("product_name")
    price = data.get("price")
    description = data.get("description")
    image_url = data.get("image_url")
    category_id = data.get("category_id")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO products (product_name, price, description, image_url, category_id)
        VALUES (%s, %s, %s, %s, %s)
    """, (name, price, description, image_url, category_id))

    conn.commit()
    new_id = cur.lastrowid

    cur.close()
    conn.close()

    return jsonify({"message": "created", "product_id": new_id})


# =====================================================
# ADMIN — UPDATE PRODUCT
# =====================================================
@product_routes.put("/admin/products/<int:product_id>")
def admin_update_product(product_id):
    data = request.json

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE products
        SET product_name = %s,
            price = %s,
            description = %s,
            image_url = %s,
            category_id = %s
        WHERE product_id = %s
    """, (
        data["product_name"],
        data["price"],
        data["description"],
        data["image_url"],
        data["category_id"],
        product_id
    ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "updated"})


# =====================================================
# ADMIN — DELETE PRODUCT
# =====================================================
@product_routes.delete("/admin/products/<int:product_id>")
def admin_delete_product(product_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM products WHERE product_id = %s", (product_id,))
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "deleted"})

# ============================
#  GET ALL CATEGORIES (ADMIN)
# ============================
@product_routes.get("/admin/categories")
def get_categories():
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)

        cur.execute("SELECT category_id, category_name FROM categories ORDER BY category_id DESC")
        categories = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify({"categories": categories})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500
@product_routes.post("/admin/categories")
def create_category():
    data = request.get_json()
    name = data.get("category_name")

    if not name:
        return jsonify({"error": "Tên danh mục không được để trống"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("INSERT INTO categories(category_name) VALUES (%s)", (name,))
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "created"})

# ============================
# TOGGLE ENABLE / DISABLE PRODUCT
# ============================
@product_routes.put("/admin/products/<int:product_id>/toggle")
def toggle_product(product_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT is_active FROM products WHERE product_id=%s", (product_id,))
    row = cur.fetchone()

    new_status = 0 if row[0] == 1 else 1

    cur.execute(
        "UPDATE products SET is_active=%s WHERE product_id=%s",
        (new_status, product_id)
    )
    conn.commit()

    cur.close()
    conn.close()
    return jsonify({"message": "updated", "status": new_status})

