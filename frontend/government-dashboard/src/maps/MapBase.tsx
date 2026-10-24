import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";

export interface MapMarker { id: string; name: string; lat: number; lng: number; color: string; label?: string; radius?: number; }

// Reusable Leaflet map centred on Nashik. Used by the priority map (Dev B) and the facility map (Dev A).
export default function MapBase({ markers = [], onSelect, height = 380 }: {
  markers?: MapMarker[]; onSelect?: (id: string) => void; height?: number;
}) {
  return (
    <MapContainer center={[19.9975, 73.7898]} zoom={12} style={{ height, width: "100%" }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m) => (
        <CircleMarker key={m.id} center={[m.lat, m.lng]} radius={m.radius ?? 14}
          pathOptions={{ color: m.color, fillColor: m.color, fillOpacity: 0.65 }}
          eventHandlers={{ click: () => onSelect?.(m.id) }}>
          <Tooltip>{m.name}{m.label ? `: ${m.label}` : ""}</Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
