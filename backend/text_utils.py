def chunk_text(text, chunk_size=800):
    chunks = []
    start = 0
    n = len(text)

    while start < n:
        end = min(start + chunk_size, n)
        chunks.append(text[start:end])
        start = end

    return chunks
