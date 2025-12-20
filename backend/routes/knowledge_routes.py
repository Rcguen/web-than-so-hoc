from flask import Blueprint, request, jsonify
from db import get_db_connection

knowledge_bp = Blueprint(
    "knowledge",
    __name__,
    url_prefix="/api/knowledge"
)

@knowledge_bp.route("/search", methods=["POST"])
def search_knowledge():
    data = request.json or {}

    filters = {
        "life_path": data.get("life_path"),
        "destiny": data.get("destiny"),
        "soul": data.get("soul"),
        "personality": data.get("personality"),
    }

    limit = int(data.get("limit", 5))

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    results = []

    for k, v in filters.items():
        if not v:
            continue

        cur.execute("""
            SELECT
                kc.type,
                kc.number,
                kc.content,
                ks.source_name
            FROM knowledge_chunks kc
            JOIN knowledge_sources ks
              ON kc.source_id = ks.source_id
            WHERE kc.type = %s AND kc.number = %s
            ORDER BY kc.id DESC
            LIMIT %s
        """, (k, v, limit))

        results.extend(cur.fetchall())

    cur.close()
    conn.close()

    return jsonify({"knowledge": results})
