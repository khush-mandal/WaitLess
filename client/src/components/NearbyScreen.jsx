import { useEffect, useState } from 'react';
import LiveMap from './LiveMap';

export default function NearbyScreen() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    // Backend se dynamic places fetch karein
    fetch('/api/places/nearby')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setPlaces(res.data);
      })
      .catch((err) => console.error("Places load error:", err));
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '16px' }}>Nearby Places & Live Map</h2>

      {/* Live OpenStreetMap Component */}
      <div style={{ marginBottom: '24px' }}>
        <LiveMap places={places} />
      </div>

      {/* Places List */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {places.map((place) => (
          <div 
            key={place.id} 
            style={{ 
              padding: '16px', 
              border: '1px solid #ccc', 
              borderRadius: '8px', 
              background: '#ffffff',
              color: '#333' 
            }}
          >
            <h3 style={{ margin: '0 0 8px 0' }}>{place.name}</h3>
            <p style={{ margin: '4px 0' }}><strong>Crowd Level:</strong> {place.crowdLevel}</p>
            <p style={{ margin: '4px 0' }}><strong>Wait Time:</strong> {place.waitTime}</p>
          </div>
        ))}
      </div>
    </div>
  );
}