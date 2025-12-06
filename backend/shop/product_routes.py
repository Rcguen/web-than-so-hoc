from flask import Blueprint, request, jsonify
from db import get_db_connection
import os
from werkzeug.utils import secure_filename

product_routes = Blueprint("product_routes", __name__)
UPLOAD_FOLDER = "uploads/products"


# ====================================================
# PUBLIC: LẤY TẤT CẢ SẢN PHẨM HIỂN THỊ TRÊN SHOP
# ====================================================
@product_routes.get("/products")
def get_public_products():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT product_id, product_name, price, image_url, category_id, quantity, is_active
        FROM products
        WHERE is_active = 1
        ORDER BY product_id DESC
    """)

    products = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(products)


# ====================================================
# PUBLIC: LẤY SẢN PHẨM THEO DANH MỤC
# ====================================================
@product_routes.get("/products/category/<int:category_id>")
def get_public_products_by_category(category_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT product_id, product_name, price, image_url, category_id, quantity, is_active
        FROM products
        WHERE category_id = %s AND is_active = 1
        ORDER BY product_id DESC
    """, (category_id,))

    products = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(products)


# ====================================================
# PUBLIC: LẤY 1 SẢN PHẨM
# ====================================================
@product_routes.get("/products/<int:product_id>")
def get_single_public_product(product_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT product_id, product_name, price, image_url, category_id, quantity, is_active, description
        FROM products
        WHERE product_id = %s AND is_active = 1
        LIMIT 1
    """, (product_id,))

    product = cur.fetchone()

    cur.close()
    conn.close()

    return jsonify(product)


# ====================================================
# ADMIN: LẤY TẤT CẢ SẢN PHẨM
# ====================================================
@product_routes.get("/admin/products")
def admin_get_products():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT p.*, c.category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        ORDER BY p.product_id DESC
    """)

    data = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(data)


# ====================================================
# ADMIN: LẤY 1 SẢN PHẨM
# ====================================================
@product_routes.get("/admin/products/<int:product_id>")
def admin_get_single_product(product_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("SELECT * FROM products WHERE product_id = %s", (product_id,))
    product = cur.fetchone()

    cur.close()
    conn.close()

    return jsonify(product)


# ====================================================
# ADMIN: TẠO SẢN PHẨM
# ====================================================
@product_routes.post("/admin/products")
def admin_add_product():
    data = request.form
    image = request.files.get("image")

    image_url = None
    if image:
        filename = secure_filename(image.filename)
        path = os.path.join(UPLOAD_FOLDER, filename)
        image.save(path)
        image_url = f"/{path}"

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO products (product_name, price, description, category_id, image_url, quantity, is_active)
        VALUES (%s, %s, %s, %s, %s, %s, 1)
    """, (
        data["product_name"], data["price"], data.get("description"),
        data.get("category_id"), image_url, data.get("quantity")
    ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Product added"})


# ====================================================
# ADMIN: UPDATE SẢN PHẨM
# ====================================================
@product_routes.put("/admin/products/<int:product_id>")
def admin_update_product(product_id):
    data = request.form
    image = request.files.get("image")

    conn = get_db_connection()
    cur = conn.cursor()

    if image:
        filename = secure_filename(image.filename)
        path = os.path.join(UPLOAD_FOLDER, filename)
        image.save(path)
        image_url = f"/{path}"

        cur.execute("""
            UPDATE products
            SET product_name=%s, price=%s, description=%s, category_id=%s,
                image_url=%s, quantity=%s
            WHERE product_id=%s
        """, (
            data["product_name"], data["price"], data.get("description"),
            data.get("category_id"), image_url, data.get("quantity"), product_id
        ))
    else:
        cur.execute("""
            UPDATE products
            SET product_name=%s, price=%s, description=%s, category_id=%s,
                quantity=%s
            WHERE product_id=%s
        """, (
            data["product_name"], data["price"], data.get("description"),
            data.get("category_id"), data.get("quantity"), product_id
        ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Product updated"})


# ====================================================
# ADMIN: XÓA
# ====================================================
@product_routes.delete("/admin/products/<int:product_id>")
def admin_delete_product(product_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM products WHERE product_id = %s", (product_id,))
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "Product deleted"})


# ====================================================
# ADMIN: BẬT / TẮT SẢN PHẨM
# ====================================================
@product_routes.put("/admin/products/<int:product_id>/toggle")
def admin_toggle_product(product_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("SELECT is_active FROM products WHERE product_id=%s", (product_id,))
    prod = cur.fetchone()

    new_status = 0 if prod["is_active"] == 1 else 1

    cur.execute("UPDATE products SET is_active=%s WHERE product_id=%s",
                (new_status, product_id))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Status updated"})


# ====================================================
# ORDER SYSTEM: TRỪ TỒN KHO
# ====================================================
def reduce_stock(product_id, qty):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE products
        SET quantity = quantity - %s
        WHERE product_id = %s AND quantity >= %s
    """, (qty, product_id, qty))

    conn.commit()
    cur.close()
    conn.close()
