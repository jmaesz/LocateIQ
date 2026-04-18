const COLORS = ["#EF4444","#3B82F6","#10B981","#F59E0B","#8B5CF6",
                 "#EC4899","#14B8A6","#F97316","#6366F1","#84CC16",
                 "#06B6D4","#A855F7","#F43F5E","#22C55E","#EAB308",
                 "#64748B","#0EA5E9","#D946EF","#FB923C","#4ADE80"];

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function runOnce(lockers, k) {
  // K-means++ initialisation
  const centroids = [];
  centroids.push(lockers[Math.floor(Math.random() * lockers.length)]);
  while (centroids.length < k) {
    const dists = lockers.map((l) =>
      Math.min(...centroids.map((c) => haversineKm(l.lat, l.lng, c.lat, c.lng)))
    );
    const total = dists.reduce((s, d) => s + d * d, 0);
    let r = Math.random() * total;
    for (let i = 0; i < lockers.length; i++) {
      r -= dists[i] * dists[i];
      if (r <= 0) { centroids.push(lockers[i]); break; }
    }
  }

  let ctrs = centroids.map((c) => ({ lat: c.lat, lng: c.lng }));

  for (let iter = 0; iter < 150; iter++) {
    const clusters = Array.from({ length: k }, () => []);
    for (const l of lockers) {
      let best = 0, bestD = Infinity;
      for (let i = 0; i < k; i++) {
        const d = haversineKm(l.lat, l.lng, ctrs[i].lat, ctrs[i].lng);
        if (d < bestD) { bestD = d; best = i; }
      }
      clusters[best].push(l);
    }

    let moved = false;
    for (let i = 0; i < k; i++) {
      if (!clusters[i].length) continue;
      const w = clusters[i].reduce((s, l) => s + l.orders, 0);
      const newLat = clusters[i].reduce((s, l) => s + l.lat * l.orders, 0) / w;
      const newLng = clusters[i].reduce((s, l) => s + l.lng * l.orders, 0) / w;
      if (Math.abs(newLat - ctrs[i].lat) > 1e-7 || Math.abs(newLng - ctrs[i].lng) > 1e-7) moved = true;
      ctrs[i] = { lat: newLat, lng: newLng };
    }
    if (!moved) break;
  }

  // Score: total weighted distance
  const score = lockers.reduce((s, l) => {
    const d = Math.min(...ctrs.map((c) => haversineKm(l.lat, l.lng, c.lat, c.lng)));
    return s + d * l.orders;
  }, 0);

  return { ctrs, score };
}

export function weightedKMeans(lockers, k, nInit = 10) {
  let best = null;
  for (let i = 0; i < nInit; i++) {
    const run = runOnce(lockers, k);
    if (!best || run.score < best.score) best = run;
  }

  const { ctrs } = best;
  const labels = lockers.map((l) => {
    let best = 0, bestD = Infinity;
    for (let i = 0; i < k; i++) {
      const d = haversineKm(l.lat, l.lng, ctrs[i].lat, ctrs[i].lng);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  });

  const clusters = Array.from({ length: k }, (_, cid) => {
    const members = lockers.filter((_, i) => labels[i] === cid);
    const totalOrders = members.reduce((s, l) => s + l.orders, 0);
    const avgDist = totalOrders > 0
      ? members.reduce((s, l) => s + haversineKm(l.lat, l.lng, ctrs[cid].lat, ctrs[cid].lng) * l.orders, 0) / totalOrders
      : 0;
    return {
      id: cid,
      color: COLORS[cid % COLORS.length],
      centroid_lat: ctrs[cid].lat,
      centroid_lng: ctrs[cid].lng,
      total_orders: totalOrders,
      locker_count: members.length,
      avg_distance_km: Math.round(avgDist * 100) / 100,
    };
  });

  const assignments = lockers.map((l, i) => ({ locker_id: l.id, cluster_id: labels[i] }));
  const totalWeightedDist = Math.round(lockers.reduce((s, l, i) =>
    s + haversineKm(l.lat, l.lng, ctrs[labels[i]].lat, ctrs[labels[i]].lng) * l.orders, 0
  ) * 100) / 100;

  return { k, clusters, assignments, total_weighted_distance_km: totalWeightedDist };
}
