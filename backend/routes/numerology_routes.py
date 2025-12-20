from flask import Blueprint, jsonify
import requests
import urllib.parse
from esgoo_mapper import map_esgoo_to_schema

external_bp = Blueprint(
    "numerology_external",
    __name__,
    url_prefix="/api/numerology/external"
)

@external_bp.route("/<name>/<birth>", methods=["GET"])
def get_external_numerology(name, birth):
    try:
        # Encode tiếng Việt
        name_enc = urllib.parse.quote(name)
        birth_enc = urllib.parse.quote(birth)

        # Gọi API ESGOO
        url = f"https://esgoo.net/api-tsh/{name_enc}/{birth_enc}.htm"
        res = requests.get(url, timeout=15)

        if res.status_code != 200:
            return jsonify({"error": "ESGOO API error"}), 502

        raw = res.json()

        # Map dữ liệu
        mapped = map_esgoo_to_schema(raw)

        return jsonify({
            "source": "esgoo",
            "mapped": mapped
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
