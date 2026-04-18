export default function ResultsTable({ result }) {
  if (!result) return null;

  const { origin, destination, distance_km, weight_kg, estimates, cheapest } = result;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
      {/* Route summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">From</p>
          <p className="font-medium text-gray-800 leading-snug">{origin.address}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-red-600">{distance_km} km</p>
          <p className="text-xs text-gray-400">straight-line distance</p>
          <p className="text-xs text-gray-500 mt-1">{weight_kg} kg package</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">To</p>
          <p className="font-medium text-gray-800 leading-snug">{destination.address}</p>
        </div>
      </div>

      {/* Best pick banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-sm text-green-800">
        ✅ Cheapest option: <span className="font-semibold">{cheapest}</span>
      </div>

      {/* Courier table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide border-b">
              <th className="text-left py-2 pr-4">Courier</th>
              <th className="text-left py-2 pr-4">Est. Delivery</th>
              <th className="text-right py-2">Cost (SGD)</th>
            </tr>
          </thead>
          <tbody>
            {estimates.map((e, i) => (
              <tr
                key={e.courier}
                className={`border-b last:border-0 ${i === 0 ? "bg-green-50" : ""}`}
              >
                <td className="py-3 pr-4 flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: e.color }}
                  />
                  <span className="font-medium text-gray-800">{e.courier}</span>
                  {i === 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                      Best
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4 text-gray-500">{e.estimated_days}</td>
                <td className="py-3 text-right font-semibold text-gray-900">
                  ${e.cost_sgd.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        * Weight-based couriers use published rate tiers. Distance-based (Lalamove, GrabExpress)
        use straight-line distance as proxy. Actual road distance may vary.
      </p>
    </div>
  );
}
