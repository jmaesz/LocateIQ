# LocateIQ

*Find your optimal fulfillment location, powered by real SPX data.*

A Singapore-focused warehouse location optimiser that uses demand-weighted K-means clustering on real SPX Express locker data to recommend optimal fulfillment centre placement across Singapore. Select K, click run, and see which locations minimise total delivery distance across the locker network.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 6 + Tailwind CSS v4 |
| Map | React-Leaflet + OpenStreetMap |
| Clustering | K-Means++ (JavaScript, runs in browser) |
| SPX Data | Fetched from SPX Express API via `scripts/fetch_spx.py` |
| Backend (local only) | FastAPI + Uvicorn + scikit-learn |

---

## Features

- **317 real SPX locker locations** fetched from the SPX Express API and baked into the app
- **Demand-weighted K-means++** — locker capacity pulls the centroid harder than low-capacity ones
- **K = 1–10 warehouses** selectable via slider
- **Runs entirely in the browser** — no backend required at runtime
- **Interactive map** — locker circles sized by capacity, coloured by cluster, 🏭 pin at each optimal warehouse location
- **Cluster cards** — orders served, locker count, weighted average distance per warehouse zone

---

## Project Structure

```
LocateIQ/
├── scripts/
│   └── fetch_spx.py              # One-time script to refresh SPX locker data
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── data/
│       │   └── spx_lockers.json  # 317 real SPX locker locations + capacities
│       ├── utils/
│       │   └── kmeans.js         # Weighted K-means++ (pure JS)
│       └── components/
│           ├── WarehouseOptimiser.jsx
│           └── ClusterMap.jsx
└── backend/                      # Local development only, not deployed
    ├── main.py
    ├── requirements.txt
    ├── routers/
    └── services/
```

---

## Getting Started

### Prerequisites

- Node.js 18+

### Run the frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## Refreshing SPX Locker Data

The locker data is pre-fetched and committed to the repo. To update it:

```bash
pip install httpx
python scripts/fetch_spx.py
```

This fetches live data from the SPX Express API across a 46-point grid covering all of Singapore, deduplicates by locker ID, and overwrites `frontend/src/data/spx_lockers.json`.

---

## Backend (Local Only)

The FastAPI backend is included for local experimentation but is **not used by the deployed app**. The frontend runs K-means entirely in the browser.

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

---

## Data Sources

- [SPX Express](https://spx.sg/service-point/around) — real locker locations + capacities
- [OpenStreetMap](https://www.openstreetmap.org/) — map tiles via React-Leaflet
