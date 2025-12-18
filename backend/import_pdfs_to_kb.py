from pdf_loader import extract_text_from_pdf
from ai_service import summarize_chunk
from text_utils import chunk_text
from db import insert_knowledge
import os

os.makedirs("ai_knowledge", exist_ok=True)

PDF_FILES = [
    ("general", "pdfs/book_83mb.pdf"),
    ("life_path", "pdfs/doc1.pdf"),
    ("destiny", "pdfs/doc2.pdf"),
    ("soul", "pdfs/doc3.pdf"),
]

def main():
    for topic, path in PDF_FILES:
        print(f"\n=== IMPORT {topic} ===")

        raw_text = extract_text_from_pdf(path)
        chunks = chunk_text(raw_text)

        summaries = []
        for i, chunk in enumerate(chunks):
            print(f"  → Chunk {i+1}/{len(chunks)}")
            summaries.append(summarize_chunk(chunk))

        final_text = "\n".join(summaries)

        with open(f"ai_knowledge/{topic}.txt", "w", encoding="utf-8") as f:
            f.write(final_text)

        insert_knowledge(topic, final_text)
        print(f"✔ DONE {topic}")

if __name__ == "__main__":
    main()
