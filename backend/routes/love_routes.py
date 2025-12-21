# love_routes.py
from __future__ import annotations

from flask import Blueprint, request, jsonify
import requests
from urllib.parse import quote

from services.ai_service import call_gemini


love_bp = Blueprint("love", __name__, url_prefix="/api/love")


# =========================
# Config
# =========================
LOCAL_BASE_URL = "http://localhost:5000"  # backend Flask của em
KNOWLEDGE_SEARCH_URL = f"{LOCAL_BASE_URL}/api/knowledge/search"

ESGOO_BASE = "https://esgoo.net/api-tsh"  # GET /{name}/{birth}.htm


# =========================
# Helpers
# =========================
def _safe_str(x) -> str:
    return (x or "").strip()


def _safe_int(x):
    try:
        if x is None or x == "":
            return None
        return int(x)
    except Exception:
        return None


def _fetch_knowledge_by_numbers(numbers: dict, limit: int = 5) -> list[dict]:
    """
    Gọi endpoint /api/knowledge/search (RAG) của chính backend.
    Trả về list: [{source_name, content, ...}, ...]
    """
    payload = {
        "life_path": numbers.get("life_path"),
        "destiny": numbers.get("destiny"),
        "soul": numbers.get("soul"),
        "personality": numbers.get("personality"),
        "limit": limit,
    }

    try:
        res = requests.post(KNOWLEDGE_SEARCH_URL, json=payload, timeout=20)
        if res.status_code != 200:
            return []
        data = res.json() if res.headers.get("content-type", "").lower().find("json") >= 0 else {}
        return data.get("knowledge", []) or []
    except Exception:
        return []


def _format_knowledge(knowledge: list[dict]) -> str:
    if not knowledge:
        return "(không có dữ liệu sách phù hợp trong DB)"
    lines = []
    for k in knowledge:
        src = k.get("source_name") or k.get("source") or "book"
        content = (k.get("content") or "").strip()
        if content:
            lines.append(f"- ({src}) {content}")
    return "\n".join(lines) if lines else "(không có dữ liệu sách phù hợp trong DB)"


def _fetch_esgoo(name: str, birth_date: str) -> dict | None:
    """
    Gọi esgoo API: https://esgoo.net/api-tsh/{A}/{B}.htm
    - A: họ tên (url-encode)
    - B: ngày sinh dạng dd-mm-yyyy (esgoo hay dùng 25-12-1985)
    Trả về dict nếu parse JSON được, else None.
    """
    name = _safe_str(name)
    birth_date = _safe_str(birth_date)

    if not name or not birth_date:
        return None

    # birth_date của em thường là YYYY-MM-DD (input type="date")
    # -> đổi sang DD-MM-YYYY cho esgoo nếu cần
    if "-" in birth_date and len(birth_date) == 10 and birth_date[4] == "-":
        yyyy, mm, dd = birth_date.split("-")
        birth_esgoo = f"{dd}-{mm}-{yyyy}"
    else:
        birth_esgoo = birth_date  # nếu user đã đưa dd-mm-yyyy

    url = f"{ESGOO_BASE}/{quote(name)}/{quote(birth_esgoo)}.htm"
    try:
        res = requests.get(url, timeout=8)
        if res.status_code != 200:
            return None

        # esgoo thường trả JSON, nhưng nếu đôi lúc trả text/html thì bắt lỗi
        try:
            return res.json()
        except Exception:
            return None
    except Exception:
        return None


def _compact_esgoo_for_prompt(esgoo_raw: dict | None) -> str:
    """
    Không biết chính xác schema esgoo của em map ra sao,
    nên mình lấy một số field phổ biến + stringify nhẹ nhàng.
    """
    if not esgoo_raw:
        return "(không lấy được dữ liệu esgoo)"

    # Nếu em đã map esgoo -> schema chuẩn ở module khác,
    # em có thể truyền mapped vào đây thay vì raw.
    # Tạm thời: lấy vài khóa hay gặp.
    keys = [
        "hoten", "hovaten", "name",
        "ngaysinh", "birthday", "birth",
        "sochudao", "life_path",
        "somenh", "destiny",
        "linhhon", "soul",
        "nhancach", "personality",
    ]

    picked = {}
    for k in keys:
        if k in esgoo_raw and esgoo_raw[k] not in (None, "", []):
            picked[k] = esgoo_raw[k]

    if not picked:
        # fallback: cắt bớt để prompt không quá dài
        s = str(esgoo_raw)
        if len(s) > 1200:
            s = s[:1200] + "..."
        return s

    return str(picked)


def build_love_prompt_single(name: str, birth_date: str, numbers: dict, knowledge_text: str, esgoo_text: str) -> str:
    """
    Prompt tình yêu 1 người (đa ngôn ngữ):
    - Evidence có thể English/Vietnamese
    - Bắt buộc trả lời tiếng Việt
    - Nếu evidence là English thì dịch/diễn giải sang Việt
    """
    return f"""
Bạn là chuyên gia Thần số học Pitago (Việt Nam).

Mục tiêu: luận giải **tình yêu** cho 1 người, dựa trên:
(1) Chỉ số đã tính sẵn
(2) Trích đoạn sách (knowledge)
(3) Dữ liệu tham khảo từ esgoo (nếu có)

QUY TẮC CỰC KỲ QUAN TRỌNG:
- Trả lời **bằng tiếng Việt**
- Nếu trích đoạn sách là tiếng Anh, hãy **dịch/diễn giải** sang tiếng Việt trước khi kết luận
- KHÔNG bịa thêm chỉ số mới. Chỉ dùng số đã cung cấp.
- Nếu dữ liệu sách/esgoo không đủ, phải nói rõ: "chưa đủ dữ liệu" và gợi ý user bổ sung gì.

====================
THÔNG TIN ĐẦU VÀO
====================
Họ tên: {name}
Ngày sinh: {birth_date}

Chỉ số:
- Life Path (Số chủ đạo): {numbers.get("life_path")}
- Destiny (Số sứ mệnh): {numbers.get("destiny")}
- Soul (Số linh hồn): {numbers.get("soul")}
- Personality (Số nhân cách): {numbers.get("personality")}

====================
TRÍCH ĐOẠN SÁCH (KNOWLEDGE)
====================
{knowledge_text}

====================
ESGOO (THAM KHẢO)
====================
{esgoo_text}

====================
YÊU CẦU ĐẦU RA (TÌNH YÊU 1 NGƯỜI)
====================
Viết theo cấu trúc:

A) Tổng quan phong cách yêu (3-5 câu)
B) Điểm mạnh khi yêu (3-6 bullet)
C) Thử thách/dễ vấp khi yêu (3-6 bullet)
D) Mẫu người phù hợp (gợi ý theo tính cách/số, không phán đoán tuyệt đối)
E) Lời khuyên thực tế (3-5 bullet, dễ áp dụng)

Giữ văn phong chuyên gia nhưng gần gũi.
""".strip()


def build_love_prompt_couple(p1: dict, p2: dict, knowledge_text: str, esgoo1: str, esgoo2: str) -> str:
    """
    Prompt tương hợp 2 người (đa ngôn ngữ)
    """
    return f"""
Bạn là chuyên gia Thần số học Pitago (Việt Nam).

Mục tiêu: phân tích **tương hợp tình yêu của 2 người**, dựa trên:
(1) Chỉ số đã tính sẵn của mỗi người
(2) Trích đoạn sách (knowledge)
(3) Dữ liệu tham khảo từ esgoo (nếu có)

QUY TẮC CỰC KỲ QUAN TRỌNG:
- Trả lời **bằng tiếng Việt**
- Nếu trích đoạn sách là tiếng Anh, hãy **dịch/diễn giải** sang tiếng Việt trước khi kết luận
- KHÔNG bịa thêm chỉ số mới. Chỉ dùng số đã cung cấp.
- Nếu thiếu dữ liệu để kết luận mức độ tương hợp, nói rõ thiếu gì.

====================
NGƯỜI A
====================
Họ tên: {p1["name"]}
Ngày sinh: {p1["birth_date"]}
Chỉ số:
- Life Path: {p1["numbers"].get("life_path")}
- Destiny: {p1["numbers"].get("destiny")}
- Soul: {p1["numbers"].get("soul")}
- Personality: {p1["numbers"].get("personality")}

ESGOO A:
{esgoo1}

====================
NGƯỜI B
====================
Họ tên: {p2["name"]}
Ngày sinh: {p2["birth_date"]}
Chỉ số:
- Life Path: {p2["numbers"].get("life_path")}
- Destiny: {p2["numbers"].get("destiny")}
- Soul: {p2["numbers"].get("soul")}
- Personality: {p2["numbers"].get("personality")}

ESGOO B:
{esgoo2}

====================
TRÍCH ĐOẠN SÁCH (KNOWLEDGE)
====================
{knowledge_text}

====================
YÊU CẦU ĐẦU RA (TƯƠNG HỢP 2 NGƯỜI)
====================
Viết theo cấu trúc:

1) Độ hòa hợp tổng quan (ngắn gọn + mức: Thấp/Trung bình/Cao kèm 1-2 câu lý do)
2) Điểm hợp nhau nhất (5-7 bullet)
3) Điểm dễ mâu thuẫn (5-7 bullet)
4) Cách giao tiếp để bền (4-6 bullet)
5) Gợi ý “quy ước chung” (3-5 bullet, kiểu thói quen/luật ngầm tốt)
6) Kết luận thực tế (không phán đoán tuyệt đối)

Giữ văn phong chuyên gia nhưng ấm áp.
""".strip()


# =========================
# Routes
# =========================
@love_bp.route("/summary", methods=["POST"])
def love_summary():
    """
    Body:
    {
      "name": "...",
      "birth_date": "YYYY-MM-DD",
      "numbers": {life_path, destiny, soul, personality},
      "limit": 5,                (optional)
      "use_esgoo": true          (optional, default true)
    }
    """
    data = request.json or {}
    name = _safe_str(data.get("name"))
    birth_date = _safe_str(data.get("birth_date"))
    numbers = data.get("numbers") or {}
    limit = _safe_int(data.get("limit")) or 5
    use_esgoo = bool(data.get("use_esgoo", True))

    if not name or not birth_date or not isinstance(numbers, dict):
        return jsonify({"error": "Thiếu name/birth_date/numbers"}), 400

    # 1) knowledge
    knowledge = _fetch_knowledge_by_numbers(numbers, limit=limit)
    knowledge_text = _format_knowledge(knowledge)

    # 2) esgoo
    esgoo_raw = _fetch_esgoo(name, birth_date) if use_esgoo else None
    esgoo_text = _compact_esgoo_for_prompt(esgoo_raw)

    # 3) prompt
    prompt = build_love_prompt_single(
        name=name,
        birth_date=birth_date,
        numbers=numbers,
        knowledge_text=knowledge_text,
        esgoo_text=esgoo_text,
    )

    # 4) call gemini
    text = call_gemini(prompt, temperature=0.35, max_tokens=900, timeout=60) or ""
    if not text.strip():
        text = "Chưa đủ dữ liệu để phân tích tình yêu. Bạn có thể thử lại hoặc bổ sung thêm thông tin."


    return jsonify({
        "text": text,
        "knowledge_used": len(knowledge),
        "esgoo_used": bool(esgoo_raw),
    })


@love_bp.route("/compatibility", methods=["POST"])
def love_compatibility():
    """
    Body:
    {
      "person_a": { "name": "...", "birth_date": "...", "numbers": {...} },
      "person_b": { "name": "...", "birth_date": "...", "numbers": {...} },
      "limit": 6,                (optional)
      "use_esgoo": true          (optional, default true)
    }
    """
    data = request.json or {}
    p1 = data.get("person_a") or {}
    p2 = data.get("person_b") or {}
    limit = _safe_int(data.get("limit")) or 6
    use_esgoo = bool(data.get("use_esgoo", True))

    def _validate_person(p: dict, label: str):
        name = _safe_str(p.get("name"))
        birth_date = _safe_str(p.get("birth_date"))
        numbers = p.get("numbers") or {}
        if not name or not birth_date or not isinstance(numbers, dict):
            return None, f"Thiếu dữ liệu {label} (name/birth_date/numbers)"
        return {"name": name, "birth_date": birth_date, "numbers": numbers}, None

    p1_ok, err1 = _validate_person(p1, "person_a")
    p2_ok, err2 = _validate_person(p2, "person_b")
    if err1 or err2:
        return jsonify({"error": err1 or err2}), 400

    # knowledge: gộp 2 bộ số để search sâu hơn
    # (gọi 2 lần rồi ghép, tránh schema phức tạp)
    k1 = _fetch_knowledge_by_numbers(p1_ok["numbers"], limit=max(3, limit // 2))
    k2 = _fetch_knowledge_by_numbers(p2_ok["numbers"], limit=max(3, limit // 2))

    # loại trùng content
    seen = set()
    knowledge = []
    for item in (k1 + k2):
        c = (item.get("content") or "").strip()
        if not c:
            continue
        key = c[:120]
        if key in seen:
            continue
        seen.add(key)
        knowledge.append(item)

    knowledge_text = _format_knowledge(knowledge[:limit])

    # esgoo
    esgoo_raw_1 = _fetch_esgoo(p1_ok["name"], p1_ok["birth_date"]) if use_esgoo else None
    esgoo_raw_2 = _fetch_esgoo(p2_ok["name"], p2_ok["birth_date"]) if use_esgoo else None
    esgoo_1 = _compact_esgoo_for_prompt(esgoo_raw_1)
    esgoo_2 = _compact_esgoo_for_prompt(esgoo_raw_2)

    # prompt
    prompt = build_love_prompt_couple(
        p1=p1_ok,
        p2=p2_ok,
        knowledge_text=knowledge_text,
        esgoo1=esgoo_1,
        esgoo2=esgoo_2,
    )

    text = call_gemini(prompt, temperature=0.35, max_tokens=1100, timeout=70) or ""

    return jsonify({
        "text": text,
        "knowledge_used": len(knowledge[:limit]),
        "esgoo_used": bool(esgoo_raw_1 or esgoo_raw_2),
    })
