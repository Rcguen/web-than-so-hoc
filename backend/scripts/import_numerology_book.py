import os
import sys
import re
import fitz

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(BASE_DIR)

from db import get_db_connection


# =========================
# CONFIG
# =========================


PDF_FILES = [
    os.path.join(BASE_DIR, "pdfs", "book_83mb.pdf"),
    os.path.join(BASE_DIR, "pdfs", "doc1.pdf"),
    os.path.join(BASE_DIR, "pdfs", "doc2.pdf"),
    os.path.join(BASE_DIR, "pdfs", "doc3.pdf"),
]


TYPE_KEYWORDS = {
    "life_path": ["đường đời", "life path"],
    "destiny": ["sứ mệnh", "định mệnh", "destiny"],
    "soul": ["linh hồn", "soul"],
    "personality": ["nhân cách", "tính cách bên ngoài", "personality"],
}

# =========================
# READ PDF
# =========================
def extract_text_from_pdf(path):
    doc = fitz.open(path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text.lower()


# =========================
# SPLIT BY NUMBER
# =========================
def split_by_number(text):
    pattern = r"(số\s+[1-9][\s\S]*?)(?=số\s+[1-9]|$)"
    return re.findall(pattern, text, re.IGNORECASE)


# =========================
# GET NUMBER
# =========================
def get_number(section):
    m = re.search(r"số\s+([1-9])", section)
    return int(m.group(1)) if m else None


# =========================
# DETECT TYPE
# =========================
def detect_type(section):
    for t, keywords in TYPE_KEYWORDS.items():
        for kw in keywords:
            if kw in section:
                return t
    return None


# =========================
# SAVE TO DB
# =========================
def save_to_db(number, type_, content):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO numerology_knowledge (number, type, content)
        VALUES (%s, %s, %s)
    """, (number, type_, content.strip()))
    conn.commit()
    cur.close()
    conn.close()


# =========================
# MAIN
# =========================
def main():
    for pdf in PDF_FILES:
        print(f"\n📘 Đang xử lý {pdf}")
        text = extract_text_from_pdf(pdf)
        sections = split_by_number(text)

        for sec in sections:
            number = get_number(sec)
            type_ = detect_type(sec)

            if number and type_:
                print(f"✔ Số {number} | {type_}")
                save_to_db(number, type_, sec)

    print("\n🎉 IMPORT XONG TẤT CẢ PDF")


if __name__ == "__main__":
    main()
