from flask import Blueprint, request, jsonify
from db import get_db_connection
#from shop.product_routes import reduce_stock

order_routes = Blueprint("order_routes", __name__)


# ============================
# 1. TẠO ĐƠN HÀNG + TRỪ KHO
# ============================
# @order_routes.post("/orders")
def create_order():
    data = request.get_json()
    print("create_order data:", data)

    customer = data.get("customer")
    cart = data.get("cart")

    if not customer or not cart:
        return jsonify({"error": "Dữ liệu không hợp lệ"}), 400

    customer_name = customer.get("fullname")
    customer_phone = customer.get("phone")
    customer_address = customer.get("address")
    note = customer.get("notes", "")

    total_price = sum(float(item["price"]) * int(item["qty"]) for item in cart)

    try:
        conn = get_db_connection()
        conn.start_transaction()      # 🔥 Quan trọng: tất cả chạy trong 1 transaction

        cur = conn.cursor(dictionary=True)

        # ------------------------------------------------------
        # 1) KIỂM TRA TỒN KHO TỪNG SẢN PHẨM
        # ------------------------------------------------------
        errors = []
        for item in cart:
            pid = item["product_id"]
            qty = int(item["qty"])

            cur.execute(
                "SELECT product_id, product_name, quantity FROM products WHERE product_id=%s FOR UPDATE",
                (pid,)
            )
            product = cur.fetchone()

            if not product:
                errors.append(f"Sản phẩm ID {pid} không tồn tại!")
                continue

            if product["quantity"] < qty:
                errors.append(
                    f"Sản phẩm '{product['product_name']}' chỉ còn {product['quantity']} cái!"
                )

        if errors:
            conn.rollback()
            return jsonify({"error": "Không thể tạo đơn hàng", "errors": errors}), 400

        # ------------------------------------------------------
        # 2) TẠO ĐƠN HÀNG
        # ------------------------------------------------------
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO orders (user_id, total_price, order_status, created_at,
                                customer_name, customer_phone, customer_address, note)
            VALUES (NULL, %s, 'pending', NOW(), %s, %s, %s, %s)
        """, (
            total_price,
            customer_name, customer_phone, customer_address, note
        ))

        order_id = cur.lastrowid

        # ------------------------------------------------------
        # 3) THÊM ORDER ITEMS + TRỪ KHO TRONG CÙNG TRANSACTION
        # ------------------------------------------------------
        for item in cart:
            pid = item["product_id"]
            qty = int(item["qty"])
            price = float(item["price"])

            # Thêm sản phẩm vào order_items
            cur.execute("""
                INSERT INTO order_items(order_id, product_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """, (order_id, pid, qty, price))

            # 🔥 TRỪ KHO — KHÔNG TẠO DEADLOCK
            cur.execute("""
                UPDATE products
                SET quantity = quantity - %s
                WHERE product_id = %s
            """, (qty, pid))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"status": "success", "order_id": order_id}), 201

    except Exception as e:
        conn.rollback()
        print("ERROR create_order:", e)
        return jsonify({"error": str(e)}), 500

@order_routes.post("/orders")
def create_order():
    data = request.get_json() or {}
    print("create_order data:", data)   # để debug khi cần

    user_id          = data.get("user_id")
    customer_name    = (data.get("customer_name") or "").strip()
    customer_phone   = (data.get("customer_phone") or "").strip()
    customer_address = (data.get("customer_address") or "").strip()
    note             = data.get("note") or ""
    items            = data.get("items") or []

    # ----- validate đơn giản -----
    if not customer_name or not customer_phone or not customer_address:
        return jsonify({"message": "Vui lòng nhập đầy đủ thông tin nhận hàng"}), 400

    if not items:
        return jsonify({"message": "Giỏ hàng đang trống"}), 400

    # ----- tính tổng tiền -----
    total_price = 0
    for it in items:
        try:
            price = float(it.get("price", 0))
            qty   = int(it.get("qty", 0))
        except (TypeError, ValueError):
            price, qty = 0, 0
        total_price += price * qty

    try:
        conn = get_db_connection()
        cur  = conn.cursor()

        # 1) insert vào bảng orders
        cur.execute("""
            INSERT INTO orders (
                user_id,
                total_price,
                order_status,
                created_at,
                customer_name,
                customer_phone,
                customer_address,
                note
            )
            VALUES (%s, %s, 'pending', NOW(), %s, %s, %s, %s)
        """, (
            user_id,
            total_price,
            customer_name,
            customer_phone,
            customer_address,
            note
        ))

        order_id = cur.lastrowid

        # 2) insert từng item vào order_items
        for it in items:
            pid = it.get("product_id")
            qty = int(it.get("qty", 0))
            price = float(it.get("price", 0))

            cur.execute("""
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """, (order_id, pid, qty, price))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"status": "success", "order_id": order_id}), 201

    except Exception as e:
        print("ERROR create_order:", e)
        try:
            conn.rollback()
            cur.close()
            conn.close()
        except Exception:
            pass
        return jsonify({"message": "Lỗi khi tạo đơn hàng", "error": str(e)}), 500


# ====================================================
# 2. ADMIN – LẤY DANH SÁCH ĐƠN
# ====================================================
@order_routes.get("/admin/orders")
def admin_get_orders():
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)

        cur.execute("""
            SELECT order_id, user_id, customer_name, customer_phone,
                   customer_address, note, total_price,
                   order_status, created_at
            FROM orders
            ORDER BY order_id DESC
        """)

        orders = cur.fetchall()
        cur.close()
        conn.close()

        return jsonify({"orders": orders})
    except Exception as e:
        print("ERROR admin_get_orders:", e)
        return jsonify({"error": str(e)}), 500



# ====================================================
# 3. ADMIN – LẤY CHI TIẾT ĐƠN
# ====================================================
@order_routes.get("/admin/orders/<int:order_id>")
def admin_order_detail(order_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("SELECT * FROM orders WHERE order_id=%s", (order_id,))
    order = cur.fetchone()

    if not order:
        cur.close()
        conn.close()
        return jsonify({"error": "Order not found"}), 404

    cur.execute("""
        SELECT 
            oi.order_item_id,
            oi.product_id,
            oi.quantity,
            oi.price,
            p.product_name,
            p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = %s
    """, (order_id,))

    items = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify({"order": order, "items": items})



# ====================================================
# 4. ADMIN – CẬP NHẬT TRẠNG THÁI
# ====================================================
@order_routes.put("/admin/orders/<int:order_id>/status")
def update_order_status(order_id):
    data = request.get_json() or {}
    new_status = data.get("status")

    if new_status not in ["pending", "processing", "shipping", "completed"]:
        return jsonify({"error": "Invalid status"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("UPDATE orders SET order_status=%s WHERE order_id=%s",
                (new_status, order_id))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "updated"})


# ====================================================
# 5. USER – LỊCH SỬ ĐƠN HÀNG
# ====================================================
@order_routes.get("/orders/user/<int:user_id>")
def get_user_orders(user_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT order_id, total_price, order_status, created_at
        FROM orders
        WHERE user_id=%s
        ORDER BY order_id DESC
    """, (user_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify({"orders": rows})



# ====================================================
# 6. USER – CHI TIẾT ĐƠN
# ====================================================
@order_routes.get("/orders/user/<int:user_id>/<int:order_id>")
def get_user_order_detail(user_id, order_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT *
        FROM orders
        WHERE order_id=%s AND user_id=%s
    """, (order_id, user_id))
    order = cur.fetchone()

    if not order:
        cur.close()
        conn.close()
        return jsonify({"error": "Order not found"}), 404

    cur.execute("""
        SELECT oi.*, p.product_name, p.image_url
        FROM order_items oi
        JOIN products p ON p.product_id = oi.product_id
        WHERE oi.order_id=%s
    """, (order_id,))

    items = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify({"order": order, "items": items})
