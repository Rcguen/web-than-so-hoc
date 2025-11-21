from flask import Blueprint, request, jsonify
from db import get_db_connection

order_routes = Blueprint("order_routes", __name__)


# ============================
# 1. TẠO ĐƠN HÀNG
# ============================
@order_routes.post("/orders")
def create_order():
    data = request.get_json()

    user_id = data.get("user_id")
    customer_name = data.get("customer_name")
    customer_phone = data.get("customer_phone")
    customer_address = data.get("customer_address")
    note = data.get("note")
    items = data.get("items")
    total = data.get("total")

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Insert order
        cur.execute("""
            INSERT INTO orders (user_id, total_price, order_status, created_at,
                                customer_name, customer_phone, customer_address, note)
            VALUES (%s, %s, 'pending', NOW(), %s, %s, %s, %s)
        """, (user_id, total, customer_name, customer_phone, customer_address, note))

        order_id = cur.lastrowid

        # Insert order items
        for item in items:
            cur.execute("""
                INSERT INTO order_items(order_id, product_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """, (order_id, item["product_id"], item["qty"], item["price"]))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"status": "success", "order_id": order_id})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500


# ============================
# 2. API ADMIN – LẤY TOÀN BỘ ĐƠN
# ============================
@order_routes.get("/admin/orders")
def admin_get_orders():
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)

        cur.execute("""
            SELECT order_id, user_id, customer_name, customer_phone, 
                   customer_address, note, total_price, order_status, created_at
            FROM orders
            ORDER BY order_id DESC
        """)

        orders = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify({"orders": orders})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500



# ============================
# 3. API ADMIN – LẤY CHI TIẾT ĐƠN HÀNG
# ============================
@order_routes.get("/admin/orders/<int:order_id>")
def admin_get_order_detail(order_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)

        # Lấy thông tin order
        cur.execute("""
            SELECT *
            FROM orders
            WHERE order_id = %s
        """, (order_id,))
        order = cur.fetchone()

        if not order:
            return jsonify({"error": "Order not found"}), 404

        # Lấy danh sách sản phẩm
        cur.execute("""
            SELECT oi.*, p.product_name, p.image
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = %s
        """, (order_id,))
        items = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify({
            "order": order,
            "items": items
        })

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500
