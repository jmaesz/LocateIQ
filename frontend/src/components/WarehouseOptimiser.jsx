import { useState } from "react";
import ClusterMap from "./ClusterMap";
import { weightedKMeans } from "../utils/kmeans";
import lockerData from "../data/spx_lockers.json";

export default function WarehouseOptimiser() {
  const [k, setK] = useState(3);
  const [result, setResult] = useState(null);

  function handleRun() {
    setResult(weightedKMeans(lockerData, k));
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Warehouse Location Optimiser</h2>
          <p className="text-sm text-gray-400 mt-1">
            Demand-weighted K-means on {lockerData.length} real SPX locker locations across Singapore.
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
              onClick={handleRun}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Find Optimal Locations
            </button>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <ClusterMap lockers={lockerData} result={result} />
        <p className="text-xs text-gray-400 mt-2 px-1">
          Circle size = locker capacity. 🏭 = recommended warehouse location.
        </p>
      </div>

      {/* Cluster cards */}
      {result && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-md p-5 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-semibold text-gray-700">Optimal Warehouse Locations</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              Total weighted distance: {result.total_weighted_distance_km.toLocaleString()} km·orders
            </span>
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

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-900">{cluster.total_orders.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">capacity</p>
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
