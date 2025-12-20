# services/pdf_service.py
import os
from datetime import datetime
from html import escape

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.colors import HexColor


# ===================================================
# CONFIG
# ===================================================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
REPORT_DIR = os.path.join(BASE_DIR, "reports")
os.makedirs(REPORT_DIR, exist_ok=True)

FONT_DIR = os.path.join(BASE_DIR, "assets", "fonts")
VN_FONT_PATH = os.path.join(FONT_DIR, "DejaVuSans.ttf")
VN_FONT_NAME = "DejaVuSans"

PRIMARY = HexColor("#7a00ff")
LIGHT_BG = HexColor("#f6f1ff")


# ===================================================
# FONT REGISTER
# ===================================================
if VN_FONT_NAME not in pdfmetrics.getRegisteredFontNames():
    pdfmetrics.registerFont(TTFont(VN_FONT_NAME, VN_FONT_PATH))


# ===================================================
# PAGE DECORATOR (HEADER + FOOTER)
# ===================================================
def _on_each_page(canvas, doc):
    canvas.saveState()

    # HEADER
    canvas.setFillColor(PRIMARY)
    canvas.rect(0, A4[1] - 60, A4[0], 60, stroke=0, fill=1)

    canvas.setFillColor(colors.white)
    canvas.setFont(VN_FONT_NAME, 14)
    canvas.drawCentredString(
        A4[0] / 2,
        A4[1] - 38,
        "BÁO CÁO THẦN SỐ HỌC PITAGO"
    )

    # FOOTER
    canvas.setFillColor(colors.grey)
    canvas.setFont(VN_FONT_NAME, 9)
    canvas.drawCentredString(
        A4[0] / 2,
        22,
        f"Trang {doc.page} – ThanSoHoc AI – {datetime.now().strftime('%d/%m/%Y')}"
    )

    canvas.restoreState()


# ===================================================
# MAIN PDF GENERATOR
# ===================================================
def generate_numerology_pdf(
    *,
    full_name: str,
    birth_date: str,
    numbers: dict,
    ai_content: str,
) -> str:
    """
    Tạo file PDF báo cáo Thần số học.
    Trả về đường dẫn file PDF.
    """

    file_name = f"numerology_{full_name.replace(' ', '_')}_{birth_date}.pdf"
    pdf_path = os.path.join(REPORT_DIR, file_name)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=90,
        bottomMargin=50,
    )

    styles = getSampleStyleSheet()

    # ================= STYLES =================
    styles.add(ParagraphStyle(
        name="TitleVN",
        fontName=VN_FONT_NAME,
        fontSize=20,
        leading=24,
        alignment=1,
        textColor=PRIMARY,
        spaceAfter=20,
    ))

    styles.add(ParagraphStyle(
        name="H2VN",
        fontName=VN_FONT_NAME,
        fontSize=14,
        leading=18,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        fontWeight="bold"
    ))

    styles.add(ParagraphStyle(
        name="BodyVN",
        fontName=VN_FONT_NAME,
        fontSize=11,
        leading=16,
        textColor=colors.black,
        spaceAfter=8,
    ))

    styles.add(ParagraphStyle(
        name="SmallVN",
        fontName=VN_FONT_NAME,
        fontSize=10,
        leading=14,
        textColor=colors.grey,
    ))

    story = []

    # ===================================================
    # TITLE
    # ===================================================
    story.append(Paragraph(
        f"BÁO CÁO THẦN SỐ HỌC<br/>{escape(full_name)}",
        styles["TitleVN"]
    ))

    story.append(Paragraph(
        f"Ngày sinh: {birth_date}",
        styles["SmallVN"]
    ))

    story.append(Spacer(1, 16))

    # ===================================================
    # BASIC INFO TABLE
    # ===================================================
    info_table = Table(
        [
            ["Họ tên", full_name],
            ["Ngày sinh", birth_date],
        ],
        colWidths=[120, 360]
    )

    info_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
        ("FONT", (0, 0), (-1, -1), VN_FONT_NAME),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("ALIGN", (0, 0), (0, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
    ]))

    story.append(info_table)
    story.append(Spacer(1, 18))

    # ===================================================
    # CORE NUMBERS TABLE
    # ===================================================
    story.append(Paragraph("CHỈ SỐ CỐT LÕI", styles["H2VN"]))

    number_table = Table(
        [
            ["Số chủ đạo", numbers.get("life_path")],
            ["Số sứ mệnh", numbers.get("destiny")],
            ["Số linh hồn", numbers.get("soul")],
            ["Số nhân cách", numbers.get("personality")],
        ],
        colWidths=[180, 300]
    )

    number_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
        ("FONT", (0, 0), (-1, -1), VN_FONT_NAME),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("ALIGN", (0, 0), (0, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
    ]))

    story.append(number_table)
    story.append(Spacer(1, 22))

    # ===================================================
    # AI CONTENT (AUTO SECTION SPLIT)
    # ===================================================
    story.append(Paragraph("PHÂN TÍCH CHI TIẾT", styles["H2VN"]))

    sections = (ai_content or "").split("\n\n")
    for sec in sections:
        sec = sec.strip()
        if not sec:
            continue

        # Heading heuristic
        if len(sec) < 60 and sec.upper() == sec:
            story.append(Paragraph(escape(sec), styles["H2VN"]))
        else:
            story.append(Paragraph(escape(sec), styles["BodyVN"]))
            story.append(Spacer(1, 6))

    # ===================================================
    # BUILD
    # ===================================================
    doc.build(
        story,
        onFirstPage=_on_each_page,
        onLaterPages=_on_each_page
    )

    return pdf_path
