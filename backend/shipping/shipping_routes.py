from flask import Blueprint, request, jsonify
from db import get_db_connection

shipping_routes = Blueprint("shipping_routes", __name__)

@shipping_routes.get("/shipping")
def get_shipping_fee():
    city = request.args.get("city")
    district = request.args.get("district")
    ward = request.args.get("ward")



    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT price FROM shippings
        WHERE city=%s AND district=%s AND ward=%s
        LIMIT 1
    """, (city, district, ward))

    row = cur.fetchone()

    cur.close()
    conn.close()

    return jsonify({
        "shipping_fee": row["price"] if row else 0
    })
