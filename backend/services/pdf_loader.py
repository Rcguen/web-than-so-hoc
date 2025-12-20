import fitz  # PyMuPDF

def load_pdf_pages(path):
    doc = fitz.open(path)
    pages = []

    for i, page in enumerate(doc):
        text = page.get_text("text")
        pages.append((i + 1, text))

    return pages
