import httpx

MAS_API = "https://eservices.mas.gov.sg/api/action/datastore/search.json"
RESOURCE_ID = "95932927-c8bc-4e7a-b484-68a66a24edfe"


async def get_exchange_rates() -> dict:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(MAS_API, params={
            "resource_id": RESOURCE_ID,
            "limit": 1,
            "sort": "end_of_day desc",
            "fields": "end_of_day,usd_sgd,myr_sgd,eur_sgd,cny_sgd",
        })
        data = resp.json()
        if data.get("success") and data["result"]["records"]:
            rec = data["result"]["records"][0]
            return {
                "date": rec.get("end_of_day"),
                "USD_SGD": _float(rec.get("usd_sgd")),
                "MYR_SGD": _float(rec.get("myr_sgd")),
                "EUR_SGD": _float(rec.get("eur_sgd")),
                "CNY_SGD": _float(rec.get("cny_sgd")),
            }
    return {}


def _float(val) -> float | None:
    try:
        return round(float(val), 4) if val else None
    except (TypeError, ValueError):
        return None
