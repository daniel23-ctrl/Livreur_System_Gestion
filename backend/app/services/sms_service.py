import http.client
from urllib.parse import urlencode
from app.core.config import settings


def envoyer_sms(telephone: str, message: str) -> bool:
    """Envoie un SMS via l'API REST Africa's Talking (appel direct via http.client)."""
    numero_formate = telephone if telephone.startswith("+") else f"+228{telephone}"

    conn = http.client.HTTPSConnection("api.sandbox.africastalking.com", 443, timeout=10)

    payload = urlencode({
        "username": settings.AFRICAS_TALKING_USERNAME,
        "to": numero_formate,
        "message": message,
    })
    headers = {
        "Apikey": settings.AFRICAS_TALKING_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
    }

    try:
        conn.request("POST", "/version1/messaging", body=payload, headers=headers)
        resp = conn.getresponse()
        data = resp.read().decode()
        print(f"[SMS] status={resp.status} body={data}")
        return resp.status == 201
    except Exception as e:
        print(f"[SMS] Erreur envoi vers {telephone}: {e}")
        return False
    finally:
        conn.close()