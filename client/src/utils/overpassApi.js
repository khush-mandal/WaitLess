import { getPlacesNearLocation } from "../data/initialData.js";

export const fetchNearbyPlaces = async (lat, lon, radius = 10000) => {
  // Clean, compatible Overpass QL query covering hospitality, finance, health, entertainment, and retail
  const query = `[out:json][timeout:15];(node["amenity"~"restaurant|cafe|fast_food|bank|atm|hospital|clinic|pharmacy|cinema|theatre"](around:${radius},${lat},${lon});node["shop"~"supermarket|convenience|clothes|mall"](around:${radius},${lat},${lon});way["amenity"~"restaurant|cafe|fast_food|bank|hospital|clinic|cinema|theatre"](around:${radius},${lat},${lon}););out center 60;`;

  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter"
  ];
  
  for (const url of endpoints) {
    try {
      // First try GET request with 8s timeout
      let response;
      try {
        response = await fetch(`${url}?data=${encodeURIComponent(query)}`, {
          headers: { "Accept": "application/json" },
          signal: AbortSignal.timeout(8000)
        });
      } catch (e) {
        response = null;
      }

      // If GET failed or non-200, fallback to POST with 8s timeout
      if (!response || !response.ok) {
        response = await fetch(url, {
          method: "POST",
          body: "data=" + encodeURIComponent(query),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Accept": "application/json"
          },
          signal: AbortSignal.timeout(8000)
        });
      }
      
      if (!response || !response.ok) {
        continue; // Try next mirror if HTTP error
      }

      const data = await response.json();
      if (!data || !data.elements || data.elements.length === 0) continue;
      
      // Transform the OSM data into our app's format
      const places = data.elements.filter(el => el.tags && el.tags.name).map((el) => {
        let sector = "retail"; // default
        let category = "Store";
        const amenity = el.tags.amenity;
        const shop = el.tags.shop;
        
        if (amenity === "restaurant" || amenity === "cafe" || amenity === "fast_food") {
          sector = "hospitality";
          category = amenity === "cafe" ? "Cafe" : amenity === "fast_food" ? "Fast Food" : "Restaurant";
        } else if (amenity === "bank" || amenity === "atm") {
          sector = "finance";
          category = amenity === "atm" ? "ATM" : "Bank";
        } else if (amenity === "hospital" || amenity === "clinic" || amenity === "pharmacy") {
          sector = "health";
          category = amenity === "pharmacy" ? "Pharmacy" : "Hospital/Clinic";
        } else if (amenity === "post_office" || (el.tags.office && el.tags.office === "government")) {
          sector = "public";
          category = "Public Service";
        } else if (shop === "hairdresser" || shop === "beauty" || shop === "barber") {
          sector = "retail";
          category = "Salon/Barbershop";
        } else if (shop) {
          sector = "retail";
          category = shop === "supermarket" ? "Supermarket" : "Retail Store";
        } else if (amenity === "cinema" || amenity === "theatre") {
          sector = "entertainment";
          category = amenity === "cinema" ? "Cinema" : "Theater";
        }

        // Generate realistic wait time and crowd level
        const randomCrowd = Math.random();
        let crowdLevel = "low";
        let currentWaitMin = Math.floor(Math.random() * 5);
        
        if (randomCrowd > 0.8) {
          crowdLevel = "high";
          currentWaitMin = Math.floor(Math.random() * 30) + 15;
        } else if (randomCrowd > 0.5) {
          crowdLevel = "medium";
          currentWaitMin = Math.floor(Math.random() * 10) + 5;
        }

        const placeLat = el.lat || (el.center && el.center.lat);
        const placeLon = el.lon || (el.center && el.center.lon);
        
        // Calculate exact distance using Haversine formula
        let distanceText = "Nearby";
        let rawDistanceKm = 0.5;

        if (placeLat && placeLon) {
          const R = 6371; // Earth radius in km
          const dLat = (placeLat - lat) * (Math.PI / 180);
          const dLon = (placeLon - lon) * (Math.PI / 180);
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat * (Math.PI / 180)) * Math.cos(placeLat * (Math.PI / 180)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
          rawDistanceKm = R * c;
          distanceText = rawDistanceKm < 1 ? `${(rawDistanceKm * 1000).toFixed(0)} m away` : `${rawDistanceKm.toFixed(1)} km away`;
        }

        // Select relevant image based on sector
        let imageUrl = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400&h=300"; 
        if (sector === "hospitality") {
          imageUrl = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400&h=300";
        } else if (sector === "finance") {
          imageUrl = "https://images.unsplash.com/photo-1501167739983-4a11f2a3db68?auto=format&fit=crop&q=80&w=400&h=300";
        } else if (sector === "health") {
          imageUrl = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400&h=300";
        } else if (sector === "entertainment") {
          imageUrl = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400&h=300";
        }

        return {
          id: `osm-${el.id}`,
          name: el.tags.name,
          category: category,
          sector: sector,
          crowdLevel: crowdLevel,
          currentWaitMin: currentWaitMin,
          statusLabel: crowdLevel === "high" ? "Busy" : crowdLevel === "medium" ? "Moderate" : "Not Busy",
          confidence: Math.floor(Math.random() * 30) + 65,
          reportsCount: Math.floor(Math.random() * 20),
          image: imageUrl,
          address: el.tags["addr:street"] ? `${el.tags["addr:housenumber"] || ""} ${el.tags["addr:street"]}`.trim() : "Nearby Location",
          distance: distanceText,
          rawDistanceKm: rawDistanceKm,
          lat: placeLat,
          lon: placeLon,
          updatedAt: Date.now() - Math.floor(Math.random() * 10000000),
        };
      });

      if (places.length > 0) return places;
    } catch (err) {
      console.warn(`Overpass API endpoint ${url} failed:`, err);
    }
  }

  // Fallback to location-relative simulated places if live OSM servers fail or timeout
  return getPlacesNearLocation(lat, lon);
};

