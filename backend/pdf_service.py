# pdf_service.py
import os
import datetime
from typing import Dict, Any
from xml.sax.saxutils import escape

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


# =========================
# Font (hỗ trợ tiếng Việt)
# Ưu tiên font TTF nếu có; fallback Helvetica (có thể mất dấu).
# =========================
def _register_vietnamese_font() -> str:
    candidates = [
        # Windows
        r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\tahoma.ttf",
        r"C:\Windows\Fonts\times.ttf",
        # Linux
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                pdfmetrics.registerFont(TTFont("VNFont", p))
                return "VNFont"
            except Exception:
                continue
    return "Helvetica"


VN_FONT_NAME = _register_vietnamese_font()


def _safe_filename(name: str) -> str:
    keep = []
    for ch in name:
        if ch.isalnum() or ch in (" ", "_", "-"):
            keep.append(ch)
    s = "".join(keep).strip().replace(" ", "_")
    return s or "report"


def generate_numerology_pdf(
    full_name: str,
    birth_date: str,
    numbers: Dict[str, Any],
    ai_content: str,
    output_dir: str = "reports",
) -> str:
    """
    Tạo PDF báo cáo đẹp, trả về đường dẫn file.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(base_dir, output_dir)
    os.makedirs(out_dir, exist_ok=True)

    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"numerology_{_safe_filename(full_name)}_{ts}.pdf"
    file_path = os.path.join(out_dir, filename)

    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        leftMargin=2.0 * cm,
        rightMargin=2.0 * cm,
        topMargin=2.0 * cm,
        bottomMargin=2.0 * cm,
        title="Báo cáo Thần số học",
        author="ThanSoHoc AI",
    )

    styles = getSampleStyleSheet()

    styles.add(
        ParagraphStyle(
            name="TitleVN",
            fontName=VN_FONT_NAME,
            fontSize=20,
            leading=26,
            alignment=TA_CENTER,
            spaceAfter=12,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H2VN",
            fontName=VN_FONT_NAME,
            fontSize=14,
            leading=18,
            spaceBefore=10,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyVN",
            fontName=VN_FONT_NAME,
            fontSize=11,
            leading=16,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SmallVN",
            fontName=VN_FONT_NAME,
            fontSize=9,
            leading=12,
            textColor=colors.grey,
        )
    )

    story = []

    # ===== COVER =====
    story.append(Paragraph("BÁO CÁO THẦN SỐ HỌC", styles["TitleVN"]))
    story.append(Paragraph("(Hệ Pitago)", styles["BodyVN"]))
    story.append(Spacer(1, 10))

    info_data = [
        ["Họ tên", escape(str(full_name))],
        ["Ngày sinh", escape(str(birth_date))],
        ["Ngày tạo báo cáo", datetime.datetime.now().strftime("%d/%m/%Y %H:%M")],
    ]
    t = Table(info_data, colWidths=[4 * cm, 11 * cm])
    t.setStyle(
        TableStyle(
            [
                ("FONT", (0, 0), (-1, -1), VN_FONT_NAME),
                ("FONTSIZE", (0, 0), (-1, -1), 11),
                ("BACKGROUND", (0, 0), (-1, 0), colors.whitesmoke),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.grey),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.lightgrey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(t)
    story.append(Spacer(1, 12))

    # ===== NUMBERS TABLE =====
    story.append(Paragraph("Chỉ số", styles["H2VN"]))
    num_data = [
        ["Life Path", escape(str(numbers.get("life_path", "")))],
        ["Destiny", escape(str(numbers.get("destiny", "")))],
        ["Soul", escape(str(numbers.get("soul", "")))],
        ["Personality", escape(str(numbers.get("personality", "")))],
    ]
    t2 = Table(num_data, colWidths=[4 * cm, 11 * cm])
    t2.setStyle(
        TableStyle(
            [
                ("FONT", (0, 0), (-1, -1), VN_FONT_NAME),
                ("FONTSIZE", (0, 0), (-1, -1), 11),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.grey),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.lightgrey),
                ("BACKGROUND", (0, 0), (-1, 0), colors.whitesmoke),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    story.append(t2)
    story.append(Spacer(1, 12))

    # ===== AI CONTENT =====
    story.append(Paragraph("Phân tích chi tiết", styles["H2VN"]))

    ai_content = ai_content or ""
    lines = [ln.rstrip() for ln in ai_content.splitlines()]
    html_parts = []
    for ln in lines:
        if not ln.strip():
            html_parts.append("<br/>")
        else:
            html_parts.append(escape(ln))
            html_parts.append("<br/>")
    html = "".join(html_parts)

    story.append(Paragraph(html, styles["BodyVN"]))

    # ===== FOOTER =====
    story.append(Spacer(1, 16))
    story.append(
        Paragraph(
            f"<i>Báo cáo được tạo tự động bởi hệ thống – {datetime.datetime.now().strftime('%d/%m/%Y')}</i>",
            styles["SmallVN"],
        )
    )

    doc.build(story)
    return file_path
