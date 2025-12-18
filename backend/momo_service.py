import hmac
import hashlib
import requests
import uuid

def create_momo_payment(order_id, amount, return_url, ipn_url,
                        partner_code, access_key, secret_key, endpoint):

    request_id = str(uuid.uuid4())
    order_info = "Thanh toan don hang"

    raw_signature = (
        f"accessKey={access_key}"
        f"&amount={amount}"
        f"&extraData="
        f"&ipnUrl={ipn_url}"
        f"&orderId={order_id}"
        f"&orderInfo={order_info}"
        f"&partnerCode={partner_code}"
        f"&redirectUrl={return_url}"
        f"&requestId={request_id}"
        f"&requestType=captureWallet"
    )

    signature = hmac.new(
        secret_key.encode(),
        raw_signature.encode(),
        hashlib.sha256
    ).hexdigest()

    payload = {
        "partnerCode": partner_code,
        "accessKey": access_key,
        "requestId": request_id,
        "amount": str(amount),
        "orderId": order_id,
        "orderInfo": order_info,
        "redirectUrl": return_url,
        "ipnUrl": ipn_url,
        "extraData": "",
        "requestType": "captureWallet",
        "signature": signature,
        "lang": "vi"
    }

    response = requests.post(endpoint, json=payload, timeout=10)
    return response.json()
