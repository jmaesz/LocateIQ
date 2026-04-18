from fastapi import APIRouter, HTTPException
from services.mas import get_exchange_rates

router = APIRouter()


@router.get("/exchange-rates")
async def exchange_rates():
    rates = await get_exchange_rates()
    if not rates:
        raise HTTPException(503, "Unable to fetch exchange rates from MAS")
    return rates
