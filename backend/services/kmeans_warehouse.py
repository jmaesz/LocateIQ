import json
import math
from pathlib import Path

import numpy as np
from sklearn.cluster import KMeans

LOCKERS_PATH = Path(__file__).parent.parent / "data" / "spx_lockers.json"
CLUSTER_COLORS = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6",
                  "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16"]


def load_lockers() -> list[dict]:
    return json.loads(LOCKERS_PATH.read_text())


def haversine_km(lat1, lng1, lat2, lng2) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
         * math.sin(dlng / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))


def run_kmeans(lockers: list[dict], k: int) -> dict:
    coords = np.array([[l["lat"], l["lng"]] for l in lockers])
    weights = np.array([l["orders"] for l in lockers], dtype=float)

    km = KMeans(n_clusters=k, n_init=20, random_state=42)
    km.fit(coords, sample_weight=weights)

    labels = km.labels_.tolist()
    centroids = km.cluster_centers_.tolist()

    clusters = []
    for cid in range(k):
        members = [l for l, lab in zip(lockers, labels) if lab == cid]
        centroid_lat, centroid_lng = centroids[cid]
        total_orders = sum(m["orders"] for m in members)
        avg_dist = (
            sum(haversine_km(m["lat"], m["lng"], centroid_lat, centroid_lng) * m["orders"]
                for m in members) / total_orders
            if total_orders > 0 else 0
        )
        clusters.append({
            "id": cid,
            "color": CLUSTER_COLORS[cid % len(CLUSTER_COLORS)],
            "centroid_lat": round(centroid_lat, 6),
            "centroid_lng": round(centroid_lng, 6),
            "total_orders": total_orders,
            "locker_count": len(members),
            "avg_distance_km": round(avg_dist, 2),
        })

    total_weighted_dist = sum(
        haversine_km(l["lat"], l["lng"], centroids[lab][0], centroids[lab][1]) * l["orders"]
        for l, lab in zip(lockers, labels)
    )

    assignments = [{"locker_id": l["id"], "cluster_id": int(lab)}
                   for l, lab in zip(lockers, labels)]

    return {
        "k": k,
        "clusters": clusters,
        "assignments": assignments,
        "total_weighted_distance_km": round(total_weighted_dist, 2),
    }
