import { MapContainer, TileLayer, CircleMarker, Tooltip, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SINGAPORE_CENTER = [1.3521, 103.8198];

function warehouseIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${color};
      border:3px solid white;
      border-radius:50%;
      width:28px;height:28px;
      display:flex;align-items:center;justify-content:center;
      font-size:14px;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
    ">🏭</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function ClusterMap({ lockers, result }) {
  const assignmentMap = result
    ? Object.fromEntries(result.assignments.map((a) => [a.locker_id, a.cluster_id]))
    : {};

  const clusterColors = result
    ? Object.fromEntries(result.clusters.map((c) => [c.id, c.color]))
    : {};

  const maxOrders = Math.max(...lockers.map((l) => l.orders));

  return (
    <MapContainer
      center={SINGAPORE_CENTER}
      zoom={11}
      style={{ height: "460px", width: "100%", borderRadius: "0.75rem" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Locker circles */}
      {lockers.map((locker) => {
        const clusterId = assignmentMap[locker.id];
        const color = clusterId !== undefined ? clusterColors[clusterId] : "#6B7280";
        const radius = 5 + (locker.orders / maxOrders) * 14;

        return (
          <CircleMarker
            key={locker.id}
            center={[locker.lat, locker.lng]}
            radius={radius}
            pathOptions={{ fillColor: color, color: "white", weight: 1.5, fillOpacity: 0.85 }}
          >
            <Tooltip>
              <div className="text-xs">
                <p className="font-semibold">{locker.name}</p>
                <p>{locker.orders} orders/month</p>
                {clusterId !== undefined && <p>Cluster {clusterId + 1}</p>}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}

      {/* Warehouse centroid markers */}
      {result?.clusters.map((cluster) => (
        <Marker
          key={cluster.id}
          position={[cluster.centroid_lat, cluster.centroid_lng]}
          icon={warehouseIcon(cluster.color)}
        >
          <Tooltip permanent={false}>
            <div className="text-xs">
              <p className="font-semibold">Warehouse {cluster.id + 1}</p>
              <p>{cluster.nearest_address}</p>
              <p>{cluster.total_orders} orders · {cluster.locker_count} lockers</p>
              <p>Avg distance: {cluster.avg_distance_km} km</p>
            </div>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
