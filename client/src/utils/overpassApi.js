export const fetchNearbyPlaces = async (lat, lon, radius = 10000) => {
  // Overpass QL highly optimized regex query to prevent server timeouts
  const amenities = "restaurant|hospital|bank|cinema|theatre";

  const query = `
    [out:json][timeout:25];
    (
      nwr["amenity"~"^(${amenities})$"](around:${radius},${lat},${lon});
    );
    out center;
  `;

  const url = `https://overpass-api.de/api/interpreter`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      body: query,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch from Overpass API");
    }

    const data = await response.json();
    
    // Transform the OSM data into our app's format
    return data.elements.filter(el => el.tags && el.tags.name).map((el, index) => {
      let sector = "retail"; // default
      let category = "Store";
      
      if (el.tags.amenity === "restaurant" || el.tags.amenity === "cafe" || el.tags.amenity === "fast_food") {
        sector = "hospitality";
        category = el.tags.amenity === "cafe" ? "Cafe" : "Restaurant";
      } else if (el.tags.amenity === "bank" || el.tags.amenity === "atm") {
        sector = "finance";
        category = el.tags.amenity === "atm" ? "ATM" : "Bank";
      } else if (el.tags.amenity === "hospital" || el.tags.amenity === "clinic" || el.tags.amenity === "pharmacy") {
        sector = "health";
        category = el.tags.amenity === "pharmacy" ? "Pharmacy" : "Hospital/Clinic";
      } else if (el.tags.amenity === "post_office" || el.tags.office === "government") {
        sector = "public";
        category = "Public Service";
      } else if (el.tags.shop === "hairdresser" || el.tags.shop === "beauty" || el.tags.shop === "barber") {
        sector = "retail";
        category = "Salon/Barbershop";
      } else if (el.tags.shop) {
        sector = "retail";
        category = "Retail";
      } else if (el.tags.amenity === "cinema" || el.tags.amenity === "theatre") {
        sector = "entertainment";
        category = "Theater";
      } else if (el.tags.public_transport === "station") {
        sector = "transit";
        category = "Transit Station";
      }

      // Generate a random wait time and crowd level for the demo
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
      
      // Calculate distance in km
      let distanceText = "Nearby";
      if (placeLat && placeLon) {
        const R = 6371; // Radius of the earth in km
        const dLat = (placeLat - lat) * (Math.PI / 180);
        const dLon = (placeLon - lon) * (Math.PI / 180);
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat * (Math.PI / 180)) * Math.cos(placeLat * (Math.PI / 180)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const d = R * c; // Distance in km
        distanceText = d < 1 ? `${(d * 1000).toFixed(0)} m away` : `${d.toFixed(1)} km away`;
      }

      // Select relevant image based on sector
      let imageUrl = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400&h=300"; // default building
      if (sector === "hospitality") {
        imageUrl = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400&h=300"; // Restaurant
      } else if (sector === "finance") {
        imageUrl = "https://images.unsplash.com/photo-1501167739983-4a11f2a3db68?auto=format&fit=crop&q=80&w=400&h=300"; // Bank
      } else if (sector === "health") {
        imageUrl = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400&h=300"; // Hospital
      } else if (sector === "entertainment") {
        imageUrl = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400&h=300"; // Theater
      }

      return {
        id: `osm-${el.id}`,
        name: el.tags.name,
        category: category,
        sector: sector,
        crowdLevel: crowdLevel,
        currentWaitMin: currentWaitMin,
        statusLabel: crowdLevel === "high" ? "Busy" : crowdLevel === "medium" ? "Moderate" : "Not Busy",
        confidence: Math.floor(Math.random() * 30) + 60, // 60-90%
        reportsCount: Math.floor(Math.random() * 20),
        image: imageUrl,
        address: el.tags["addr:street"] ? `${el.tags["addr:housenumber"] || ""} ${el.tags["addr:street"]}`.trim() : "Nearby Location",
        distance: distanceText,
        lat: placeLat,
        lon: placeLon,
        updatedAt: Date.now() - Math.floor(Math.random() * 10000000),
      };
    });

  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
  }
};
