# Courier rates based on publicly listed SG prices (SGD, 2024)
COURIERS = [
    {
        "name": "J&T Express",
        "color": "#E8192C",
        "mode": "weight",
        "estimated_days": "1-3 days",
        "tiers": [(0.5, 3.00), (1.0, 3.50), (2.0, 4.00), (5.0, 5.50), (10.0, 7.50), (30.0, 13.00)],
    },
    {
        "name": "Ninja Van",
        "color": "#00B14F",
        "mode": "weight",
        "estimated_days": "1-2 days",
        "tiers": [(0.5, 3.50), (1.0, 4.00), (2.0, 4.50), (5.0, 6.00), (10.0, 8.00), (30.0, 15.00)],
    },
    {
        "name": "SingPost",
        "color": "#CC0001",
        "mode": "weight",
        "estimated_days": "2-3 days",
        "tiers": [(0.5, 2.50), (1.0, 3.00), (2.0, 3.80), (5.0, 5.00), (10.0, 7.00), (30.0, 12.00)],
    },
    {
        "name": "Lalamove",
        "color": "#FF6600",
        "mode": "distance",
        "estimated_days": "Same day",
        "base": 5.00,
        "per_km": 0.50,
    },
    {
        "name": "GrabExpress",
        "color": "#00B14F",
        "mode": "distance",
        "estimated_days": "Same day",
        "base": 4.50,
        "per_km": 0.60,
    },
]


def _weight_cost(tiers: list, weight_kg: float) -> float:
    for max_w, rate in tiers:
        if weight_kg <= max_w:
            return rate
    return tiers[-1][1]


def get_all_estimates(weight_kg: float, distance_km: float) -> list[dict]:
    results = []
    for c in COURIERS:
        if c["mode"] == "weight":
            cost = _weight_cost(c["tiers"], weight_kg)
        else:
            cost = round(c["base"] + c["per_km"] * distance_km, 2)
        results.append({
            "courier": c["name"],
            "cost_sgd": cost,
            "estimated_days": c["estimated_days"],
            "color": c["color"],
        })
    return sorted(results, key=lambda x: x["cost_sgd"])
