from flask import Blueprint, request, jsonify
from db import get_db_connection
from services.ai_service import call_gemini

ai_chat_bp = Blueprint("ai_chat", __name__, url_prefix="/api/ai/chat")

# =====================
# 1️⃣ CHAT TỰ DO
# =====================
@ai_chat_bp.route("/free", methods=["POST"])
def chat_free():
    data = request.json or {}
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"reply": "Bạn chưa nhập nội dung."}), 400

    prompt = f"""
    Bạn là AI Thần Số Học thân thiện.
    Trả lời ngắn gọn, dễ hiểu, tiếng Việt.
    Câu hỏi: {message}
    """

    reply = call_gemini(prompt)
    return jsonify({"reply": reply})


# =====================
# 2️⃣ CHAT TRI THỨC (DB)
# =====================
@ai_chat_bp.route("/knowledge", methods=["POST"])
def chat_knowledge():
    data = request.json or {}
    question = data.get("message", "").strip()

    if not question:
        return jsonify({"reply": "Bạn chưa nhập câu hỏi."}), 400

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT content 
        FROM knowledge_base
        WHERE content LIKE %s
        LIMIT 1
    """, (f"%{question}%",))

    row = cur.fetchone()
    cur.close()
    conn.close()

    # ✅ Nếu có trong DB
    if row:
        return jsonify({
            "reply": f"📚 Theo dữ liệu của hệ thống:\n{row['content']}"
        })

    # ❌ Không có → fallback AI
    prompt = f"""
    Câu hỏi về Thần Số Học:
    {question}
    Trả lời dễ hiểu, không lan man.
    """

    reply = call_gemini(prompt)
    return jsonify({
        "reply": f"🤖 Theo phân tích AI:\n{reply}"
    })
