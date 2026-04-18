export default function DeliveryForm({ onSubmit, loading }) {
  function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    onSubmit({
      origin_postal: fd.get("origin").trim(),
      dest_postal: fd.get("dest").trim(),
      weight_kg: parseFloat(fd.get("weight")),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-700">Enter Shipment Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">Origin Postal Code</span>
          <input
            name="origin"
            type="text"
            maxLength={6}
            pattern="\d{6}"
            placeholder="e.g. 018956"
            required
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">Destination Postal Code</span>
          <input
            name="dest"
            type="text"
            maxLength={6}
            pattern="\d{6}"
            placeholder="e.g. 238823"
            required
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-600">Package Weight (kg)</span>
        <input
          name="weight"
          type="number"
          min="0.1"
          max="30"
          step="0.1"
          defaultValue="1"
          required
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors"
      >
        {loading ? "Estimating…" : "Estimate Delivery Cost"}
      </button>
    </form>
  );
}
