https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function LiveMap({ places }) {
  // Center coordinates (Default view location)
  const defaultCenter = [28.9931, 77.0151];

  return (
    <div style={{ height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        {/* Free Tile Layer URL */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic Markers for Places */}
        {places && places.map((place) => (
          <Marker key={place.id} position={[place.lat, place.lng]}>
            <Popup>
              <div>
                <strong>{place.name}</strong><br />
                Crowd: {place.crowdLevel}<br />
                Wait: {place.waitTime}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}