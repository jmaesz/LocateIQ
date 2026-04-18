import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.kmeans_warehouse import run_kmeans
from services.spx import fetch_spx_lockers

router = APIRouter()

NOMINATIM = "https://nominatim.openstreetmap.org/reverse"


async def reverse_geocode(lat: float, lng: float) -> str:
    try:
        async with httpx.AsyncClient(timeout=5, headers={"User-Agent": "sg-delivery-estimator/1.0"}) as client:
            r = await client.get(NOMINATIM, params={"lat": lat, "lon": lng, "format": "json"})
            data = r.json()
            addr = data.get("address", {})
            parts = [
                addr.get("road") or addr.get("suburb"),
                addr.get("suburb") or addr.get("town"),
                "Singapore",
            ]
            return ", ".join(p for p in parts if p)
    except Exception:
        return f"{lat:.4f}, {lng:.4f}"


class OptimiseRequest(BaseModel):
    k: int = Field(3, ge=1, le=10)


@router.post("/warehouse/optimise")
async def optimise_warehouse(req: OptimiseRequest):
    lockers = await fetch_spx_lockers()
    if not lockers:
        raise HTTPException(503, "Could not fetch SPX locker data")

    result = run_kmeans(lockers, req.k)

    for cluster in result["clusters"]:
        cluster["nearest_address"] = await reverse_geocode(
            cluster["centroid_lat"], cluster["centroid_lng"]
        )

    return {**result, "lockers": lockers}


@router.get("/warehouse/lockers")
async def get_lockers():
    lockers = await fetch_spx_lockers()
    if not lockers:
        raise HTTPException(503, "Could not fetch SPX locker data")
    return lockers
