# love_routes.py
from __future__ import annotations

from flask import Blueprint, request, jsonify,  send_file
import requests
from urllib.parse import quote

from services.ai_service import call_gemini
import os
from services.pdf_service import generate_love_pdf
from services.mail_service import send_numerology_pdf  # nếu em muốn gửi mail file PDF
from services.love_pdf_service import generate_love_pdf
from services.love_scoring import score_single_from_numbers, score_couple_compat


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

def _num(x):
    try:
        if x is None or x == "":
            return None
        return int(x)
    except Exception:
        return None


# Gợi ý nhóm “tương hợp” đơn giản theo numerology phổ biến (đủ dùng demo đồ án)
# (không phải chân lý tuyệt đối, dùng như heuristic để ra “score” vẽ chart)
_COMP_GROUPS = [
    {1, 5, 7},   # độc lập / trải nghiệm / nội tâm
    {2, 6, 9},   # tình cảm / gia đình / nhân văn
    {3, 4, 8},   # biểu đạt / kỷ luật / thành tựu
]

def _same_group(a: int, b: int) -> bool:
    for g in _COMP_GROUPS:
        if a in g and b in g:
            return True
    return False


def compute_overlap_and_scores(n1: dict, n2: dict) -> dict:
    """
    Output:
    {
      "scores": {"communication": 0-100, "emotion":..., "commitment":..., "growth":..., "overall":...},
      "overlaps": ["...", "..."],
      "notes": ["..."]
    }
    """
    a_lp = _num(n1.get("life_path"))
    a_de = _num(n1.get("destiny"))
    a_so = _num(n1.get("soul"))
    a_pe = _num(n1.get("personality"))

    b_lp = _num(n2.get("life_path"))
    b_de = _num(n2.get("destiny"))
    b_so = _num(n2.get("soul"))
    b_pe = _num(n2.get("personality"))

    overlaps = []
    notes = []

    # 1) Life Path ↔ Love (Soul) chồng chéo: “đường đời” & “nhu cầu tình cảm”
    # - Nếu LP của người A gần/đồng nhóm Soul của người B => dễ hiểu nhu cầu yêu
    # - Nếu lệch nhóm => dễ “lệch kỳ vọng”
    def lp_soul_overlap(label, lp, soul):
        if lp is None or soul is None:
            return
        if lp == soul:
            overlaps.append(f"{label}: Life Path trùng Soul → rất dễ đồng cảm về nhu cầu yêu.")
        elif _same_group(lp, soul):
            overlaps.append(f"{label}: Life Path cùng nhóm Soul → khá dễ hiểu nhau về tình cảm.")
        else:
            overlaps.append(f"{label}: Life Path khác nhóm Soul → dễ lệch kỳ vọng khi yêu (cần giao tiếp rõ).")

    lp_soul_overlap("A→B", a_lp, b_so)
    lp_soul_overlap("B→A", b_lp, a_so)

    # 2) Personality ↔ Communication: ảnh hưởng “cách thể hiện ra ngoài”
    # Cùng nhóm Personality => nói chuyện “hợp vibe”
    comm = 50
    if a_pe is not None and b_pe is not None:
        if a_pe == b_pe:
            comm = 85
            overlaps.append("Personality trùng → phong cách giao tiếp/ấn tượng bên ngoài khá hợp nhau.")
        elif _same_group(a_pe, b_pe):
            comm = 72
            overlaps.append("Personality cùng nhóm → giao tiếp tương đối hợp, ít hiểu lầm.")
        else:
            comm = 55
            overlaps.append("Personality khác nhóm → dễ hiểu nhầm ý nhau, nên thống nhất cách nói chuyện.")

    # 3) Emotion: Soul ↔ Soul (nhu cầu tình cảm)
    emo = 50
    if a_so is not None and b_so is not None:
        if a_so == b_so:
            emo = 88
            overlaps.append("Soul trùng → nhu cầu tình cảm giống nhau, dễ thấy “được yêu đúng cách”.")
        elif _same_group(a_so, b_so):
            emo = 74
            overlaps.append("Soul cùng nhóm → cảm xúc tương đối hoà hợp.")
        else:
            emo = 58
            overlaps.append("Soul khác nhóm → cách cần được yêu khác nhau, cần học ngôn ngữ tình yêu của nhau.")

    # 4) Commitment: Destiny ↔ Destiny (định hướng/cam kết)
    comit = 50
    if a_de is not None and b_de is not None:
        if a_de == b_de:
            comit = 82
            overlaps.append("Destiny trùng → định hướng cam kết/giá trị sống khá đồng điệu.")
        elif _same_group(a_de, b_de):
            comit = 70
            overlaps.append("Destiny cùng nhóm → mục tiêu chung tương đối hợp.")
        else:
            comit = 56
            overlaps.append("Destiny khác nhóm → ưu tiên cuộc sống khác nhau, cần “thoả thuận” rõ ràng.")

    # 5) Growth: LP ↔ LP (cách lớn lên / bài học đời)
    growth = 50
    if a_lp is not None and b_lp is not None:
        if a_lp == b_lp:
            growth = 80
            overlaps.append("Life Path trùng → cùng nhịp phát triển, dễ đồng hành dài hạn.")
        elif _same_group(a_lp, b_lp):
            growth = 68
            overlaps.append("Life Path cùng nhóm → hỗ trợ nhau phát triển khá ổn.")
        else:
            growth = 57
            overlaps.append("Life Path khác nhóm → khác nhịp sống, cần tôn trọng không gian cá nhân.")

    # Overall: weighted
    overall = round(comm * 0.22 + emo * 0.28 + comit * 0.22 + growth * 0.28)

    # Clamp
    def clamp(x): 
        return max(0, min(100, int(round(x))))

    scores = {
        "communication": clamp(comm),
        "emotion": clamp(emo),
        "commitment": clamp(comit),
        "growth": clamp(growth),
        "overall": clamp(overall),
    }

    if scores["overall"] >= 80:
        notes.append("Mức tương hợp tổng quan: Cao.")
    elif scores["overall"] >= 60:
        notes.append("Mức tương hợp tổng quan: Trung bình – khá.")
    else:
        notes.append("Mức tương hợp tổng quan: Thấp – cần nhiều kỹ năng giao tiếp & thấu hiểu.")

    return {"scores": scores, "overlaps": overlaps[:12], "notes": notes}

def _score_pair(a: dict, b: dict) -> dict:
    """
    Score đơn giản (0-100) dựa trên mức "gần nhau" của các chỉ số.
    Em có thể tinh chỉnh weight theo ý.
    """
    def norm_diff(x, y):
        try:
            x = int(x); y = int(y)
            d = abs(x - y)
            return max(0, 100 - d * 12)  # lệch 1 -> 88, lệch 2 -> 76 ...
        except Exception:
            return 50

    # các trục
    lp = norm_diff(a.get("life_path"), b.get("life_path"))
    soul = norm_diff(a.get("soul"), b.get("soul"))
    dest = norm_diff(a.get("destiny"), b.get("destiny"))
    pers = norm_diff(a.get("personality"), b.get("personality"))

    emotional = int((soul * 0.65 + pers * 0.35))
    communication = int((dest * 0.55 + pers * 0.45))
    stability = int((lp * 0.60 + dest * 0.40))
    chemistry = int((soul * 0.45 + lp * 0.35 + pers * 0.20))

    overall = int((emotional + communication + stability + chemistry) / 4)

    return {
        "overall": overall,
        "emotional": emotional,
        "communication": communication,
        "stability": stability,
        "chemistry": chemistry,
        "overlap_love_lifepath": int((lp * 0.55 + soul * 0.45)),  # “chồng chéo” Love vs Life Path
    }

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
    scores_a = score_single_from_numbers(numbers)
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
        "scores_a":scores_a,
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
    scores_a = score_single_from_numbers(p1_ok["numbers"])
    scores_b = score_single_from_numbers(p2_ok["numbers"])
    compat_scores = score_couple_compat(scores_a, scores_b)

    prompt = build_love_prompt_couple(
        p1=p1_ok,
        p2=p2_ok,
        knowledge_text=knowledge_text,
        esgoo1=esgoo_1,
        esgoo2=esgoo_2,
    )

    text = call_gemini(prompt, temperature=0.35, max_tokens=1100, timeout=70) or ""

        # 0) compute chartable scores + overlap
    metric = compute_overlap_and_scores(p1_ok["numbers"], p2_ok["numbers"])
    scores = metric["scores"]
    overlaps = metric["overlaps"]
    notes = metric["notes"]

    # Chart data (Radar/Bar)
    chart = [
        {"metric": "Giao tiếp", "value": scores["communication"]},
        {"metric": "Cảm xúc", "value": scores["emotion"]},
        {"metric": "Cam kết", "value": scores["commitment"]},
        {"metric": "Phát triển", "value": scores["growth"]},
    ]

    # 1) AI giải thích “vì sao hợp/không hợp”
    #    => ép AI phải dựa trên: score + overlap + knowledge + esgoo
    explain_prompt = f"""
Bạn là chuyên gia Thần số học Pitago (Việt Nam).

BẮT BUỘC:
- Trả lời tiếng Việt
- Dựa trên: (1) Điểm số, (2) Overlap, (3) Evidence sách, (4) Esgoo
- Nếu evidence tiếng Anh -> diễn giải sang Việt
- Không bịa chỉ số mới.

ĐIỂM SỐ TƯƠNG HỢP (0-100):
- Giao tiếp: {scores["communication"]}
- Cảm xúc: {scores["emotion"]}
- Cam kết: {scores["commitment"]}
- Phát triển: {scores["growth"]}
- Tổng quan: {scores["overall"]}

OVERLAP (điểm chồng chéo Love ↔ Life Path):
{chr(10).join("- " + x for x in overlaps)}

EVIDENCE SÁCH:
{knowledge_text}

ESGOO A:
{esgoo_1}

ESGOO B:
{esgoo_2}

YÊU CẦU OUTPUT:
1) Kết luận 3-5 câu về mức độ hợp (bám theo "Tổng quan")
2) “Vì sao hợp” (3-6 bullet, mỗi bullet phải liên hệ score/overlap)
3) “Vì sao dễ không hợp” (3-6 bullet, mỗi bullet phải liên hệ score/overlap)
4) 5 gợi ý thực tế để cải thiện (ngắn gọn, hành động được)
""".strip()

    ai_reason = call_gemini(explain_prompt, temperature=0.25, max_tokens=900, timeout=60) or ""


    return jsonify({
        "text": text,  # bản compatibility “đầy đủ”
        "reason": ai_reason,  # phần AI giải thích vì sao hợp/không hợp
        "scores": scores,  
           "scores_a":scores_a,
              "scores_b":scores_b,   # dùng cho badge + tổng quan
        "chart": chart,       # dùng cho radar/bar
        "overlaps": overlaps, # show UI “Love + LifePath chồng chéo”
        "notes": notes,
        "knowledge_used": len(knowledge[:limit]),
        "esgoo_used": bool(esgoo_raw_1 or esgoo_raw_2),
    })


@love_bp.route("/export-pdf", methods=["POST"])
def love_export_pdf():
    """
    Body:
    {
      "mode": "single" | "couple",
      "person_a": {...}   # giống compatibility
      "person_b": {...}   # optional
      "email": "..."      # optional - có thì gửi mail
      "title": "..."      # optional
      "ai_text": "..."    # optional - nếu FE đã có
      "ai_reason": "..."  # optional - nếu FE đã có
      "scores": {...}     # optional
      "overlaps": [...]   # optional
    }
    """
    data = request.json or {}
    mode = (data.get("mode") or "single").strip().lower()
    title = data.get("title") or ("Love Report (Couple)" if mode == "couple" else "Love Report (Single)")
    email = (data.get("email") or "").strip()

    pA = data.get("person_a") or {}
    pB = data.get("person_b") or None

    # nếu FE chưa truyền ai_text, fallback minimal
    ai_text = (data.get("ai_text") or "").strip()
    ai_reason = (data.get("ai_reason") or "").strip() or None

    scores = data.get("scores") or None
    overlaps = data.get("overlaps") or None

    # Validate
    if not isinstance(pA, dict) or not pA.get("name") or not pA.get("birth_date") or not isinstance(pA.get("numbers"), dict):
        return jsonify({"error": "Thiếu person_a"}), 400
    if mode == "couple":
        if not isinstance(pB, dict) or not pB.get("name") or not pB.get("birth_date") or not isinstance(pB.get("numbers"), dict):
            return jsonify({"error": "Thiếu person_b"}), 400

    # Nếu không có ai_text -> tạo nhanh 1 prompt “xuất PDF”
    if not ai_text:
        ai_text = "Không có nội dung AI được truyền vào (ai_text)."

    out_dir = os.path.join(os.getcwd(), "reports")
    pdf_path = generate_love_pdf(
        out_dir=out_dir,
        title=title,
        person_a=pA,
        person_b=pB if mode == "couple" else None,
        scores=scores,
        overlaps=overlaps,
        ai_text=ai_text,
        ai_reason=ai_reason
    )

    # Gửi mail nếu có email
    if email:
        # dùng mail_service hiện tại (đang check file tồn tại) => ok
        send_numerology_pdf(to_email=email, full_name=pA.get("name") or "Love Report", pdf_path=pdf_path)

    return jsonify({
        "message": "OK",
        "pdf_path": pdf_path,
        "emailed": bool(email),
    })

@love_bp.route("/pdf", methods=["POST"])
def love_export_pdf_for_couple():
    """
    Export PDF cho tab couple (2 người) vì yêu cầu em có chart/so sánh.
    Body:
    {
      "person_a": { "name": "...", "birth_date": "...", "numbers": {...} },
      "person_b": { "name": "...", "birth_date": "...", "numbers": {...} },
      "limit": 6,
      "use_esgoo": true
    }
    """
    data = request.json or {}
    p1 = data.get("person_a") or {}
    p2 = data.get("person_b") or {}
    limit = _safe_int(data.get("limit")) or 6
    use_esgoo = bool(data.get("use_esgoo", True))

    # validate
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

    # knowledge
    k1 = _fetch_knowledge_by_numbers(p1_ok["numbers"], limit=max(3, limit // 2))
    k2 = _fetch_knowledge_by_numbers(p2_ok["numbers"], limit=max(3, limit // 2))
    knowledge = (k1 + k2)[:limit]
    knowledge_text = _format_knowledge(knowledge)

    # esgoo
    esgoo_raw_1 = _fetch_esgoo(p1_ok["name"], p1_ok["birth_date"]) if use_esgoo else None
    esgoo_raw_2 = _fetch_esgoo(p2_ok["name"], p2_ok["birth_date"]) if use_esgoo else None
    esgoo_1 = _compact_esgoo_for_prompt(esgoo_raw_1)
    esgoo_2 = _compact_esgoo_for_prompt(esgoo_raw_2)

    # prompt: ép AI giải thích "vì sao hợp/không hợp"
    prompt = build_love_prompt_couple(
        p1=p1_ok,
        p2=p2_ok,
        knowledge_text=knowledge_text,
        esgoo1=esgoo_1,
        esgoo2=esgoo_2,
    ) + "\n\nYÊU CẦU BỔ SUNG: Hãy giải thích rõ *vì sao* hợp/không hợp theo từng bullet, bám evidence."

    ai_text = call_gemini(prompt, temperature=0.3, max_tokens=1200, timeout=70) or ""

    scores = _score_pair(p1_ok["numbers"], p2_ok["numbers"])

    pdf_path = generate_love_pdf(
        title="LOVE NUMEROLOGY REPORT",
        subtitle="RAG (Books) + ESGOO + AI (Vietnamese explanation)",
        meta_left=[
            f"A: {p1_ok['name']}",
            f"Birth: {p1_ok['birth_date']}",
            f"LP/Dest/Soul/Pers: {p1_ok['numbers'].get('life_path')}/{p1_ok['numbers'].get('destiny')}/{p1_ok['numbers'].get('soul')}/{p1_ok['numbers'].get('personality')}",
            f"ESGOO: {'ON' if esgoo_raw_1 else 'OFF'}",
        ],
        meta_right=[
            f"B: {p2_ok['name']}",
            f"Birth: {p2_ok['birth_date']}",
            f"LP/Dest/Soul/Pers: {p2_ok['numbers'].get('life_path')}/{p2_ok['numbers'].get('destiny')}/{p2_ok['numbers'].get('soul')}/{p2_ok['numbers'].get('personality')}",
            f"Books used: {len(knowledge)}",
        ],
        scores=scores,
        ai_text=ai_text,
        filename_hint=f"love_{p1_ok['name']}_{p2_ok['name']}",
    )

    return send_file(pdf_path, as_attachment=True, download_name=os.path.basename(pdf_path))
