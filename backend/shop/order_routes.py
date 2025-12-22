from flask import Blueprint, request, jsonify
from db import get_db_connection
import time

order_routes = Blueprint("order_routes", __name__)

# ====================================================
# 1. USER – TẠO ĐƠN HÀNG + THANH TOÁN (COD / MOMO / VNPAY)
# ====================================================
@order_routes.post("/orders")
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
    payment_method   = data.get("payment_method", "COD")

    city     = data.get("city")
    district = data.get("district")
    ward     = data.get("ward")

    if not customer_name or not customer_phone or not customer_address:
        return jsonify({"message": "Thiếu thông tin người nhận"}), 400

    if not items:
        return jsonify({"message": "Giỏ hàng trống"}), 400

    try:
        conn = get_db_connection()
        cur  = conn.cursor(dictionary=True)

        # ---------- 1️⃣ SUBTOTAL ----------
        subtotal = 0
        for it in items:
            price = float(it.get("price", 0))
            qty   = int(it.get("quantity", 0))
            subtotal += price * qty

        # ---------- 2️⃣ SHIPPING ----------
        shipping_fee = 0
        if city and district and ward:
            cur.execute("""
                SELECT price FROM shippings
                WHERE city=%s AND district=%s AND ward=%s
                LIMIT 1
            """, (city, district, ward))
            row = cur.fetchone()
            if row:
                shipping_fee = float(row["price"])

        # ---------- 3️⃣ TOTAL ----------
        total_price = subtotal + shipping_fee

        # ---------- 4️⃣ PAYMENT METHOD ----------
        payment_status = "UNPAID"

        if payment_method in ["MOMO", "VNPAY"]:
            payment_status = "PENDING_PAYMENT"

        # 👉 WALLET PAYMENT
        if payment_method == "WALLET":
            cur.execute(
                "SELECT balance FROM wallets WHERE user_id=%s FOR UPDATE",
                (user_id,)
            )
            wallet = cur.fetchone()
            if not wallet or float(wallet["balance"]) < total_price:
                conn.rollback()
                cur.close(); conn.close()
                return jsonify({"message": "Số dư ví không đủ"}), 400

            # trừ tiền ví
            cur.execute(
                "UPDATE wallets SET balance = balance - %s WHERE user_id=%s",
                (total_price, user_id)
            )

            # lưu lịch sử ví
            cur.execute("""
                INSERT INTO wallet_transactions (user_id, amount, type, description)
                VALUES (%s,%s,'PAYMENT','Thanh toán đơn hàng')
            """, (user_id, total_price))

            payment_status = "PAID"

        # ---------- 5️⃣ INSERT ORDER ----------
        cur.execute("""
            INSERT INTO orders (
                user_id, total_price, shipping_fee,
                order_status, payment_method, payment_status,
                created_at, customer_name, customer_phone,
                customer_address, note
            )
            VALUES (%s,%s,%s,'pending',%s,%s,NOW(),%s,%s,%s,%s)
        """, (
            user_id,
            total_price,
            shipping_fee,
            payment_method,
            payment_status,
            customer_name,
            customer_phone,
            customer_address,
            note
        ))

        order_id = cur.lastrowid

        # ---------- 6️⃣ ORDER ITEMS + STOCK ----------
        for it in items:
            product_id = it.get("product_id")
            qty   = int(it.get("quantity", 0))
            price = float(it.get("price", 0))

            cur.execute("""
                UPDATE products
                SET quantity = quantity - %s
                WHERE product_id = %s AND quantity >= %s
            """, (qty, product_id, qty))

            if cur.rowcount == 0:
                cur.execute(
                    "SELECT product_name FROM products WHERE product_id=%s",
                    (product_id,)
                )
                prod = cur.fetchone()
                conn.rollback()
                cur.close(); conn.close()
                name = prod["product_name"] if prod else str(product_id)
                return jsonify({"message": f"Không đủ tồn kho cho {name}"}), 400

            cur.execute("""
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (%s,%s,%s,%s)
            """, (order_id, product_id, qty, price))

            cur.execute(
                "SELECT quantity FROM products WHERE product_id=%s",
                (product_id,)
            )
            p = cur.fetchone()
            if p and p["quantity"] <= 0:
                cur.execute(
                    "UPDATE products SET is_active=0 WHERE product_id=%s",
                    (product_id,)
                )

        conn.commit()
        cur.close(); conn.close()

        return jsonify({
            "status": "success",
            "order_id": order_id,
            "total_price": total_price,
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
# 4b. ADMIN – CHI TIẾT ĐƠN HÀNG (ADMIN)
@order_routes.get("/admin/orders/<int:order_id>")
def admin_get_order_detail(order_id):
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
        print("admin_get_order_detail auth error:", e)
        return jsonify({"message": "Unauthorized"}), 401

    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT role FROM users WHERE user_id=%s", (user_id,))
        r = cur.fetchone()
        if not r or (r.get("role") or "").lower() != "admin":
            cur.close(); conn.close()
            return jsonify({"message": "Forbidden"}), 403

        print(f"admin_get_order_detail: user_id={user_id} is admin; fetching order {order_id}")

        # 1️⃣ Lấy thông tin đơn
        cur.execute("""
            SELECT *
            FROM orders
            WHERE order_id=%s
            LIMIT 1
        """, (order_id,))

        order = cur.fetchone()
        if not order:
            cur.close(); conn.close()
            return jsonify({"message": "Order not found"}), 404

        # 2️⃣ Lấy danh sách sản phẩm trong đơn (với trường image)
        cur.execute("""
            SELECT oi.order_item_id, oi.product_id, oi.quantity, oi.price,
                   p.product_name,
                   COALESCE(p.image_url, '') AS image
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id=%s
        """, (order_id,))

        items = cur.fetchall()

        cur.close(); conn.close()
        return jsonify({"order": order, "items": items})

    except Exception as e:
        print("admin_get_order_detail error:", e)
        try:
            cur.close(); conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500


# ====================================================
# 4. ADMIN – CẬP NHẬT TRẠNG THÁI ĐƠN
# ====================================================
@order_routes.put("/admin/orders/<int:order_id>/status")
def update_order_status(order_id):
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
        print("update_order_status auth error:", e)
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json() or {}
    new_status = data.get("status")

    if new_status not in ["pending", "processing", "shipping", "completed"]:
        return jsonify({"error": "Invalid status"}), 400

    # check role
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT role FROM users WHERE user_id=%s", (user_id,))
        r = cur.fetchone()
        if not r or (r.get("role") or "").lower() != "admin":
            cur.close(); conn.close()
            return jsonify({"message": "Forbidden"}), 403

        cur2 = conn.cursor()
        cur2.execute("""
            UPDATE orders
            SET order_status=%s
            WHERE order_id=%s
        """, (new_status, order_id))

        conn.commit()
        cur2.close(); cur.close(); conn.close()

        return jsonify({"message": "updated"})

    except Exception as e:
        print("update_order_status error:", e)
        try:
            cur.close(); conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500


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

# ====================================================
# USER – CHI TIẾT ĐƠN HÀNG
# ====================================================
@order_routes.get("/orders/user/<int:user_id>/<int:order_id>")
def get_user_order_detail(user_id, order_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    # 1️⃣ Lấy thông tin đơn (đảm bảo đúng user)
    cur.execute("""
        SELECT *
        FROM orders
        WHERE order_id=%s AND user_id=%s
        LIMIT 1
    """, (order_id, user_id))

    order = cur.fetchone()
    if not order:
        cur.close()
        conn.close()
        return jsonify({"message": "Order not found"}), 404

    # 2️⃣ Lấy danh sách sản phẩm trong đơn
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
        WHERE oi.order_id=%s
    """, (order_id,))

    items = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify({
        "order": order,
        "items": items
    })
