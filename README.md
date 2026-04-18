# LocateIQ

*Find your optimal fulfillment location, powered by real SPX data.*

---

## What It Is

LocateIQ is a Singapore-focused warehouse location optimiser built for Shopee sellers and e-commerce logistics teams. It analyses the real SPX Express locker network across Singapore and recommends the optimal number and placement of fulfillment centres to minimise total delivery distance to those lockers.

Rather than guessing where to base your stock, LocateIQ lets you set how many warehouses you want to operate, runs the algorithm, and shows you exactly where each warehouse should be — and which lockers it would serve.

---

## How It Works

LocateIQ uses **K-Means Clustering**, a form of **unsupervised machine learning** that groups data points by proximity without needing labelled training data.

Here's the process:

1. **Data** — 317 real SPX Express locker locations across Singapore are loaded, each weighted by their parcel capacity (how many orders they can hold).

2. **Initialisation (K-Means++)** — K initial warehouse positions are seeded intelligently, spread across the map to avoid poor starting points.

3. **Assignment** — Every locker is assigned to its nearest warehouse centroid using the Haversine formula (real geographic distance on a sphere, not flat Euclidean distance).

4. **Update** — Each warehouse centroid moves to the demand-weighted average position of its assigned lockers. Lockers with higher capacity pull the centroid harder.

5. **Repeat** — Steps 3–4 repeat until the centroids stop moving (convergence). The algorithm runs 10 times with different starting points and keeps the best result to avoid local optima.

The output is K warehouse locations that collectively minimise the total weighted distance across the entire SPX locker network — giving you a data-driven answer to where your stock should be.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 6 |
| Styling | Tailwind CSS v4 |
| Map | React-Leaflet + OpenStreetMap |
| Clustering | K-Means++ implemented in vanilla JavaScript, runs entirely in the browser |
| Data | 317 SPX Express locker locations fetched via SPX API, stored as static JSON |
| Deployment | Vercel (static frontend, no backend required) |

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

## Data Sources

- [SPX Express](https://spx.sg/service-point/around) — real locker locations + capacities
- [OpenStreetMap](https://www.openstreetmap.org/) — map tiles via React-Leaflet

---

© 2026 Ng Jin Yi James. All rights reserved.
