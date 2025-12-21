# import_pdfs_to_love_kb.py
import os
import re
from db import get_db_connection
from services.pdf_loader import load_pdf_pages

PDF_FOLDER = "./pdfs/love"
SOURCE_ID = 1        # book: Love & Numerology
LANGUAGE = "en"      # sách tình yêu đa phần là tiếng Anh
MIN_LENGTH = 200     # độ dài đoạn tối thiểu


def clean_text(text: str) -> str:
    text = text.replace("\x00", "")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def guess_aspect(text: str) -> str:
    t = text.lower()
    if "communication" in t:
        return "communication"
    if "conflict" in t:
        return "conflict"
    if "compatibility" in t:
        return "compatibility"
    if "challenge" in t:
        return "challenge"
    if "advice" in t:
        return "advice"
    return "love_style"


def run():
    conn = get_db_connection()
    cur = conn.cursor()

    for file in os.listdir(PDF_FOLDER):
        if not file.lower().endswith(".pdf"):
            continue

        path = os.path.join(PDF_FOLDER, file)
        print("📘 Importing:", file)

        pages = load_pdf_pages(path)
        if not pages:
            print("⚠️ Không đọc được PDF:", file)
            continue

        # 🔥 GỘP TOÀN BỘ TEXT CÁC TRANG
        full_text = "\n\n".join(
            clean_text(page_text)
            for _, page_text in pages
            if page_text and len(page_text.strip()) > 50
        )

        if not full_text:
            print("⚠️ PDF không có nội dung hợp lệ:", file)
            continue

        paragraphs = [
            p.strip()
            for p in full_text.split("\n\n")
            if len(p.strip()) >= MIN_LENGTH
        ]

        print(f"➡️ Found {len(paragraphs)} paragraphs")

        for para in paragraphs:
            aspect = guess_aspect(para)

            cur.execute("""
                INSERT INTO love_knowledge
                (scope, aspect, content, source_id, language)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                "single",
                aspect,
                para,
                SOURCE_ID,
                LANGUAGE
            ))

    conn.commit()
    cur.close()
    conn.close()
    print("✅ Import love knowledge done")


if __name__ == "__main__":
    run()
