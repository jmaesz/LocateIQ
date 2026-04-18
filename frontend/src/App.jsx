import WarehouseOptimiser from "./components/WarehouseOptimiser";

const STACK = [
  { label: "React 19 + Vite 6", desc: "Frontend framework" },
  { label: "Tailwind CSS v4", desc: "Styling" },
  { label: "React-Leaflet", desc: "Interactive map" },
  { label: "K-Means++ (JS)", desc: "Clustering, runs in browser" },
  { label: "FastAPI + Uvicorn", desc: "Backend API" },
  { label: "scikit-learn", desc: "Python K-means clustering" },
  { label: "SPX Express API", desc: "317 real locker locations" },
  { label: "OneMap API", desc: "Singapore geocoding (SLA)" },
];

const STEPS = [
  { n: "1", title: "Load", body: "317 real SPX Express locker locations are loaded, each weighted by parcel capacity." },
  { n: "2", title: "Seed", body: "K starting warehouse positions are placed intelligently using K-Means++ initialisation to avoid poor clusters." },
  { n: "3", title: "Assign", body: "Every locker is assigned to its nearest warehouse using the Haversine formula - real geographic distance, not flat Euclidean." },
  { n: "4", title: "Update", body: "Each warehouse centroid shifts to the demand-weighted average of its lockers. Higher-capacity lockers pull harder." },
  { n: "5", title: "Converge", body: "Steps 3–4 repeat until centroids stop moving. Runs 10 times, keeps the best result to avoid local optima." },
];

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">📦</span>
          <div>
            <h1 className="text-lg font-bold leading-none">LocateIQ</h1>
            <p className="text-red-200 text-xs mt-0.5">
              Find your optimal fulfillment location, powered by real SPX data
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* What It Is */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2">What is LocateIQ?</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            LocateIQ is a warehouse location optimiser built for Singapore e-commerce sellers.
            It analyses the real <span className="font-medium text-red-600">SPX Express locker network</span> - 317 locations island-wide -
            and recommends the optimal placement for your fulfillment centres to minimise total delivery distance across the network.
            Tell it how many warehouses you want to run, click a button, and get a data-driven answer.
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-1">How It Works</h2>
          <p className="text-sm text-gray-500 mb-5">
            Powered by <span className="font-medium text-gray-700">K-Means Clustering</span> - unsupervised machine learning that groups data points by proximity without needing labelled training data.
          </p>
          <div className="space-y-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {s.n}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                  <p className="text-sm text-gray-500">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Tech Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STACK.map((t) => (
              <div key={t.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tool */}
        <WarehouseOptimiser />

      </main>

      <footer className="text-center text-xs text-gray-400 pb-8 space-y-1 mt-8">
        <p>Data: SPX Express Singapore · OpenStreetMap</p>
        <p>© 2026 Ng Jin Yi James. All rights reserved.</p>
      </footer>
    </div>
  );
}
