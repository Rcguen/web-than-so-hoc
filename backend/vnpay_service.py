import hmac
import hashlib
import urllib.parse
from datetime import datetime

def create_vnpay_url(order_id, amount, ip_addr, tmn_code, hash_secret, return_url, pay_url):
    vnp_params = {
        "vnp_Version": "2.1.0",
        "vnp_Command": "pay",
        "vnp_TmnCode": tmn_code,
        "vnp_Amount": int(amount) * 100,
        "vnp_CurrCode": "VND",
        "vnp_TxnRef": order_id,
        "vnp_OrderInfo": "Thanh toan don hang",
        "vnp_OrderType": "other",
        "vnp_Locale": "vn",
        "vnp_ReturnUrl": return_url,
        "vnp_IpAddr": ip_addr,
        "vnp_CreateDate": datetime.now().strftime("%Y%m%d%H%M%S"),
    }

    sorted_params = sorted(vnp_params.items())
    query_string = urllib.parse.urlencode(sorted_params)

    secure_hash = hmac.new(
        hash_secret.encode(),
        query_string.encode(),
        hashlib.sha512
    ).hexdigest()

    return f"{pay_url}?{query_string}&vnp_SecureHash={secure_hash}"
