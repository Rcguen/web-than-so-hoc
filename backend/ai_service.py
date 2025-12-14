import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_numerology_interpretation(data):
    """
    data = {
      life_path: 8,
      destiny: 3,
      soul: 6,
      personality: 5
    }
    """

    prompt = f"""
Bạn là chuyên gia Thần số học Pitago.

Hãy viết một đoạn phân tích bằng tiếng Việt, giọng tư vấn, dễ hiểu,
dựa trên các chỉ số sau:

- Con số chủ đạo (Life Path): {data['life_path']}
- Sứ mệnh (Destiny): {data['destiny']}
- Linh hồn (Soul): {data['soul']}
- Nhân cách (Personality): {data['personality']}

Yêu cầu:
- Viết 1 đoạn khoảng 8–12 dòng
- Không dùng gạch đầu dòng
- Không nói lan man
- Tập trung vào điểm mạnh, định hướng cuộc sống và lời khuyên
"""

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    return response.choices[0].message["content"]
