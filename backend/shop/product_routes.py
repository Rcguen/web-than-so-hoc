from flask import Blueprint, request, jsonify
from db import get_db_connection

product_routes = Blueprint("product_routes", __name__)

# Lấy tất cả sản phẩm
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
            c.category_name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        ORDER BY p.product_id DESC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)


# Lấy sản phẩm theo danh mục
@product_routes.get("/products/category/<int:category_id>")
def get_products_by_category(category_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT 
            product_id,
            product_name,
            price,
            description,
            image_url
        FROM products 
        WHERE category_id=%s
    """, (category_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)


# Lấy chi tiết 1 sản phẩm
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
            c.category_name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE p.product_id=%s
        LIMIT 1
    """, (product_id,))

    row = cur.fetchone()
    cur.close()
    conn.close()
    return jsonify(row)


# Thêm sản phẩm
@product_routes.post("/products")
def add_product():
    data = request.json

    product_name = data.get("product_name")
    price = data.get("price")
    description = data.get("description")
    image_url = data.get("image_url")
    category_id = data.get("category_id")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO products (product_name, price, description, image_url, category_id)
        VALUES (%s, %s, %s, %s, %s)
    """, (product_name, price, description, image_url, category_id))

    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({"message": "Product created!"})


# Cập nhật sản phẩm
@product_routes.put("/products/<int:product_id>")
def update_product(product_id):
    data = request.json

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE products 
        SET product_name=%s, price=%s, description=%s, image_url=%s, category_id=%s 
        WHERE product_id=%s
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

    return jsonify({"message": "Product updated!"})


# Xóa sản phẩm
@product_routes.delete("/products/<int:product_id>")
def delete_product(product_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM products WHERE product_id=%s", (product_id,))
    conn.commit()

    cur.close()
    conn.close()
    
    return jsonify({"message": "Product deleted!"})
