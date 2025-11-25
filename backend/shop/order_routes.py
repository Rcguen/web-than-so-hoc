from flask import Blueprint, request, jsonify
from db import get_db_connection

order_routes = Blueprint("order_routes", __name__)


# ============================
# 1. TẠO ĐƠN HÀNG
# ============================
@order_routes.post("/orders")
def create_order():
    data = request.get_json()

    customer = data.get("customer")
    cart = data.get("cart")

    if not customer or not cart:
        return jsonify({"error": "Dữ liệu không hợp lệ"}), 400

    customer_name = customer.get("fullname")
    customer_phone = customer.get("phone")
    customer_address = customer.get("address")
    note = customer.get("notes", "")

    # Tính tổng tiền
    total_price = sum(
        float(item.get("price", 0)) * int(item.get("qty", 1)) for item in cart
    )

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # 1) Insert vào orders
        cur.execute("""
            INSERT INTO orders (user_id, total_price, order_status, created_at,
                                customer_name, customer_phone, customer_address, note)
            VALUES (NULL, %s, 'pending', NOW(), %s, %s, %s, %s)
        """, (total_price, customer_name, customer_phone, customer_address, note))

        order_id = cur.lastrowid

        # 2) Insert chi tiết sản phẩm
        for item in cart:
            cur.execute("""
                INSERT INTO order_items(order_id, product_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """, (
                order_id,
                item["product_id"],
                item["qty"],
                float(item["price"])
            ))

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
def admin_order_detail(order_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    # Lấy thông tin đơn hàng
    cur.execute("SELECT * FROM orders WHERE order_id = %s", (order_id,))
    order = cur.fetchone()

    if not order:
        return jsonify({"error": "Order not found"}), 404

    # Lấy sản phẩm trong đơn (JOIN với bảng products)
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

    return jsonify({
        "order": order,
        "items": items
    })
# ============================
#  UPDATE ORDER STATUS
# ============================
@order_routes.put("/admin/orders/<int:order_id>/status")
def update_order_status(order_id):
    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ["pending", "processing", "shipping", "completed"]:
        return jsonify({"error": "Invalid status"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "UPDATE orders SET order_status = %s WHERE order_id = %s",
        (new_status, order_id)
    )
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "updated"})


