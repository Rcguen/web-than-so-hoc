# ai_routes.py
from flask import Blueprint, request, jsonify
import requests
from datetime import datetime

from services.ai_service import (
    call_gemini,
    build_summary_prompt,
    
    build_prompt_with_esgoo,
    normalize_esgoo_text,
)

from services.pdf_service import generate_numerology_pdf
from services.mail_service import send_numerology_pdf

from esgoo_mapper import map_esgoo_to_schema
ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")

# ======================
# Helpers
# ======================

def _safe_json(res):
    try:
        return res.json()
    except Exception:
        return {}

def fetch_esgoo(name: str, birth_date: str) -> dict:
    """
    birth_date: yyyy-mm-dd -> dd-mm-yyyy
    """
    try:
        d, m, y = birth_date.split("-")[2], birth_date.split("-")[1], birth_date.split("-")[0]
        url = f"https://esgoo.net/api-tsh/{name}/{d}-{m}-{y}.htm"
        res = requests.get(url, timeout=15)
        return _safe_json(res)
    except Exception as e:
        print("❌ ESGOO error:", e)
        return {}

def fetch_knowledge(query: str, limit: int = 5):
    try:
        res = requests.post(
            "http://127.0.0.1:5000/api/knowledge/search",
            json={"query": query, "limit": limit},
            timeout=15,
        )
        if res.status_code != 200:
            return []
        return _safe_json(res).get("knowledge", [])
    except Exception:
        return []

# ======================
# SUMMARY (WEB)
# ======================

@ai_bp.route("/summary", methods=["POST"])
def ai_summary():
    data = request.json or {}

    name = data.get("name")
    birth_date = data.get("birth_date")
    numbers = data.get("numbers")

    if not name or not birth_date or not numbers:
        return jsonify({"error": "Thiếu dữ liệu"}), 400

    # =========================
    # 1️⃣ LẤY KIẾN THỨC TỪ SÁCH
    # =========================
    knowledge = []
    try:
        res = requests.post(
            "http://localhost:5000/api/knowledge/search",
            json={
                "life_path": numbers.get("life_path"),
                "destiny": numbers.get("destiny"),
                "soul": numbers.get("soul"),
                "personality": numbers.get("personality"),
                "limit": 5
            },
            timeout=15
        )
        if res.ok:
            knowledge = res.json().get("knowledge", [])
    except Exception as e:
        print("❌ Knowledge error:", e)

    knowledge_text = "\n".join(
        f"- ({k.get('source_name', 'Book')}) {k.get('content')}"
        for k in knowledge
    )

    # =========================
    # 2️⃣ LẤY ESGOO DATA
    # =========================
    try:
        esgoo_data = map_esgoo_to_schema(name, birth_date)
        esgoo_text = esgoo_data.get("analysis_text", "")
    except Exception as e:
        print("❌ ESGOO error:", e)
        esgoo_text = ""

    # =========================
    # 3️⃣ BUILD PROMPT CHUẨN
    # =========================
    prompt = build_prompt_with_esgoo(
        name=name,
        birth_date=birth_date,
        numbers=numbers,
        knowledge_text=knowledge_text,
        esgoo_text=esgoo_text,
        is_full_report=False,   # 👉 TÓM TẮT
        language="vi"
    )

    # =========================
    # 4️⃣ GỌI GEMINI
    # =========================
    ai_text = call_gemini(prompt)

    if not ai_text:
        return jsonify({
            "text": "Chưa đủ dữ liệu để AI phân tích."
        })

    return jsonify({
        "text": ai_text,
        "knowledge_used": len(knowledge),
        "esgoo_used": bool(esgoo_text)
    })


# ======================
# FULL REPORT (TEXT)
# ======================

@ai_bp.route("/full-report", methods=["POST"])
def ai_full_report():
    data = request.json or {}

    name = data.get("name")
    birth_date = data.get("birth_date")
    numbers = data.get("numbers")

    if not name or not birth_date or not numbers:
        return jsonify({"error": "Thiếu dữ liệu"}), 400

    # Knowledge
    knowledge = fetch_knowledge(name, limit=6)
    knowledge_text = "\n".join([k["content"] for k in knowledge])

    # ESGOO
    esgoo_raw = fetch_esgoo(name, birth_date)
    esgoo_text = normalize_esgoo_text(esgoo_raw)

    prompt = build_prompt_with_esgoo(
        name=name,
        birth_date=birth_date,
        numbers=numbers,
        knowledge_text=knowledge_text,
        esgoo_text=esgoo_text,
        is_full_report=True
    )

    text = call_gemini(prompt, max_tokens=2200)

    return jsonify({
        "text": text,
        "knowledge_used": len(knowledge),
        "has_esgoo": bool(esgoo_raw)
    })

# ======================
# PDF + MAIL
# ======================

@ai_bp.route("/full-report/pdf", methods=["POST"])
def ai_full_report_pdf():
    data = request.json or {}

    name = data.get("name")
    birth_date = data.get("birth_date")
    email = data.get("email")
    numbers = data.get("numbers")

    if not name or not birth_date or not email or not numbers:
        return jsonify({"error": "Thiếu dữ liệu"}), 400

    knowledge = fetch_knowledge(name, limit=6)
    knowledge_text = "\n".join([k["content"] for k in knowledge])

    esgoo_raw = fetch_esgoo(name, birth_date)
    esgoo_text = normalize_esgoo_text(esgoo_raw)

    prompt = build_prompt_with_esgoo(
        name=name,
        birth_date=birth_date,
        numbers=numbers,
        knowledge_text=knowledge_text,
        esgoo_text=esgoo_text,
        is_full_report=True
    )

    ai_text = call_gemini(prompt, max_tokens=2400)

    pdf_path = generate_numerology_pdf(
        full_name=name,
        birth_date=birth_date,
        numbers=numbers,
        ai_content=ai_text
    )

    send_numerology_pdf(
        to_email=email,
        full_name=name,
        pdf_path=pdf_path
    )

    return jsonify({
        "message": "Đã gửi báo cáo PDF",
        "pdf_path": pdf_path
    })

# @ai_bp.route("/ai/chat", methods=["POST"])
# def chat_ai():
#     data = request.get_json()
#     message = data.get("message")

#     if not message:
#         return jsonify({"reply": "Bạn chưa nhập câu hỏi"}), 400

#     answer = generate_ai_answer(message)

#     return jsonify({
#         "reply": answer
#     })
