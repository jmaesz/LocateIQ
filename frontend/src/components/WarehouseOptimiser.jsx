import { useState, useEffect } from "react";
import ClusterMap from "./ClusterMap";

const CLUSTER_COLORS = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];

export default function WarehouseOptimiser() {
  const [lockers, setLockers] = useState([]);
  const [k, setK] = useState(3);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/warehouse/lockers")
      .then((r) => r.json())
      .then(setLockers)
      .catch(() => setError("Failed to load locker data"));
  }, []);

  async function handleOptimise() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/warehouse/optimise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ k }),
      });
      if (!res.ok) throw new Error("Optimisation failed");
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Warehouse Location Optimiser</h2>
          <p className="text-sm text-gray-400 mt-1">
            Uses demand-weighted K-means clustering on 45 SPX locker locations to find optimal
            warehouse placement across Singapore.
          </p>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">
              Number of Warehouses (K = {k})
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="w-48 accent-red-600"
            />
            <div className="flex justify-between text-xs text-gray-400 w-48">
              <span>1</span><span>3</span><span>5</span><span>7</span><span>10</span>
            </div>
          </div>

          <button
            onClick={handleOptimise}
            disabled={loading || lockers.length === 0}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            {loading ? "Running K-Means…" : "Find Optimal Locations"}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            ⚠️ {error}
          </p>
        )}
      </div>

      {/* Map */}
      {lockers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-4">
          <ClusterMap lockers={lockers} result={result} />
          <p className="text-xs text-gray-400 mt-2 px-1">
            Circle size = order volume. 🏭 = recommended warehouse location.
          </p>
        </div>
      )}

      {/* Cluster result cards */}
      {result && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="font-semibold text-gray-700">Optimal Warehouse Locations</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                Total weighted distance: {result.total_weighted_distance_km.toLocaleString()} km·orders
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.clusters.map((cluster) => (
              <div
                key={cluster.id}
                className="bg-white rounded-2xl shadow-md p-5 border-l-4"
                style={{ borderColor: cluster.color }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🏭</span>
                  <span className="font-semibold text-gray-800">Warehouse {cluster.id + 1}</span>
                  <span
                    className="ml-auto text-xs px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: cluster.color }}
                  >
                    Cluster {cluster.id + 1}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 leading-snug">
                  📍 {cluster.nearest_address}
                </p>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-900">{cluster.total_orders.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">orders/month</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-900">{cluster.locker_count}</p>
                    <p className="text-xs text-gray-400">lockers served</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 col-span-2">
                    <p className="text-lg font-bold text-gray-900">{cluster.avg_distance_km} km</p>
                    <p className="text-xs text-gray-400">avg distance to lockers (weighted)</p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  {cluster.centroid_lat.toFixed(4)}, {cluster.centroid_lng.toFixed(4)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
