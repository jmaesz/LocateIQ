"""
One-time script to fetch all SPX locker locations and save to frontend/src/data/spx_lockers.json
Run from project root: python scripts/fetch_spx.py
"""
import asyncio
import json
import time
from pathlib import Path
import httpx

SPX_API = "https://spx.sg/api/service-point/point/around/list"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
OUT_PATH = Path(__file__).parent.parent / "frontend" / "src" / "data" / "spx_lockers.json"

SG_CENTRES = [
    (1.3521, 103.8198), (1.3300, 103.8450), (1.3200, 103.8200),
    (1.3400, 103.8300), (1.3150, 103.8450), (1.3450, 103.8550),
    (1.4372, 103.7862), (1.4298, 103.8354), (1.4492, 103.8198),
    (1.4121, 103.7448), (1.4200, 103.8600), (1.4050, 103.7700),
    (1.4300, 103.7600), (1.3912, 103.8956), (1.4052, 103.9024),
    (1.3715, 103.8930), (1.3700, 103.8454), (1.3510, 103.8484),
    (1.3506, 103.8729), (1.3850, 103.8700), (1.4000, 103.9100),
    (1.3600, 103.8600), (1.3527, 103.9447), (1.3731, 103.9494),
    (1.3236, 103.9273), (1.3062, 103.9073), (1.3200, 103.9600),
    (1.3400, 103.9600), (1.3600, 103.9300), (1.3100, 103.9400),
    (1.3800, 103.9700), (1.3399, 103.7062), (1.3334, 103.7424),
    (1.3151, 103.7649), (1.3490, 103.7493), (1.3784, 103.7621),
    (1.3600, 103.7200), (1.3200, 103.7300), (1.3700, 103.7450),
    (1.3100, 103.7600), (1.2942, 103.8062), (1.2800, 103.8400),
    (1.3048, 103.8318), (1.2700, 103.8600), (1.2850, 103.8200),
    (1.3000, 103.7900),
]


async def fetch(client, lat, lng):
    try:
        r = await client.get(SPX_API, params={
            "radius": 400000000, "latitude": lat, "longitude": lng,
            "selected_radius": 4000, "support_self_collection": 1,
        }, headers=HEADERS, timeout=10)
        return r.json().get("data", {}).get("list", [])
    except Exception:
        return []


def parse_capacity(additional):
    try:
        return json.loads(additional).get("order_capacity", 50)
    except Exception:
        return 50


async def main():
    all_points = []
    async with httpx.AsyncClient() as client:
        for i in range(0, len(SG_CENTRES), 6):
            batch = SG_CENTRES[i:i + 6]
            results = await asyncio.gather(*[fetch(client, lat, lng) for lat, lng in batch])
            all_points.extend(r for r in results if isinstance(r, list))
            await asyncio.sleep(0.3)

    seen, lockers = set(), []
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
                "orders": parse_capacity(p.get("additional", "{}")),
            })

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(lockers, indent=2))
    print(f"Saved {len(lockers)} SPX lockers to {OUT_PATH}")


asyncio.run(main())
