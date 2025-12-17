import fitz  # PyMuPDF

def extract_text_from_pdf(path, limit=200_000):
    doc = fitz.open(path)
    text = ""

    for page in doc:
        text += page.get_text()
        if len(text) >= limit:
            break

    return text
