def map_esgoo_to_schema(esgoo_json: dict):
    if not esgoo_json:
        return {}

    return {
        "life_path": {
            "number": int(esgoo_json.get("SoChuDao", 0)),
            "source": "esgoo"
        },
        "destiny": {
            "number": int(esgoo_json.get("SoSuMenh", 0))
        },
        "soul": {
            "number": int(esgoo_json.get("SoLinhHon", 0))
        },
        "personality": {
            "number": int(esgoo_json.get("SoNhanCach", 0))
        },
        "birth_chart": esgoo_json.get("BieuDoNgaySinh", {}),
        "arrows": {
            "strong": esgoo_json.get("MuiTenManh", []),
            "weak": esgoo_json.get("MuiTenYeu", [])
        },
        "extra": {
            "raw": esgoo_json
        }
    }
