# services/love_scoring.py
from __future__ import annotations

def _to_int(x, default=0):
    try:
        return int(x)
    except Exception:
        return default

def clamp(v, lo=0, hi=100):
    return max(lo, min(hi, v))


# Mapping Life Path -> xu hướng tình yêu
LP_PROFILE = {
    1: dict(independent=90, romantic=55, stable=55, talk=60),
    2: dict(independent=45, romantic=85, stable=70, talk=75),
    3: dict(independent=55, romantic=70, stable=55, talk=90),
    4: dict(independent=55, romantic=55, stable=90, talk=60),
    5: dict(independent=85, romantic=65, stable=40, talk=70),
    6: dict(independent=50, romantic=95, stable=80, talk=65),
    7: dict(independent=80, romantic=50, stable=60, talk=45),
    8: dict(independent=75, romantic=55, stable=75, talk=55),
    9: dict(independent=55, romantic=80, stable=60, talk=70),
    11: dict(independent=60, romantic=85, stable=55, talk=70),
    22: dict(independent=65, romantic=60, stable=95, talk=60),
    33: dict(independent=55, romantic=95, stable=75, talk=75),
}


def score_single_from_numbers(numbers: dict) -> dict:
    """
    Trả về radar scores cho 1 người
    """
    lp = _to_int(numbers.get("life_path"))
    destiny = _to_int(numbers.get("destiny"))
    soul = _to_int(numbers.get("soul"))
    personality = _to_int(numbers.get("personality"))

    base = LP_PROFILE.get(lp, dict(independent=60, romantic=60, stable=60, talk=60))

    emotional = 0.6 * base["romantic"] + 0.4 * (50 + (soul % 10) * 5)
    communication = 0.6 * base["talk"] + 0.4 * (50 + (personality % 10) * 5)
    stability = 0.7 * base["stable"] + 0.3 * (50 + (destiny % 10) * 5)
    chemistry = 0.5 * base["independent"] + 0.5 * emotional

    overall = (emotional + communication + stability + chemistry) / 4

    return {
        "overall": int(clamp(overall)),
        "emotional": int(clamp(emotional)),
        "communication": int(clamp(communication)),
        "stability": int(clamp(stability)),
        "chemistry": int(clamp(chemistry)),
    }


def score_couple_compat(scores_a: dict, scores_b: dict) -> dict:
    """
    Điểm tương hợp của 2 người
    """
    def compat(a, b):
        return clamp(100 - abs((a or 0) - (b or 0)))

    emotional = compat(scores_a["emotional"], scores_b["emotional"])
    communication = compat(scores_a["communication"], scores_b["communication"])
    stability = compat(scores_a["stability"], scores_b["stability"])
    chemistry = int((scores_a["chemistry"] + scores_b["chemistry"]) / 2)

    overall = int((emotional + communication + stability + chemistry) / 4)

    return {
        "overall": overall,
        "emotional": emotional,
        "communication": communication,
        "stability": stability,
        "chemistry": chemistry,
    }
