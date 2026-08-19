export const INITIAL_USER_PROFILE = {
  name: "Guest",
  level: "Beginner",
  avatarUrl: "",
  totalPoints: 0,
  weeklyPoints: 0,
  reportsThisWeek: 0,
  totalReports: 0,
  timeSavedHours: "0h 0m",
  peopleHelped: 0,
  impactScore: 0,
  communityRank: "Unranked",
  savedHoursNumber: 0,
};

export const INITIAL_BUSINESS_PROFILE = {
  businessName: "Your Business",
  managerName: "Manager",
  plan: "Free",
  totalCheckinsToday: 0,
  averageWaitTimeToday: 0,
  peakHourToday: "-",
  customerSatisfaction: 0, // out of 100
};

export const INITIAL_REPORTS = [];

export const INITIAL_PLACES = [];

// Generates places relative to a user location with exact coordinates & distances (Default: Nilokheri, Karnal)
export const getPlacesNearLocation = (userLat = 29.8339, userLng = 76.9201) => {
  const offsets = [
    { dLat: 0.0035, dLng: 0.0042 },
    { dLat: -0.0048, dLng: 0.0061 },
    { dLat: 0.0052, dLng: -0.0039 },
    { dLat: -0.0061, dLng: -0.0055 },
    { dLat: 0.0021, dLng: -0.0072 },
    { dLat: 0.0078, dLng: 0.0031 },
    { dLat: -0.0029, dLng: 0.0084 },
    { dLat: -0.0081, dLng: -0.0019 },
  ];

  return INITIAL_PLACES.map((place, idx) => {
    const offset = offsets[idx % offsets.length];
    const lat = userLat + offset.dLat;
    const lon = userLng + offset.dLng;

    const R = 6371;
    const dLat = offset.dLat * (Math.PI / 180);
    const dLon = offset.dLng * (Math.PI / 180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLat * (Math.PI / 180)) * Math.cos(lat * (Math.PI / 180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const rawDistanceKm = R * c;
    const distanceText = rawDistanceKm < 1 ? `${(rawDistanceKm * 1000).toFixed(0)} m away` : `${rawDistanceKm.toFixed(1)} km away`;

    return {
      ...place,
      lat,
      lon,
      rawDistanceKm,
      distance: distanceText,
    };
  });
};

