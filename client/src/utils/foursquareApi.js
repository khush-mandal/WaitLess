export const fetchNearbyPlaces = async (lat, lon, radius = 5000) => {
  const apiKey = import.meta.env.VITE_FOURSQUARE_API_KEY;
  
  if (!apiKey) {
    console.error("Foursquare API key is missing! Please add VITE_FOURSQUARE_API_KEY to your client/.env file.");
    // Return empty if no key
    return [];
  }

  // Foursquare Category IDs:
  // 15014 (Hospital), 15007 (Clinic), 17103 (Pharmacy)
  // 11045 (Bank), 11044 (ATM)
  // 13065 (Restaurant), 13032 (Cafe), 13145 (Fast Food)
  // 10024 (Movie Theater), 10027 (Theater)
  // 11116 (Post Office), 12064 (Government Building)
  // 11061 (Barbershop), 11063 (Hair Salon), 11064 (Nail Salon), 11062 (Salon/Barbershop)
  // 17069 (Supermarket), 17114 (Mall)
  // 19047 (Bus Station), 19050 (Train Station), 19042 (Transit Station)
  const categories = [
    "15014", "15007", "17103",
    "11045", "11044",
    "13065", "13032", "13145",
    "10024", "10027",
    "11116", "12064",
    "11061", "11062", "11063", "11064",
    "17069", "17114",
    "19042", "19047", "19050"
  ].join(",");

  const url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lon}&radius=${radius}&categories=${categories}&limit=50`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Foursquare API: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform Foursquare data into our app's format
    return data.results.map((place) => {
      let sector = "retail";
      let category = "Store";
      
      const categoryData = place.categories && place.categories.length > 0 ? place.categories[0] : null;
      const fsqCatId = categoryData ? categoryData.id.toString() : "";
      
      // Determine Sector & App Category based on Foursquare ID
      if (["13065", "13032", "13145"].includes(fsqCatId)) {
        sector = "hospitality";
        category = fsqCatId === "13032" ? "Cafe" : "Restaurant";
      } else if (["11045", "11044"].includes(fsqCatId)) {
        sector = "finance";
        category = fsqCatId === "11044" ? "ATM" : "Bank";
      } else if (["15014", "15007", "17103"].includes(fsqCatId)) {
        sector = "health";
        category = fsqCatId === "17103" ? "Pharmacy" : "Hospital/Clinic";
      } else if (["11116", "12064"].includes(fsqCatId)) {
        sector = "public";
        category = "Public Service";
      } else if (["11061", "11062", "11063", "11064"].includes(fsqCatId)) {
        sector = "retail";
        category = "Salon/Barbershop";
      } else if (["17069"].includes(fsqCatId)) {
        sector = "retail";
        category = "Supermarket";
      } else if (["17114"].includes(fsqCatId)) {
        sector = "retail";
        category = "Mall";
      } else if (["10024", "10027"].includes(fsqCatId)) {
        sector = "entertainment";
        category = "Theater";
      } else if (["19042", "19047", "19050"].includes(fsqCatId)) {
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

      // Foursquare ids are strings, we can prefix with 'osm-' temporarily or 'fsq-'
      // using 'fsq-' so we can filter properly in App.jsx
      return {
        id: `fsq-${place.fsq_id}`,
        name: place.name,
        category: category,
        sector: sector,
        crowdLevel: crowdLevel,
        currentWaitMin: currentWaitMin,
        statusLabel: crowdLevel === "high" ? "Busy" : crowdLevel === "medium" ? "Moderate" : "Not Busy",
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100% since Foursquare is usually better
        reportsCount: Math.floor(Math.random() * 20),
        image: `https://picsum.photos/seed/${place.fsq_id}/400/300`, // Reliable placeholder
        distance: "Nearby",
        lat: place.geocodes?.main?.latitude || lat,
        lon: place.geocodes?.main?.longitude || lon,
        address: place.location?.formatted_address || place.location?.address || "Nearby",
        updatedAt: Date.now() - Math.floor(Math.random() * 10000000),
      };
    });
  } catch (error) {
    console.error("Error fetching places from Foursquare:", error);
    return [];
  }
};
