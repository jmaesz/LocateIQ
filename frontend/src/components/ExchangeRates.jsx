import { useEffect, useState } from "react";

const CURRENCY_LABELS = {
  USD_SGD: { label: "USD → SGD", flag: "🇺🇸" },
  MYR_SGD: { label: "MYR → SGD", flag: "🇲🇾" },
  EUR_SGD: { label: "EUR → SGD", flag: "🇪🇺" },
  CNY_SGD: { label: "CNY → SGD", flag: "🇨🇳" },
};

export default function ExchangeRates() {
  const [rates, setRates] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then(setRates)
      .catch(() => setError(true));
  }, []);

  if (error) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">MAS Exchange Rates (SGD)</h2>
        {rates?.date && (
          <span className="text-xs text-gray-400">as of {rates.date}</span>
        )}
      </div>

      {!rates ? (
        <p className="text-xs text-gray-400 animate-pulse">Loading rates…</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(CURRENCY_LABELS).map(([key, { label, flag }]) => (
            <div key={key} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg mb-1">{flag}</p>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-bold text-gray-800 text-sm">
                {rates[key] != null ? rates[key].toFixed(4) : "—"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
