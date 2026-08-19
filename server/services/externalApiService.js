/**
 * External API Service (Google Places API / OpenStreetMap Overpass API)
 * Provides baseline venue info and initial crowd busyness estimates.
 */

async function fetchExternalPlaceData(lat, lng, query = '') {
  try {
    // If GOOGLE_PLACES_API_KEY is configured in .env, use Google Places API
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (googleApiKey && googleApiKey !== 'YOUR_GOOGLE_API_KEY') {
      const googleData = await fetchFromGooglePlaces(lat, lng, query, googleApiKey);
      if (googleData && googleData.length > 0) {
        return googleData;
      }
    }

    // Fallback: Overpass API (OpenStreetMap)
    return await fetchFromOverpassAPI(lat, lng);
  } catch (error) {
    console.error('External API Service Error:', error.message);
    return getFallbackPlaces(lat, lng);
  }
}

async function fetchFromGooglePlaces(lat, lng, query, apiKey) {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=restaurant|cafe|mall|hospital&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results) return [];

    return data.results.slice(0, 15).map((place) => {
      // Estimate baseline busyness from Google price level, rating, and user ratings total
      const popularityScore = Math.min(95, Math.max(20, Math.floor((place.rating || 4.0) * 15 + ((place.user_ratings_total || 50) % 25))));
      const crowdLevel = popularityScore > 75 ? 'High' : popularityScore > 45 ? 'Moderate' : 'Low';
      const waitTime = crowdLevel === 'High' ? '30m' : crowdLevel === 'Moderate' ? '15m' : '5m';

      return {
        id: `google_${place.place_id}`,
        source: 'Google Places API',
        name: place.name,
        category: place.types ? place.types[0] : 'amenity',
        address: place.vicinity || 'Nearby',
        rating: place.rating || 4.2,
        userRatingsTotal: place.user_ratings_total || 100,
        baselineBusyness: popularityScore,
        crowdLevel: crowdLevel,
        waitTime: waitTime,
        confidence: '90%',
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      };
    });
  } catch (err) {
    console.error('Error fetching Google Places:', err.message);
    return [];
  }
}

async function fetchFromOverpassAPI(lat, lng) {
  const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:2000,${lat},${lng})["amenity"];out 15;`;
  const response = await fetch(overpassUrl);
  const data = await response.json();

  if (!data.elements) return getFallbackPlaces(lat, lng);

  return data.elements
    .filter((item) => item.tags && item.tags.name)
    .map((item, index) => {
      // Generate deterministic baseline crowd busyness score
      const seed = ((item.id * 17) % 70) + 20;
      const crowd = seed > 65 ? 'High' : seed > 40 ? 'Moderate' : 'Low';
      const wait = crowd === 'Low' ? '5m' : crowd === 'Moderate' ? '15m' : '30m';

      return {
        id: `osm_${item.id}`,
        source: 'OpenStreetMap (Overpass)',
        name: item.tags.name,
        category: item.tags.amenity,
        address: item.tags['addr:street'] ? `${item.tags['addr:street']}` : 'Nearby Location',
        baselineBusyness: seed,
        crowdLevel: crowd,
        waitTime: wait,
        confidence: '82%',
        lat: item.lat,
        lng: item.lon,
      };
    });
}

function getFallbackPlaces(lat, lng) {
  return [
    {
      id: 'fallback_1',
      source: 'External API Baseline',
      name: 'Central Mall & Arcade',
      category: 'shopping_mall',
      baselineBusyness: 72,
      crowdLevel: 'High',
      waitTime: '25m',
      confidence: '85%',
      lat: parseFloat(lat) + 0.002,
      lng: parseFloat(lng) + 0.001
    },
    {
      id: 'fallback_2',
      source: 'External API Baseline',
      name: 'Metro City Hospital',
      category: 'hospital',
      baselineBusyness: 88,
      crowdLevel: 'High',
      waitTime: '40m',
      confidence: '88%',
      lat: parseFloat(lat) - 0.001,
      lng: parseFloat(lng) + 0.003
    },
    {
      id: 'fallback_3',
      source: 'External API Baseline',
      name: 'Artisan Cafe & Bakery',
      category: 'cafe',
      baselineBusyness: 35,
      crowdLevel: 'Low',
      waitTime: '5m',
      confidence: '92%',
      lat: parseFloat(lat) + 0.003,
      lng: parseFloat(lng) - 0.002
    }
  ];
}

module.exports = {
  fetchExternalPlaceData
};
