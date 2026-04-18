from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.onemap import geocode_postal, haversine_km
from services.courier_rates import get_all_estimates

router = APIRouter()


class DeliveryRequest(BaseModel):
    origin_postal: str = Field(..., min_length=6, max_length=6)
    dest_postal: str = Field(..., min_length=6, max_length=6)
    weight_kg: float = Field(1.0, gt=0, le=30)


@router.post("/estimate")
async def estimate_delivery(req: DeliveryRequest):
    origin, dest = await geocode_postal(req.origin_postal), await geocode_postal(req.dest_postal)

    if not origin:
        raise HTTPException(400, f"Postal code {req.origin_postal} not found in Singapore")
    if not dest:
        raise HTTPException(400, f"Postal code {req.dest_postal} not found in Singapore")

    distance_km = haversine_km(origin["lat"], origin["lng"], dest["lat"], dest["lng"])
    estimates = get_all_estimates(req.weight_kg, distance_km)

    return {
        "origin": origin,
        "destination": dest,
        "distance_km": round(distance_km, 2),
        "weight_kg": req.weight_kg,
        "estimates": estimates,
        "cheapest": estimates[0]["courier"],
    }
