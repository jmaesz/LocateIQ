import asyncio
import json
import time
import httpx

SPX_API = "https://spx.sg/api/service-point/point/around/list"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
CACHE_TTL = 6 * 3600  # 6 hours

_cache: list[dict] = []
_cache_ts: float = 0.0

# ~1.5km grid across Singapore's bounding box
SG_CENTRES = [
    # Central
    (1.3521, 103.8198),
    (1.3300, 103.8450),
    (1.3200, 103.8200),
    (1.3400, 103.8300),
    (1.3150, 103.8450),
    (1.3450, 103.8550),
    # North
    (1.4372, 103.7862),  # Woodlands
    (1.4298, 103.8354),  # Yishun
    (1.4492, 103.8198),  # Sembawang
    (1.4121, 103.7448),  # Choa Chu Kang
    (1.4200, 103.8600),  # Yishun East
    (1.4050, 103.7700),  # Bukit Panjang North
    (1.4300, 103.7600),  # Woodlands West
    # North-East
    (1.3912, 103.8956),  # Sengkang
    (1.4052, 103.9024),  # Punggol
    (1.3715, 103.8930),  # Hougang
    (1.3700, 103.8454),  # Ang Mo Kio
    (1.3510, 103.8484),  # Bishan
    (1.3506, 103.8729),  # Serangoon
    (1.3850, 103.8700),  # AMK / Yio Chu Kang
    (1.4000, 103.9100),  # Punggol East
    (1.3600, 103.8600),  # Lorong Chuan
    # East
    (1.3527, 103.9447),  # Tampines
    (1.3731, 103.9494),  # Pasir Ris
    (1.3236, 103.9273),  # Bedok
    (1.3062, 103.9073),  # Marine Parade / Katong
    (1.3200, 103.9600),  # Changi / Upper Changi
    (1.3400, 103.9600),  # Tampines North / Changi
    (1.3600, 103.9300),  # Sengkang West / Tampines West
    (1.3100, 103.9400),  # Bedok South / East Coast
    (1.3800, 103.9700),  # Pasir Ris West
    # West
    (1.3399, 103.7062),  # Jurong West
    (1.3334, 103.7424),  # Jurong East
    (1.3151, 103.7649),  # Clementi
    (1.3490, 103.7493),  # Bukit Batok
    (1.3784, 103.7621),  # Bukit Panjang
    (1.3600, 103.7200),  # Jurong West North
    (1.3200, 103.7300),  # Pioneer / Tuas
    (1.3700, 103.7450),  # Bukit Batok North
    (1.3100, 103.7600),  # Clementi West
    # South
    (1.2942, 103.8062),  # Queenstown
    (1.2800, 103.8400),  # HarbourFront / Telok Blangah
    (1.3048, 103.8318),  # Orchard / River Valley
    (1.2700, 103.8600),  # Sentosa / Tanjong Pagar
    (1.2850, 103.8200),  # Buona Vista / one-north
    (1.3000, 103.7900),  # Holland / Ghim Moh
]


async def _fetch_points(client: httpx.AsyncClient, lat: float, lng: float) -> list[dict]:
    try:
        resp = await client.get(SPX_API, params={
            "radius": 400000000,
            "latitude": lat,
            "longitude": lng,
            "selected_radius": 4000,
            "support_self_collection": 1,
        }, headers=HEADERS, timeout=10)
        data = resp.json()
        return data.get("data", {}).get("list", [])
    except Exception:
        return []


def _parse_capacity(additional: str) -> int:
    try:
        return json.loads(additional).get("order_capacity", 50)
    except Exception:
        return 50


async def fetch_spx_lockers() -> list[dict]:
    global _cache, _cache_ts

    if _cache and (time.time() - _cache_ts) < CACHE_TTL:
        return _cache

    all_points: list[list[dict]] = []
    batch_size = 6

    async with httpx.AsyncClient() as client:
        for i in range(0, len(SG_CENTRES), batch_size):
            batch = SG_CENTRES[i:i + batch_size]
            results = await asyncio.gather(
                *[_fetch_points(client, lat, lng) for lat, lng in batch],
                return_exceptions=True,
            )
            all_points.extend(r for r in results if isinstance(r, list))
            await asyncio.sleep(0.3)

    seen: set[int] = set()
    lockers = []
    for batch in all_points:
        for p in batch:
            if p.get("is_spx_point") != 1 or p["id"] in seen:
                continue
            seen.add(p["id"])
            lockers.append({
                "id": p["id"],
                "name": p.get("alias", f"SPX Locker #{p['id']}"),
                "lat": p["latitude"],
                "lng": p["longitude"],
                "orders": _parse_capacity(p.get("additional", "{}")),
            })

    _cache = lockers
    _cache_ts = time.time()
    return lockers
