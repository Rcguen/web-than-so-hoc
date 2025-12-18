from flask import Blueprint, request, jsonify
from db import get_db_connection
import os
from werkzeug.utils import secure_filename

product_routes = Blueprint("product_routes", __name__)

UPLOAD_FOLDER = "uploads/products"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ====================================================
#  ⛩ PUBLIC: LIST SẢN PHẨM HIỂN THỊ TRÊN SHOP
#   - Chỉ lấy is_active = 1
#   - quantity > 0  (hết hàng thì không hiện)
# ====================================================
@product_routes.get("/products")
def get_public_products():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT 
            product_id, product_name, price, image_url,
            category_id, quantity, stock, is_active, created_at
        FROM products
        WHERE is_active = 1 
        ORDER BY product_id DESC
    """)

    products = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(products)


# ====================================================
#  ⛩ PUBLIC: LẤY SẢN PHẨM THEO DANH MỤC
# ====================================================
@product_routes.get("/products/category/<int:category_id>")
def get_public_products_by_category(category_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT 
            product_id, product_name, price, image_url,
            category_id, quantity, stock, is_active, created_at
        FROM products
        WHERE is_active = 1  AND category_id = %s
        ORDER BY product_id DESC
    """, (category_id,))

    products = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(products)


# ====================================================
#  ⛩ PUBLIC: LẤY 1 SẢN PHẨM (TRANG CHI TIẾT)
#   - Vẫn cho xem sp dù quantity = 0 → để hiện badge "Hết hàng"
# ====================================================
@product_routes.get("/products/<int:product_id>")
def get_single_public_product(product_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT 
            product_id, product_name, price, image_url,
            category_id, quantity, stock, is_active,
            description, created_at
        FROM products
        WHERE product_id = %s
        
    """, (product_id,))

    product = cur.fetchone()

    cur.close()
    conn.close()

    if not product:
        return jsonify({"error": "Không tìm thấy sản phẩm"}), 404

    return jsonify(product)


# ====================================================
#  👑 ADMIN: LẤY TẤT CẢ SẢN PHẨM
# ====================================================
@product_routes.get("/admin/products")
def admin_get_products():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT 
            p.*,
            c.category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        ORDER BY p.product_id DESC
    """)

    data = cur.fetchall()
    cur.close()
    conn.close()

    # trả thẳng list để FE dùng res.data
    return jsonify(data)


# ====================================================
#  👑 ADMIN: LẤY 1 SẢN PHẨM
# ====================================================
@product_routes.get("/admin/products/<int:product_id>")
def admin_get_single_product(product_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("SELECT * FROM products WHERE product_id = %s", (product_id,))
    product = cur.fetchone()

    cur.close()
    conn.close()

    if not product:
        return jsonify({"error": "Không tìm thấy sản phẩm"}), 404

    return jsonify(product)


# ====================================================
#  👑 ADMIN: HELPER VALIDATE DỮ LIỆU
# ====================================================
def _validate_product_payload(form):
    errors = []

    name = (form.get("product_name") or "").strip()
    price = form.get("price")
    category_id = form.get("category_id")
    quantity = form.get("quantity") or 0
    stock = form.get("stock") or 0

    if not name:
        errors.append("Tên sản phẩm không được để trống")

    try:
        price_val = float(price)
        if price_val <= 0:
            errors.append("Giá phải là số > 0")
    except (TypeError, ValueError):
        errors.append("Giá sản phẩm phải là số hợp lệ")

    if not category_id:
        errors.append("Vui lòng chọn danh mục")

    try:
        quantity_val = int(quantity)
        stock_val = int(stock)
        if quantity_val < 0 or stock_val < 0:
            errors.append("Số lượng / tồn kho không được âm")
        # rule: quantity không được lớn hơn stock (nếu stock > 0)
        if stock_val > 0 and quantity_val > stock_val:
            errors.append("Số lượng bán ra không được lớn hơn tồn kho")
    except (TypeError, ValueError):
        errors.append("Số lượng / tồn kho phải là số nguyên")

    return errors


# ====================================================
#  👑 ADMIN: TẠO SẢN PHẨM
#   BODY: multipart/form-data
# ====================================================
@product_routes.post("/admin/products")
def admin_add_product():
    form = request.form
    image = request.files.get("image")

    errors = _validate_product_payload(form)
    if errors:
        return jsonify({"errors": errors}), 400

    image_url = None
    if image:
        filename = secure_filename(image.filename)
        path = os.path.join(UPLOAD_FOLDER, filename)
        image.save(path)
        image_url = "/" + path.replace("\\", "/")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO products(
            product_name, price, description, category_id,
            image_url, quantity, stock, is_active, created_at
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,1, NOW())
    """, (
        form.get("product_name"),
        form.get("price"),
        form.get("description"),
        form.get("category_id"),
        image_url,
        form.get("quantity") or 0,
        form.get("stock") or 0
    ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Product added"}), 201


# ====================================================
#  👑 ADMIN: UPDATE SẢN PHẨM
# ====================================================
@product_routes.put("/admin/products/<int:product_id>")
def admin_update_product(product_id):
    form = request.form
    image = request.files.get("image")

    errors = _validate_product_payload(form)
    if errors:
        return jsonify({"errors": errors}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    if image:
        filename = secure_filename(image.filename)
        path = os.path.join(UPLOAD_FOLDER, filename)
        image.save(path)
        image_url = "/" + path.replace("\\", "/")

        cur.execute("""
            UPDATE products
            SET product_name=%s,
                price=%s,
                description=%s,
                category_id=%s,
                image_url=%s,
                quantity=%s,
                stock=%s
            WHERE product_id=%s
        """, (
            form.get("product_name"),
            form.get("price"),
            form.get("description"),
            form.get("category_id"),
            image_url,
            form.get("quantity") or 0,
            form.get("stock") or 0,
            product_id
        ))
    else:
        cur.execute("""
            UPDATE products
            SET product_name=%s,
                price=%s,
                description=%s,
                category_id=%s,
                quantity=%s,
                stock=%s
            WHERE product_id=%s
        """, (
            form.get("product_name"),
            form.get("price"),
            form.get("description"),
            form.get("category_id"),
            form.get("quantity") or 0,
            form.get("stock") or 0,
            product_id
        ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Product updated"})


# ====================================================
#  👑 ADMIN: XÓA
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
#  👑 ADMIN: BẬT / TẮT SẢN PHẨM
# ====================================================
@product_routes.put("/admin/products/<int:product_id>/toggle")
def admin_toggle_product(product_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("SELECT is_active FROM products WHERE product_id=%s", (product_id,))
    prod = cur.fetchone()

    if not prod:
        cur.close()
        conn.close()
        return jsonify({"error": "Không tìm thấy sản phẩm"}), 404

    new_status = 0 if prod["is_active"] == 1 else 1

    cur.execute(
        "UPDATE products SET is_active=%s WHERE product_id=%s",
        (new_status, product_id)
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Status updated", "is_active": new_status})


# ====================================================
#  � ADMIN: CẬP NHẬT SỐ LƯỢNG / TỒN KHO NHANH
#  BODY: JSON { quantity: int, stock: int }
#  Yêu cầu: Authorization: Bearer <admin-token>
# ====================================================
@product_routes.put("/admin/products/<int:product_id>/inventory")
def admin_update_inventory(product_id):
    # Require admin token
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"message": "Unauthorized"}), 401

    token = auth_header.split(" ", 1)[1].strip()
    try:
        import jwt
        from auth import SECRET_KEY
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
    except Exception as e:
        print("admin_update_inventory auth error:", e)
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json() or {}
    try:
        qty = int(data.get("quantity", 0))
        stock = int(data.get("stock", 0))
    except Exception:
        return jsonify({"message": "Invalid numbers"}), 400

    if qty < 0 or stock < 0:
        return jsonify({"message": "Số lượng/tồn kho không được âm"}), 400
    if stock > 0 and qty > stock:
        return jsonify({"message": "Số lượng không được lớn hơn tồn kho"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT role FROM users WHERE user_id=%s", (user_id,))
        r = cur.fetchone()
        if not r or (r.get("role") or "").lower() != "admin":
            cur.close(); conn.close()
            return jsonify({"message": "Forbidden"}), 403

        cur2 = conn.cursor()
        cur2.execute(
            "UPDATE products SET quantity=%s, stock=%s WHERE product_id=%s",
            (qty, stock, product_id)
        )
        conn.commit()
        cur2.close(); cur.close(); conn.close()

        return jsonify({"message": "Inventory updated", "quantity": qty, "stock": stock})

    except Exception as e:
        print("admin_update_inventory error:", e)
        try:
            cur.close(); conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500


# ====================================================
#  �📦 ĐƯỢC GỌI TỪ order_routes: TRỪ TỒN KHO
#   - chỉ trừ quantity (số lượng đang bán trên web)
# ====================================================
def reduce_stock(product_id, qty):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE products
        SET quantity = quantity - %s
        WHERE product_id = %s AND quantity >= %s
    """, (qty, product_id, qty))

    if cur.rowcount == 0:
        conn.rollback()
        cur.close()
        conn.close()
        raise ValueError("Không đủ số lượng tồn kho")

    conn.commit()
    cur.close()
    conn.close()

