from flask import Blueprint, request, jsonify
from db import get_db_connection
import time

order_routes = Blueprint("order_routes", __name__)

# ====================================================
# 1. USER – TẠO ĐƠN HÀNG + THANH TOÁN (COD / MOMO / VNPAY)
# ====================================================
@order_routes.post("/orders")
def create_order():
    data = request.get_json() or {}
    print("create_order data:", data)

    user_id          = data.get("user_id")
    customer_name    = (data.get("customer_name") or "").strip()
    customer_phone   = (data.get("customer_phone") or "").strip()
    customer_address = (data.get("customer_address") or "").strip()
    note             = data.get("note") or ""
    items            = data.get("items") or []
    payment_method   = data.get("payment_method", "COD")  # 👈 QUAN TRỌNG

    # ---------- validate ----------
    if not customer_name or not customer_phone or not customer_address:
        return jsonify({"message": "Thiếu thông tin người nhận"}), 400

    if not items:
        return jsonify({"message": "Giỏ hàng trống"}), 400

    # ---------- tính tổng ----------
    total_price = 0
    for it in items:
        try:
            price = float(it.get("price", 0))
            qty   = int(it.get("qty", 0))
        except:
            price, qty = 0, 0
        total_price += price * qty

    # ---------- trạng thái thanh toán ----------
    if payment_method in ["MOMO", "VNPAY"]:
        payment_status = "PENDING_PAYMENT"
    else:
        payment_status = "UNPAID"

    try:
        conn = get_db_connection()
        cur  = conn.cursor()

        # 1️⃣ insert orders
        cur.execute("""
            INSERT INTO orders (
                user_id,
                total_price,
                order_status,
                payment_method,
                payment_status,
                created_at,
                customer_name,
                customer_phone,
                customer_address,
                note
            )
            VALUES (%s,%s,'pending',%s,%s,NOW(),%s,%s,%s,%s)
        """, (
            user_id,
            total_price,
            payment_method,
            payment_status,
            customer_name,
            customer_phone,
            customer_address,
            note
        ))

        order_id = cur.lastrowid

        # 2️⃣ insert order_items
        for it in items:
            cur.execute("""
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (%s,%s,%s,%s)
            """, (
                order_id,
                it.get("product_id"),
                int(it.get("qty", 0)),
                float(it.get("price", 0))
            ))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "status": "success",
            "order_id": order_id,
            "payment_method": payment_method,
            "payment_status": payment_status
        }), 201

    except Exception as e:
        print("ERROR create_order:", e)
        try:
            conn.rollback()
        except:
            pass
        return jsonify({"error": str(e)}), 500


# ====================================================
# 2. USER – MOCK THANH TOÁN MOMO / VNPAY (MỨC 1.5)
# ====================================================
@order_routes.post("/orders/<int:order_id>/mock-pay")
def mock_pay(order_id):
    transaction_id = f"TXN{order_id}{int(time.time())}"

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE orders
        SET payment_status='PAID',
            transaction_id=%s
        WHERE order_id=%s
    """, (transaction_id, order_id))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "message": "Thanh toán thành công",
        "transaction_id": transaction_id
    })


# ====================================================
# 3. ADMIN – LẤY DANH SÁCH ĐƠN
# ====================================================
@order_routes.get("/admin/orders")
def admin_get_orders():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT order_id, user_id, customer_name, customer_phone,
               customer_address, note, total_price,
               order_status, payment_method, payment_status,
               created_at
        FROM orders
        ORDER BY order_id DESC
    """)

    orders = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify({"orders": orders})


# ====================================================
# 4. ADMIN – CẬP NHẬT TRẠNG THÁI ĐƠN
# ====================================================
@order_routes.put("/admin/orders/<int:order_id>/status")
def update_order_status(order_id):
    data = request.get_json() or {}
    new_status = data.get("status")

    if new_status not in ["pending", "processing", "shipping", "completed"]:
        return jsonify({"error": "Invalid status"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE orders
        SET order_status=%s
        WHERE order_id=%s
    """, (new_status, order_id))

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
        SELECT order_id, total_price,
               order_status, payment_method, payment_status,
               created_at
        FROM orders
        WHERE user_id=%s
        ORDER BY order_id DESC
    """, (user_id,))

    orders = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify({"orders": orders})
