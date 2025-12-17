# mail_service.py
import os
import mimetypes
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

MAIL_HOST = os.getenv("MAIL_HOST", "")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_USER = os.getenv("MAIL_USER", "")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
MAIL_FROM = os.getenv("MAIL_FROM", MAIL_USER)
MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "true").lower() in ("1", "true", "yes", "y")


def send_numerology_pdf(
    to_email: str,
    full_name: str,
    pdf_path: str,
    subject: str | None = None,
    body: str | None = None,
) -> bool:
    if not MAIL_HOST or not MAIL_USER or not MAIL_PASSWORD:
        raise RuntimeError(
            "Thiếu cấu hình email. Hãy set MAIL_HOST/MAIL_PORT/MAIL_USER/MAIL_PASSWORD trong .env"
        )

    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"Không tìm thấy file PDF: {pdf_path}")

    subject = subject or f"Báo cáo Thần số học - {full_name}"
    body = body or (
        f"Chào bạn {full_name},\n\n"
        "Đây là báo cáo Thần số học của bạn (file PDF đính kèm).\n\n"
        "Trân trọng."
    )

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = MAIL_FROM
    msg["To"] = to_email
    msg.set_content(body)

    with open(pdf_path, "rb") as f:
        file_data = f.read()

    file_name = os.path.basename(pdf_path)
    mime_type, _ = mimetypes.guess_type(file_name)
    if not mime_type:
        mime_type = "application/pdf"
    maintype, subtype = mime_type.split("/", 1)

    msg.add_attachment(file_data, maintype=maintype, subtype=subtype, filename=file_name)

    # Port 465 => SSL, còn lại => STARTTLS (thường 587)
    if MAIL_PORT == 465:
        server = smtplib.SMTP_SSL(MAIL_HOST, MAIL_PORT)
    else:
        server = smtplib.SMTP(MAIL_HOST, MAIL_PORT)

    try:
        server.ehlo()
        if MAIL_PORT != 465 and MAIL_USE_TLS:
            server.starttls()
            server.ehlo()
        server.login(MAIL_USER, MAIL_PASSWORD)
        server.send_message(msg)
    finally:
        try:
            server.quit()
        except Exception:
            pass

    return True
