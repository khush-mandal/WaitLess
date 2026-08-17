import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Marker Icon Fix for Vite
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Map View Auto-Center Component
function RecenterMap({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.setView(location, 14);
  }, [location, map]);
  return null;
}

export default function LiveMap({ places, userLocation }) {
  const defaultCenter = userLocation || [29.8370, 76.9170];

  return (
    <div style={{ height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap location={userLocation} />

        {/* User Current Location Marker */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>📍 Aap Yahan Hain (Your Location)</Popup>
          </Marker>
        )}

        {/* Nearby Places Markers */}
        {places && places.map((place) => (
          <Marker key={place.id} position={[place.lat, place.lng]}>
            <Popup>
              <div>
                <strong>{place.name}</strong><br />
                Crowd: {place.crowdLevel || 'Normal'}<br />
                Wait Time: {place.waitTime || '10m'}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}