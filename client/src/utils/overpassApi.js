export const fetchNearbyPlaces = async (lat, lon, radius = 5000) => {
  // Overpass QL highly optimized regex query to prevent server timeouts
  const amenities = "restaurant|cafe|fast_food|hospital|clinic|pharmacy|post_office|bank|atm|cinema|theatre";
  const shops = "supermarket|mall|hairdresser|beauty|barber";

  const query = `
    [out:json][timeout:25];
    (
      nwr["amenity"~"^(${amenities})$"](around:${radius},${lat},${lon});
      nwr["shop"~"^(${shops})$"](around:${radius},${lat},${lon});
      nwr["office"="government"](around:${radius},${lat},${lon});
      nwr["public_transport"="station"](around:${radius},${lat},${lon});
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
        image: `https://picsum.photos/seed/${el.id}/400/300`, // Reliable placeholder
        distance: "Nearby", 
        lat: el.lat || (el.center && el.center.lat),
        lon: el.lon || (el.center && el.center.lon),
        updatedAt: Date.now() - Math.floor(Math.random() * 10000000),
      };
    });

  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
  }
};
