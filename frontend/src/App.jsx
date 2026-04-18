import WarehouseOptimiser from "./components/WarehouseOptimiser";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <WarehouseOptimiser />
      </main>

      <footer className="text-center text-xs text-gray-400 pb-8 space-y-1">
        <p>Data: SPX Express Singapore · OpenStreetMap</p>
        <p>© 2026 Ng Jin Yi James. All rights reserved.</p>
      </footer>
    </div>
  );
}
