from flask import Blueprint, request, jsonify
from db import get_db_connection
from datetime import datetime

order_routes = Blueprint("order_routes", __name__)

@order_routes.post("/orders")
def create_order():
    data = request.get_json()

    customer = data.get("customer")
    cart = data.get("cart")

    conn = get_db_connection()
    cur = conn.cursor()

    # Insert order
    cur.execute("""
        INSERT INTO orders (fullname, phone, address, notes, total_price, created_at)
        VALUES (%s, %s, %s, %s, %s, NOW())
    """, (
        customer["fullname"],
        customer["phone"],
        customer["address"],
        customer["notes"],
        sum(item["price"] * item["quantity"] for item in cart)
    ))

    order_id = cur.lastrowid

    # Insert order items
    for item in cart:
        cur.execute("""
            INSERT INTO order_items (order_id, product_id, price, quantity)
            VALUES (%s, %s, %s, %s)
        """, (
            order_id,
            item["product_id"],
            item["price"],
            item["quantity"]
        ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"status": "success", "order_id": order_id})
