import httpx
import math

ONEMAP_SEARCH = "https://www.onemap.gov.sg/api/common/elastic/search"


async def geocode_postal(postal: str) -> dict | None:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(ONEMAP_SEARCH, params={
            "searchVal": postal,
            "returnGeom": "Y",
            "getAddrDetails": "Y",
            "pageNum": 1,
        })
        data = resp.json()
        if data.get("found", 0) > 0:
            r = data["results"][0]
            return {
                "postal": postal,
                "address": r.get("ADDRESS", ""),
                "lat": float(r["LATITUDE"]),
                "lng": float(r["LONGITUDE"]),
            }
    return None


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
         * math.sin(dlng / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))
