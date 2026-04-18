from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import delivery, rates, warehouse

app = FastAPI(title="SG Delivery Cost Estimator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(delivery.router, prefix="/api")
app.include_router(rates.router, prefix="/api")
app.include_router(warehouse.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
