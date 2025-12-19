# ai_service.py
import os

def generate_full_report(name, birth_date, numbers, knowledge_text=""):
    """
    Tạo nội dung phân tích đầy đủ cho PDF.
    AI chỉ là phần bổ sung – nếu lỗi sẽ dùng nội dung mẫu.
    """
    try:
        # Nếu sau này còn quota Gemini thì bật lại
        # ai_text = call_gemini(...)
        # return ai_text
        raise Exception("Gemini quota exceeded")
    except Exception:
        return build_fallback_report(name, birth_date, numbers, knowledge_text)


def build_fallback_report(name, birth_date, numbers, knowledge_text):
    return f"""
BÁO CÁO THẦN SỐ HỌC CHUYÊN SÂU

Họ tên: {name}
Ngày sinh: {birth_date}

1. Life Path ({numbers['life_path']}):
Bạn là người có khả năng giao tiếp tốt, sáng tạo và mang lại năng lượng tích cực cho môi trường xung quanh.

2. Destiny ({numbers['destiny']}):
Con đường sự nghiệp của bạn gắn liền với sự linh hoạt, thay đổi và mong muốn tự do trong tư duy lẫn hành động.

3. Soul ({numbers['soul']}):
Nội tâm sâu sắc, thích chiêm nghiệm, có xu hướng tìm kiếm ý nghĩa tinh thần và sự phát triển bản thân.

4. Personality ({numbers['personality']}):
Bề ngoài bạn thể hiện là người quyết đoán, mạnh mẽ và có tố chất lãnh đạo.

TỔNG KẾT:
Thần số học cho thấy bạn phù hợp với các lĩnh vực sáng tạo, giáo dục, truyền thông, tư vấn hoặc phát triển cá nhân.


{knowledge_text}
"""

    """
    Nếu AI chết → dùng template fallback
    """
    try:
        # Nếu em có Gemini thì gọi ở đây
        # raise Exception("AI disabled for safety")
        pass
    except:
        return build_fallback_report(name, birth_date, numbers, knowledge_text)

