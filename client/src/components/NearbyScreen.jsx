import { useEffect, useState } from 'react';
import LiveMap from './LiveMap';

export default function NearbyScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get Live User GPS Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);

          // 2. Fetch Nearby Live Places based on Coordinates
          fetchPlacesNearby(lat, lng);
        },
        (error) => {
          console.error("Location error:", error);
          // Fallback location if permission denied (Nilokheri, Karnal)
          fetchPlacesNearby(29.8370, 76.9170);
          setLoading(false);
        }
      );
    }
  }, []);

  const fetchPlacesNearby = (lat, lng) => {
    fetch(`/api/places/nearby?lat=${lat}&lng=${lng}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setPlaces(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Nearby Live Places</h2>
      {loading ? (
        <p>Aapki live location trace ho rahi hai...</p>
      ) : (
        <>
          <LiveMap places={places} userLocation={userLocation} />
          
          <div style={{ marginTop: '20px', display: 'grid', gap: '10px' }}>
            {places.map((place) => (
              <div key={place.id} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>{place.name}</h3>
                <p>Crowd: {place.crowdLevel} | Wait: {place.waitTime}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}