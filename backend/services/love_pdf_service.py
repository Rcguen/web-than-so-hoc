# services/love_pdf_service.py
from __future__ import annotations

import re
import math
from datetime import datetime
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


# =========================
# FONT CONFIG (Unicode VN)
# =========================
BASE_DIR = Path(__file__).resolve().parents[1]  # backend/
FONT_PATH = BASE_DIR / "assets" / "fonts" / "DejaVuSans.ttf"
FONT_NAME = "DejaVuSans"

if not FONT_PATH.exists():
    raise FileNotFoundError(
        f"❌ Thiếu font Unicode: {FONT_PATH}\n"
        "👉 Tải DejaVuSans.ttf và đặt đúng thư mục assets/fonts/"
    )

pdfmetrics.registerFont(TTFont(FONT_NAME, str(FONT_PATH)))


# =========================
# HELPERS
# =========================

def _safe_filename(text: str) -> str:
    text = (text or "").strip()
    text = re.sub(r"[^\w\-]+", "_", text, flags=re.UNICODE)
    return text[:80] or "love_report"


def _ensure_reports_dir() -> Path:
    p = BASE_DIR / "reports"
    p.mkdir(parents=True, exist_ok=True)
    return p


def _draw_paragraph(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    max_width: float,
    line_height: float,
) -> float:
    """
    Vẽ đoạn văn tự wrap + tự sang trang
    """
    words = (text or "").split()
    line = ""

    for w in words:
        test = (line + " " + w).strip()
        if c.stringWidth(test, FONT_NAME, 11) <= max_width:
            line = test
        else:
            c.drawString(x, y, line)
            y -= line_height
            line = w

            if y < 20 * mm:
                c.showPage()
                c.setFont(FONT_NAME, 11)
                y = A4[1] - 20 * mm

    if line:
        c.drawString(x, y, line)
        y -= line_height

    return y


# =========================
# MAIN PDF GENERATOR
# =========================
def draw_radar_chart(
    c,
    center_x,
    center_y,
    radius,
    labels,
    values,
    max_value=100,
):
    """
    Vẽ Radar Chart (Spider Chart)
    - labels: ["Cảm xúc", "Giao tiếp", ...]
    - values: [80, 70, ...] (0–100)
    """

    n = len(labels)
    angle_step = 2 * math.pi / n

    # ===== Vẽ vòng tròn nền =====
    c.setStrokeColor(colors.lightgrey)
    for level in [0.25, 0.5, 0.75, 1]:
        c.circle(center_x, center_y, radius * level, stroke=1, fill=0)

    # ===== Vẽ trục =====
    for i in range(n):
        angle = angle_step * i - math.pi / 2
        x = center_x + radius * math.cos(angle)
        y = center_y + radius * math.sin(angle)
        c.line(center_x, center_y, x, y)

    # ===== Nhãn =====
    c.setFont("DejaVuSans", 9)
    for i, label in enumerate(labels):
        angle = angle_step * i - math.pi / 2
        lx = center_x + (radius + 8 * mm) * math.cos(angle)
        ly = center_y + (radius + 8 * mm) * math.sin(angle)
        c.drawCentredString(lx, ly, label)

    # ===== Dữ liệu =====
    points = []
    for i, val in enumerate(values):
        val = max(0, min(val, max_value))
        ratio = val / max_value
        angle = angle_step * i - math.pi / 2
        x = center_x + radius * ratio * math.cos(angle)
        y = center_y + radius * ratio * math.sin(angle)
        points.append((x, y))

    # ===== Đa giác =====
    c.setStrokeColor(colors.HexColor("#7a00ff"))
    c.setFillColor(colors.Color(122/255, 0, 1, alpha=0.25))
    c.polygon(points, stroke=1, fill=1)

def generate_love_pdf(
    output_path: str,
    person: dict,
    ai_text: str,
    scores: dict,
):
    """
    scores = {
        "overall": 80,
        "emotional": 75,
        "communication": 65,
        "stability": 70,
        "chemistry": 85
    }
    """

    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4

    # =========================
    # TITLE
    # =========================
    c.setFont("DejaVuSans", 20)
    c.drawCentredString(width / 2, height - 30 * mm, "BÁO CÁO TÌNH YÊU")

    c.setFont("DejaVuSans", 11)
    c.drawString(25 * mm, height - 40 * mm, f"Họ tên: {person['name']}")
    c.drawString(25 * mm, height - 48 * mm, f"Ngày sinh: {person['birth_date']}")

    # =========================
    # AI CONTENT
    # =========================
    text = c.beginText(25 * mm, height - 65 * mm)
    text.setFont("DejaVuSans", 10)
    text.setLeading(15)

    for line in ai_text.split("\n"):
        text.textLine(line)

    c.drawText(text)

    # =========================
    # RADAR CHART
    # =========================
    labels = [
        "Tổng quan",
        "Cảm xúc",
        "Giao tiếp",
        "Ổn định",
        "Sức hút",
    ]

    values = [
        scores.get("overall", 0),
        scores.get("emotional", 0),
        scores.get("communication", 0),
        scores.get("stability", 0),
        scores.get("chemistry", 0),
    ]

    draw_radar_chart(
        c=c,
        center_x=width - 60 * mm,
        center_y=height - 120 * mm,
        radius=32 * mm,
        labels=labels,
        values=values,
    )

    # =========================
    # FOOTER
    # =========================
    c.setFont("DejaVuSans", 9)
    c.setFillColor(colors.grey)
    c.drawCentredString(
        width / 2,
        15 * mm,
        "Báo cáo mang tính tham khảo – Thần số học Pitago",
    )

    c.showPage()
    c.save()

    return output_path

def draw_radar_chart_couple(
    c,
    center_x,
    center_y,
    radius,
    labels,
    values_a,
    values_b,
    max_value=100,
    name_a="Người A",
    name_b="Người B",
):
    """
    Radar chart cho 2 người (2 polygon chồng nhau)
    """

    n = len(labels)
    angle_step = 2 * math.pi / n

    # =========================
    # VÒNG NỀN
    # =========================
    c.setStrokeColor(colors.lightgrey)
    for level in [0.25, 0.5, 0.75, 1]:
        c.circle(center_x, center_y, radius * level, stroke=1, fill=0)

    # =========================
    # TRỤC
    # =========================
    for i in range(n):
        angle = angle_step * i - math.pi / 2
        x = center_x + radius * math.cos(angle)
        y = center_y + radius * math.sin(angle)
        c.line(center_x, center_y, x, y)

    # =========================
    # NHÃN
    # =========================
    c.setFont("DejaVuSans", 9)
    for i, label in enumerate(labels):
        angle = angle_step * i - math.pi / 2
        lx = center_x + (radius + 7 * mm) * math.cos(angle)
        ly = center_y + (radius + 7 * mm) * math.sin(angle)
        c.drawCentredString(lx, ly, label)

    # =========================
    # POLYGON NGƯỜI A
    # =========================
    points_a = []
    for i, val in enumerate(values_a):
        ratio = max(0, min(val, max_value)) / max_value
        angle = angle_step * i - math.pi / 2
        x = center_x + radius * ratio * math.cos(angle)
        y = center_y + radius * ratio * math.sin(angle)
        points_a.append((x, y))

    c.setStrokeColor(colors.HexColor("#7a00ff"))
    c.setFillColor(colors.Color(122 / 255, 0, 255 / 255, alpha=0.25))
    c.polygon(points_a, stroke=1, fill=1)

    # =========================
    # POLYGON NGƯỜI B
    # =========================
    points_b = []
    for i, val in enumerate(values_b):
        ratio = max(0, min(val, max_value)) / max_value
        angle = angle_step * i - math.pi / 2
        x = center_x + radius * ratio * math.cos(angle)
        y = center_y + radius * ratio * math.sin(angle)
        points_b.append((x, y))

    c.setStrokeColor(colors.HexColor("#ff6b6b"))
    c.setFillColor(colors.Color(255 / 255, 107 / 255, 107 / 255, alpha=0.25))
    c.polygon(points_b, stroke=1, fill=1)

    # =========================
    # LEGEND
    # =========================
    c.setFont("DejaVuSans", 9)
    c.setFillColor(colors.HexColor("#7a00ff"))
    c.drawString(center_x - radius, center_y - radius - 10 * mm, f"■ {name_a}")

    c.setFillColor(colors.HexColor("#ff6b6b"))
    c.drawString(center_x + 5 * mm, center_y - radius - 10 * mm, f"■ {name_b}")
def generate_love_pdf_couple(
    output_path: str,
    person_a: dict,
    person_b: dict,
    ai_text: str,
    scores_a: dict,
    scores_b: dict,
):
    """
    Tạo PDF cho couple (2 người)
    """

    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4

    # =========================
    # TITLE
    # =========================
    c.setFont("DejaVuSans", 20)
    c.drawCentredString(width / 2, height - 30 * mm, "BÁO CÁO TÌNH YÊU")

    c.setFont("DejaVuSans", 11)
    c.drawString(25 * mm, height - 40 * mm, f"Người A: {person_a['name']} ({person_a['birth_date']})")
    c.drawString(25 * mm, height - 48 * mm, f"Người B: {person_b['name']} ({person_b['birth_date']})")

    # =========================
    # AI CONTENT
    # =========================
    text = c.beginText(25 * mm, height - 65 * mm)
    text.setFont("DejaVuSans", 10)
    text.setLeading(15)

    for line in ai_text.split("\n"):
        text.textLine(line)

    c.drawText(text)

    # =========================
    # RADAR CHART COUPLE
    # =========================
    labels = [
        "Tổng quan",
        "Cảm xúc",
        "Giao tiếp",
        "Ổn định",
        "Sức hút",
    ]

    values_a = [
        scores_a.get("overall", 0),
        scores_a.get("emotional", 0),
        scores_a.get("communication", 0),
        scores_a.get("stability", 0),
        scores_a.get("chemistry", 0),
    ]

    values_b = [
        scores_b.get("overall", 0),
        scores_b.get("emotional", 0),
        scores_b.get("communication", 0),
        scores_b.get("stability", 0),
        scores_b.get("chemistry", 0),
    ]

    draw_radar_chart_couple(
        c=c,
        center_x=width - 60 * mm,
        center_y=height - 100 * mm,
        labels=labels,
        values_a=values_a,
        values_b=values_b,
        name_a=person_a["name"],
        name_b=person_b["name"],
    )

    c.save()