import http.client
from urllib.parse import urlencode

conn = http.client.HTTPSConnection("api.sandbox.africastalking.com", 443, timeout=10)

payload = urlencode({
    "username": "sandbox",
    "to": "+22890684048",
    "message": "Test",
})

headers = {
    "Apikey": "atsk_7989e4b7de61410a6266130f8843df933ebd4f4324166951d1e1fa24ccff34b583877ccf",
    "Content-Type": "application/x-www-form-urlencoded",
}

conn.request("POST", "/version1/messaging", body=payload, headers=headers)
resp = conn.getresponse()
print("Statut:", resp.status)
print("Réponse:", resp.read().decode())
conn.close()