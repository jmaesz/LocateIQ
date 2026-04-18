# LocateIQ

*Find your optimal fulfillment location, powered by real SPX data.*

A Singapore-focused supply chain analytics tool with two modules: a last-mile delivery cost estimator that compares courier prices by postal code, and a warehouse location optimiser that uses demand-weighted K-means clustering on SPX locker data to recommend optimal fulfillment centre placement across Singapore.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 6 + Tailwind CSS v4 |
| Backend | FastAPI + Uvicorn |
| Clustering | scikit-learn (K-Means with sample weights) |
| Map | React-Leaflet + OpenStreetMap |
| Geocoding | OneMap API (SLA Singapore) — no key required |
| Reverse Geocoding | Nominatim (OpenStreetMap) — no key required |
| Exchange Rates | MAS (Monetary Authority of Singapore) API — no key required |

---

## Features

### Delivery Estimator
- **Postal code lookup** via OneMap — resolves full Singapore addresses
- **Distance calculation** using the Haversine formula (straight-line km)
- **Courier comparison** across 5 providers, sorted cheapest first
- **Live MAS exchange rates** — USD, MYR, EUR, CNY to SGD

### Warehouse Optimiser
- **45 SPX locker locations** across Singapore with real order volume weights
- **Demand-weighted K-means** — higher-volume lockers pull the centroid harder
- **K = 1–5 warehouses** selectable via slider
- **Interactive map** — locker circles sized by volume, coloured by cluster, 🏭 pin at each warehouse centroid
- **Cluster cards** — recommended address, orders served, locker count, weighted avg distance

---

## Project Structure

```
Supply Chain/
├── backend/
│   ├── main.py                        # FastAPI app entry point
│   ├── requirements.txt
│   ├── data/
│   │   └── spx_lockers.json           # 45 SPX locker locations + order volumes
│   ├── routers/
│   │   ├── delivery.py                # POST /api/estimate
│   │   ├── rates.py                   # GET /api/exchange-rates
│   │   └── warehouse.py               # POST /api/warehouse/optimise, GET /api/warehouse/lockers
│   └── services/
│       ├── onemap.py                  # OneMap geocoding + Haversine distance
│       ├── mas.py                     # MAS exchange rates
│       ├── courier_rates.py           # Courier rate tables
│       └── kmeans_warehouse.py        # Demand-weighted K-means clustering
└── frontend/
    ├── index.html
    ├── vite.config.js                 # Proxies /api → FastAPI on port 8000
    └── src/
        ├── App.jsx                    # Tabbed layout
        ├── index.css
        └── components/
            ├── DeliveryForm.jsx       # Postal code + weight form
            ├── ResultsTable.jsx       # Courier comparison table
            ├── ExchangeRates.jsx      # MAS rates widget
            ├── WarehouseOptimiser.jsx # K slider + cluster result cards
            └── ClusterMap.jsx         # Leaflet map with locker + centroid markers
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at `http://localhost:8000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## API Reference

### `POST /api/estimate`

Estimates delivery cost between two Singapore postal codes.

**Request body:**
```json
{
  "origin_postal": "018956",
  "dest_postal": "238823",
  "weight_kg": 1.5
}
```

**Response:**
```json
{
  "origin": { "postal": "018956", "address": "...", "lat": 1.28, "lng": 103.85 },
  "destination": { "postal": "238823", "address": "...", "lat": 1.30, "lng": 103.83 },
  "distance_km": 3.12,
  "weight_kg": 1.5,
  "cheapest": "J&T Express",
  "estimates": [
    { "courier": "J&T Express", "cost_sgd": 3.50, "estimated_days": "1-3 days", "color": "#E8192C" }
  ]
}
```

### `GET /api/exchange-rates`

Returns latest SGD exchange rates from MAS.

**Response:**
```json
{
  "date": "2026-04-17",
  "USD_SGD": 1.3412,
  "MYR_SGD": 0.3021,
  "EUR_SGD": 1.4850,
  "CNY_SGD": 0.1842
}
```

### `POST /api/warehouse/optimise`

Runs demand-weighted K-means on all SPX locker locations and returns optimal warehouse placements.

**Request body:**
```json
{ "k": 3 }
```

**Response:**
```json
{
  "k": 3,
  "total_weighted_distance_km": 4821.3,
  "clusters": [
    {
      "id": 0,
      "color": "#EF4444",
      "centroid_lat": 1.3812,
      "centroid_lng": 103.9102,
      "nearest_address": "Sengkang East Ave, Sengkang, Singapore",
      "total_orders": 1450,
      "locker_count": 12,
      "avg_distance_km": 3.21
    }
  ],
  "assignments": [{ "locker_id": 1, "cluster_id": 0 }],
  "lockers": [...]
}
```

### `GET /api/warehouse/lockers`

Returns all 45 SPX locker locations with coordinates and order volumes.

---

## Courier Rate Notes

| Courier | Pricing Model | Delivery |
|---------|--------------|---------|
| SingPost | Weight tiers | 2–3 days |
| J&T Express | Weight tiers | 1–3 days |
| Ninja Van | Weight tiers | 1–2 days |
| Lalamove | Distance-based | Same day |
| GrabExpress | Distance-based | Same day |

Rates are based on publicly listed prices (2024). Distance-based couriers use straight-line km as a proxy — actual road distance will be slightly higher.

---

## SPX Locker Data Notes

The 45 locker locations cover all major Singapore residential estates (Tampines, Sengkang, Punggol, Jurong, Woodlands, AMK, etc.) with order volumes modelled on estate population density. Data is illustrative — replace `backend/data/spx_lockers.json` with real Shopee seller order export data for production use.

---

## Data Sources

- [OneMap API](https://www.onemap.gov.sg/apidocs/) — Singapore Land Authority
- [MAS Exchange Rates](https://eservices.mas.gov.sg/statistics/msb/ExchangeRates.aspx) — Monetary Authority of Singapore
- [Nominatim](https://nominatim.openstreetmap.org/) — OpenStreetMap reverse geocoding
