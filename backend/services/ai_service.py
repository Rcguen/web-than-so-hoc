# ai_service.py
import os
import requests
from datetime import datetime

# ==============================
# CONFIG
# ==============================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash").strip()

# ==============================
# CORE GEMINI CALL
# ==============================
def call_gemini(
    prompt: str,
    *,
    temperature: float = 0.4,
    max_tokens: int = 1500,
    timeout: int = 60
) -> str:
    """
    Gọi Gemini và trả về text.
    Nếu lỗi => trả chuỗi rỗng để route xử lý fallback.
    """
    if not GEMINI_API_KEY:
        return ""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

    try:
        res = requests.post(
            url,
            params={"key": GEMINI_API_KEY},
            json={
                "contents": [
                    {
                        "parts": [
                            {
                                "text": SYSTEM_PROMPT + "\n\n" + prompt
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": max_tokens,
                },
            },
            timeout=timeout,
        )
        res.raise_for_status()
        data = res.json()

        candidates = data.get("candidates", [])
        if not candidates:
            return ""

        content = candidates[0].get("content", {})
        parts = content.get("parts", [])
        if parts and isinstance(parts, list):
            return (parts[-1].get("text") or "").strip()

        return (content.get("text") or "").strip()

    except Exception as e:
        print("❌ Gemini error:", e)
        return ""


# ==============================
# SYSTEM PROMPT (DÙNG CHUNG)
# ==============================
SYSTEM_PROMPT = """
Bạn là CHUYÊN GIA THẦN SỐ HỌC PITAGO người Việt.

Quy tắc bắt buộc:
- Hiểu dữ liệu đầu vào dù là TIẾNG ANH hay TIẾNG VIỆT
- Diễn giải lại hoàn toàn bằng TIẾNG VIỆT TỰ NHIÊN
- KHÔNG dịch từng chữ, KHÔNG dịch máy
- KHÔNG bịa thêm thông tin ngoài dữ liệu được cung cấp
- KHÔNG dùng từ “AI”, “mô hình”, “hệ thống”
- Văn phong tư vấn, nhẹ nhàng, tích cực, dễ hiểu
"""


# ==============================
# SUMMARY PROMPT (TRA CỨU NHANH)
# ==============================
def build_summary_prompt(
    name: str,
    birth_date: str,
    numbers: dict,
    knowledge_text: str
) -> str:
    return f"""
Bạn đang viết BẢN TÓM TẮT THẦN SỐ HỌC cho người dùng.

====================
THÔNG TIN KHÁCH HÀNG
====================
Họ tên: {name}
Ngày sinh: {birth_date}

Chỉ số:
- Số chủ đạo (Life Path): {numbers.get('life_path')}
- Số sứ mệnh (Destiny): {numbers.get('destiny')}
- Số linh hồn (Soul): {numbers.get('soul')}
- Số nhân cách (Personality): {numbers.get('personality')}

====================
DỮ LIỆU THAM KHẢO
(có thể bằng tiếng Anh hoặc tiếng Việt)
====================
{knowledge_text}

====================
YÊU CẦU
====================
- Viết 3–5 đoạn
- Mỗi đoạn 3–4 câu
- Dễ hiểu, như chuyên gia tư vấn
- Không phán đoán số phận
- Nếu dữ liệu chưa đủ cho phần nào, hãy nói rõ “chưa đủ dữ liệu”

CHỈ TRẢ VỀ NỘI DUNG LUẬN GIẢI.
"""


# ==============================
# FULL REPORT PROMPT (9 MỤC – PDF)
# ==============================
def build_full_report_prompt(
    name: str,
    birth_date: str,
    numbers: dict,
    knowledge_text: str
) -> str:
    current_year = datetime.now().year

    return f"""
Bạn đang viết BÁO CÁO THẦN SỐ HỌC CHUYÊN SÂU cho khách hàng.

====================
THÔNG TIN KHÁCH HÀNG
====================
Họ tên: {name}
Ngày sinh: {birth_date}
Năm hiện tại: {current_year}

Chỉ số:
- Số chủ đạo: {numbers.get('life_path')}
- Số sứ mệnh: {numbers.get('destiny')}
- Số linh hồn: {numbers.get('soul')}
- Số nhân cách: {numbers.get('personality')}

====================
DỮ LIỆU THAM KHẢO
(có thể bằng tiếng Anh hoặc tiếng Việt)
====================
{knowledge_text}

====================
CẤU TRÚC BẮT BUỘC (9 MỤC)
====================

1. Tổng quan năng lượng ngày sinh
2. Phân tích Số chủ đạo
3. Phân tích Số sứ mệnh
4. Phân tích Số linh hồn
5. Phân tích Số nhân cách
6. Điểm mạnh nổi bật
7. Thách thức & bài học cần vượt qua
8. Định hướng phát triển bản thân
9. Thông điệp tổng kết dành cho khách hàng

====================
QUY TẮC
====================
- Mỗi mục là 1 đoạn riêng
- Không thêm chỉ số không được cung cấp
- Nếu mục nào thiếu dữ liệu → ghi rõ “chưa đủ dữ liệu để phân tích”
- Văn phong phù hợp để xuất PDF
- Không phán đoán tuyệt đối tương lai

QUY TẮC NGUỒN DỮ LIỆU:
- Nội dung có nhãn [BOOK] là trích từ sách
- Nội dung có nhãn [ESGOO] là dữ liệu API
- KHÔNG suy diễn ngoài dữ liệu có nhãn
- Khi diễn giải, không được làm sai ý nguồn
- Nếu dữ liệu không đủ, nói rõ "chưa đủ dữ liệu để phân tích mục này"

CHỈ TRẢ VỀ NỘI DUNG BÁO CÁO.
"""


# ==============================
# PUBLIC FUNCTIONS (DÙNG TRONG ROUTE)
# ==============================
def generate_summary_report(
    name: str,
    birth_date: str,
    numbers: dict,
    knowledge_text: str
) -> str:
    prompt = build_summary_prompt(
        name=name,
        birth_date=birth_date,
        numbers=numbers,
        knowledge_text=knowledge_text
    )
    return call_gemini(prompt)


def generate_full_report(
    name: str,
    birth_date: str,
    numbers: dict,
    knowledge_text: str
) -> str:
    prompt = build_full_report_prompt(
        name=name,
        birth_date=birth_date,
        numbers=numbers,
        knowledge_text=knowledge_text
    )
    return call_gemini(prompt, temperature=0.5, max_tokens=2200)

#==========================================================
def normalize_esgoo_text(esgoo: dict) -> str:
    """
    Chuẩn hóa dữ liệu ESGOO để AI dễ hiểu, tránh JSON thô
    """
    if not esgoo:
        return "Không có dữ liệu tham khảo từ ESGOO."

    parts = []

    if esgoo.get("tong_quan"):
        parts.append(f"Tổng quan: {esgoo['tong_quan']}")

    if esgoo.get("diem_manh"):
        parts.append(f"Điểm mạnh: {esgoo['diem_manh']}")

    if esgoo.get("diem_yeu"):
        parts.append(f"Điểm yếu: {esgoo['diem_yeu']}")

    if esgoo.get("nghe_nghiep"):
        parts.append(f"Gợi ý nghề nghiệp: {esgoo['nghe_nghiep']}")

    return "\n".join(parts)
#==========================================================
def build_prompt_with_esgoo(
    *,
    name: str,
    birth_date: str,
    numbers: dict,
    knowledge_text: str,
    esgoo_text: str,
    is_full_report: bool = False,
    language: str = "vi"
) -> str:
    """
    Prompt chuẩn:
    - INPUT: knowledge có thể là tiếng Anh
    - OUTPUT: tiếng Việt
    - Ép AI đối chiếu ESGOO + sách
    """

    output_language = "Vietnamese" if language == "vi" else "English"

    report_scope = """
BẢN TÓM TẮT (3–5 đoạn):
- Tổng quan con người
- Điểm mạnh
- Thách thức
- Lời khuyên
""" if not is_full_report else """
BÁO CÁO ĐẦY ĐỦ (9 MỤC):
1. Số chủ đạo
2. Biểu đồ ngày sinh
3. Biểu đồ tên
4. Các chỉ số cá nhân
5. Kim tự tháp thần số học
6. Chu kỳ năm cá nhân
7. Chu kỳ tháng cá nhân
8. Tương hợp (nếu có)
9. Định hướng cuộc sống
"""

    return f"""
You are a **professional Numerology expert (Pythagorean system)**.

Your task:
- Analyze numerology data using **MULTI-SOURCE KNOWLEDGE**
- Sources may be in **English**
- Final answer MUST be written in **{output_language}**
- DO NOT invent numbers or meanings
- If data is missing, clearly state: "Chưa đủ dữ liệu để phân tích mục này"

=====================
USER INFORMATION
=====================
Full name: {name}
Date of birth: {birth_date}

Core numbers:
- Life Path: {numbers.get("life_path")}
- Destiny: {numbers.get("destiny")}
- Soul: {numbers.get("soul")}
- Personality: {numbers.get("personality")}

=====================
BOOK KNOWLEDGE (may be in English)
=====================
{knowledge_text or "No book knowledge provided."}

=====================
EXTERNAL NUMEROLOGY API (ESGOO – may differ)
=====================
{esgoo_text or "No external API data available."}

=====================
ANALYSIS INSTRUCTIONS
=====================
1. You MUST prioritize:
   a) Book knowledge
   b) ESGOO data
   c) Logical numerology reasoning

2. If ESGOO and Book knowledge conflict:
   - Mention the difference
   - Prefer BOOK KNOWLEDGE
   - Explain briefly

3. If any section lacks data:
   - Explicitly say it lacks data
   - Do NOT guess or hallucinate

=====================
OUTPUT REQUIREMENTS
=====================
{report_scope}

Writing rules:
- Clear headings
- Easy to understand
- Professional but friendly tone
- No mention of AI, model, or system

IMPORTANT:
- Translate concepts if source is English
- Final output must be natural {output_language}

QUY TẮC NGUỒN DỮ LIỆU:
- Nội dung có nhãn [BOOK] là trích từ sách
- Nội dung có nhãn [ESGOO] là dữ liệu API
- KHÔNG suy diễn ngoài dữ liệu có nhãn
- Khi diễn giải, không được làm sai ý nguồn
- Nếu dữ liệu không đủ, nói rõ "chưa đủ dữ liệu để phân tích mục này"
"""

#==========================================================
def build_love_single_prompt(
    name: str,
    birth_date: str,
    numbers: dict,
    knowledge_text: str
) -> str:
    return f"""
Bạn là chuyên gia Thần số học Pitago người Việt.

Hãy phân tích KHÍA CẠNH TÌNH YÊU của MỘT NGƯỜI dựa trên Thần số học.

Thông tin:
- Họ tên: {name}
- Ngày sinh: {birth_date}

Chỉ số:
- Life Path: {numbers.get("life_path")}
- Destiny: {numbers.get("destiny")}
- Soul: {numbers.get("soul")}
- Personality: {numbers.get("personality")}

Kiến thức tham khảo từ sách:
{knowledge_text}

Yêu cầu:
- Phân tích cách yêu, nhu cầu tình cảm, điểm mạnh – điểm yếu trong tình yêu
- Văn phong nhẹ nhàng, tư vấn
- 3–5 đoạn
- KHÔNG phán xét, KHÔNG dự đoán tương lai cứng

QUY TẮC NGUỒN DỮ LIỆU:
- Nội dung có nhãn [BOOK] là trích từ sách
- Nội dung có nhãn [ESGOO] là dữ liệu API
- KHÔNG suy diễn ngoài dữ liệu có nhãn
- Khi diễn giải, không được làm sai ý nguồn
- Nếu dữ liệu không đủ, nói rõ "chưa đủ dữ liệu để phân tích mục này"
"""
#==========================================================
def build_love_couple_prompt(
    person_a: dict,
    person_b: dict,
    knowledge_text: str
) -> str:
    return f"""
Bạn là chuyên gia Thần số học Pitago người Việt.

Hãy phân tích MỨC ĐỘ HÒA HỢP TÌNH CẢM của HAI NGƯỜI.

====================
NGƯỜI A
====================
Họ tên: {person_a["name"]}
Ngày sinh: {person_a["birth_date"]}
Life Path: {person_a["numbers"].get("life_path")}
Destiny: {person_a["numbers"].get("destiny")}
Soul: {person_a["numbers"].get("soul")}
Personality: {person_a["numbers"].get("personality")}

====================
NGƯỜI B
====================
Họ tên: {person_b["name"]}
Ngày sinh: {person_b["birth_date"]}
Life Path: {person_b["numbers"].get("life_path")}
Destiny: {person_b["numbers"].get("destiny")}
Soul: {person_b["numbers"].get("soul")}
Personality: {person_b["numbers"].get("personality")}

====================
KIẾN THỨC THAM KHẢO
====================
{knowledge_text}

====================
YÊU CẦU PHÂN TÍCH
====================
- Cảm xúc (Soul ↔ Soul)
- Hướng sống lâu dài (Life Path)
- Giao tiếp & xung đột (Personality)
- Khả năng gắn bó lâu dài (Destiny)

⚠️ QUY TẮC:
- KHÔNG phán xét đúng/sai
- KHÔNG khẳng định chắc chắn chia tay/kết hôn
- Tập trung vào sự thấu hiểu & cải thiện

QUY TẮC NGUỒN DỮ LIỆU:
- Nội dung có nhãn [BOOK] là trích từ sách
- Nội dung có nhãn [ESGOO] là dữ liệu API
- KHÔNG suy diễn ngoài dữ liệu có nhãn
- Khi diễn giải, không được làm sai ý nguồn
- Nếu dữ liệu không đủ, nói rõ "chưa đủ dữ liệu để phân tích mục này"
"""
