import os
import re
import mysql.connector
from pdf_loader import load_pdf_pages   # hàm đọc pdf -> [(page_num, text)]

# =========================
# CONFIG
# =========================
PDF_FOLDER = "./pdfs"
SOURCE_ID = 1   # ID trong bảng knowledge_sources
CHUNK_SIZE = 800        # số ký tự / chunk
CHUNK_OVERLAP = 120     # chồng lấn để tránh mất ý
PDF_SOURCES = {
    "Faith Javane, Dusty Bunker - Numerology and The Divine Triangle.pdf": 5,
    "Phillips, David A. - Secrets of the inner self - the complete book of numerology (1980, Angus & Robertson).pdf": 6,
    "Glynis McCants - Love by the Numbers_ How to Find Great Love or Reignite the Love You Have Through the Power of Numerology (2009).pdf": 7
    
}

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "thansohoc_db",
    "charset": "utf8mb4"
}

# =========================
# HELPER FUNCTIONS
# =========================
def clean_text(text: str) -> str:
    text = text.replace("\x00", "")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def detect_topic(text: str) -> tuple[str, str]:
    """
    Gán topic / sub_topic dựa trên từ khóa
    """
    t = text.lower()

    if "số chủ đạo" in t or "life path" in t:
        return "life_path", "meaning"

    if "sứ mệnh" in t or "destiny" in t:
        return "destiny", "meaning"

    if "linh hồn" in t or "soul" in t:
        return "soul", "meaning"

    if "nhân cách" in t or "personality" in t:
        return "personality", "meaning"

    if "trưởng thành" in t or "maturity" in t:
        return "maturity", "meaning"

    if "kim tự tháp" in t or "đỉnh cao" in t:
        return "pinnacle", "analysis"

    if "năm cá nhân" in t or "personal year" in t:
        return "personal_year", "analysis"

    if "biểu đồ ngày sinh" in t:
        return "birth_chart", "analysis"

    return "general", "reference"


def split_into_chunks(text: str, size=800, overlap=120):
    chunks = []
    start = 0

    while start < len(text):
        end = start + size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap

    return chunks


def extract_keywords(text: str) -> str:
    words = re.findall(r"[a-zA-ZÀ-ỹ0-9]+", text.lower())
    keywords = list(set(words))
    return ", ".join(keywords[:20])


# =========================
# MAIN IMPORT FUNCTION
# =========================
def import_pdf_to_db(pdf_path: str):
    print(f"\n📘 Importing: {pdf_path}")
    pages = load_pdf_pages(pdf_path)

    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    for page_num, raw_text in pages:
        text = clean_text(raw_text)

        if len(text) < 200:
            continue

        chunks = split_into_chunks(text, CHUNK_SIZE, CHUNK_OVERLAP)

        for chunk in chunks:
            topic, sub_topic = detect_topic(chunk)
            keywords = extract_keywords(chunk)

            sql = """
                INSERT INTO knowledge_chunks
                (source_id, topic, sub_topic, content, keywords, page_from, page_to)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """

            cursor.execute(
                sql,
                (
                    SOURCE_ID,
                    topic,
                    sub_topic,
                    chunk,
                    keywords,
                    page_num,
                    page_num
                )
            )

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Import hoàn tất!")


# =========================
# RUN ALL PDFS
# =========================
if __name__ == "__main__":
    for file in os.listdir(PDF_FOLDER):
        if file.lower().endswith(".pdf"):
            import_pdf_to_db(os.path.join(PDF_FOLDER, file))
    print("\n🎉 Tất cả PDF đã được nhập vào cơ sở dữ liệu.")