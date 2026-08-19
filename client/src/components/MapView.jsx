import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker icons issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically update map center
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// Custom User Location Pulsing Blue Icon
const userLocationIcon = L.divIcon({
  className: 'user-location-pulse-marker',
  html: `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 24px; height: 24px; background: rgba(0, 150, 255, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 14px; height: 14px; background: #007AFF; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.4); z-index: 2;"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export const MapView = ({
  places,
  onSelectPlace,
  selectedSector,
  setSelectedSector,
  searchQuery,
  setSearchQuery,
  onOpenReportModal,
  userLocation,
  locationError
}) => {
  const [activePlace, setActivePlace] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

  // Default center based on loaded places or fallback coordinates (Nilokheri, Karnal)
  const firstPlaceCoords = places && places.length > 0 && places[0].lat && places[0].lon ? [places[0].lat, places[0].lon] : [29.8339, 76.9201];
  const center = mapCenter || (userLocation ? [userLocation.latitude, userLocation.longitude] : firstPlaceCoords);

  const filterCategory = (sector) => {
    setSelectedSector(sector);
  };

  const handleLocateMe = () => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
    }
  };

  const filteredPlaces = places.filter((place) => {
    const matchesSector = selectedSector === "all" || place.sector === selectedSector;
    const matchesQuery = searchQuery === "" || place.name.toLowerCase().includes(searchQuery.toLowerCase()) || place.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesQuery && place.lat && place.lon;
  });

  return (
    <div className="relative w-full h-[calc(100vh-64px)] flex flex-col">
      {locationError && !userLocation && (
        <div className="absolute inset-0 z-[1000] bg-white/80 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-[#F44336]/30 bg-white/95 max-w-sm w-full shadow-2xl">
            <span className="material-symbols-outlined text-[48px] text-[#F44336] mb-4 opacity-80">location_off</span>
            <h3 className="font-extrabold text-xl text-[#191c1b] mb-2">Location Access Required</h3>
            <p className="text-sm text-[#3f4945] mb-6">
              WaitLess needs your location to show real-time crowds and wait times on the map. Please enable location access.
            </p>
            <button onClick={() => window.location.reload()} className="bg-[#004d40] text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-[#00342b] transition-colors">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={center} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={center} />
          
          {/* User Location Marker */}
          {userLocation && (
            <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userLocationIcon}>
              <Popup>📍 <strong>Your Live Location</strong></Popup>
            </Marker>
          )}

          {/* Place Markers */}
          {filteredPlaces.map((place) => {
            const isSelected = activePlace?.id === place.id;
            let iconColor = "#4CAF50"; // Green for low wait
            if (place.crowdLevel === "high") iconColor = "#F44336"; // Red
            else if (place.crowdLevel === "medium") iconColor = "#FFC107"; // Yellow

            const customIcon = L.divIcon({
              className: 'custom-leaflet-marker',
              html: `<div style="
                background-color: ${iconColor};
                width: ${isSelected ? '24px' : '16px'};
                height: ${isSelected ? '24px' : '16px'};
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
              "></div>`,
              iconSize: isSelected ? [24, 24] : [16, 16],
              iconAnchor: isSelected ? [12, 12] : [8, 8],
            });

            return (
              <Marker 
                key={place.id}
                position={[place.lat, place.lon]} 
                icon={customIcon}
                eventHandlers={{
                  click: () => setActivePlace(place),
                }}
              />
            );
          })}
        </MapContainer>
      </div>

      {/* Floating Recenter Location Button */}
      {userLocation && (
        <button
          onClick={handleLocateMe}
          className="absolute right-5 bottom-24 md:bottom-28 z-30 bg-white hover:bg-gray-50 text-[#00342b] p-3 rounded-full shadow-lg border border-white/60 transition-transform active:scale-95 flex items-center justify-center pointer-events-auto"
          title="Recenter on My Location"
        >
          <span className="material-symbols-outlined text-[22px]">my_location</span>
        </button>
      )}

      {/* Top Floating Controls */}
      <div className="relative z-20 pt-4 px-5 max-w-2xl mx-auto w-full flex flex-col gap-2.5 pointer-events-auto">
        {/* Search Bar */}
        <div className="glass-panel rounded-2xl flex items-center px-4 py-2.5 bg-white/90 backdrop-blur-md shadow-md transition-all focus-within:border-[#00342b]">
          <span className="material-symbols-outlined text-[#707975] mr-2.5">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search places or sectors..."
            className="bg-transparent border-none outline-none w-full text-sm text-[#191c1b] placeholder-[#707975] focus:ring-0 p-0"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#707975] hover:text-[#191c1b]">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
          <button className="text-[#00342b] hover:opacity-80 ml-2">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
          <button
            onClick={() => filterCategory("hospitality")}
            className={`whitespace-nowrap font-bold text-xs px-4 py-2 rounded-full border border-white/40 shadow-md flex items-center gap-1.5 transition-all ${
              selectedSector === "hospitality" ? "bg-[#004d40] text-[#7ebdac]" : "bg-white/90 backdrop-blur-md text-[#191c1b] hover:bg-white"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">restaurant</span> Restaurants
          </button>

          <button
            onClick={() => filterCategory("finance")}
            className={`whitespace-nowrap font-bold text-xs px-4 py-2 rounded-full border border-white/40 shadow-md flex items-center gap-1.5 transition-all ${
              selectedSector === "finance" ? "bg-[#004d40] text-[#7ebdac]" : "bg-white/90 backdrop-blur-md text-[#191c1b] hover:bg-white"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">account_balance</span> Banks
          </button>

          <button
            onClick={() => filterCategory("health")}
            className={`whitespace-nowrap font-bold text-xs px-4 py-2 rounded-full border border-white/40 shadow-md flex items-center gap-1.5 transition-all ${
              selectedSector === "health" ? "bg-[#004d40] text-[#7ebdac]" : "bg-white/90 backdrop-blur-md text-[#191c1b] hover:bg-white"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">local_hospital</span> Hospitals
          </button>
          
          <button
            onClick={() => filterCategory("entertainment")}
            className={`whitespace-nowrap font-bold text-xs px-4 py-2 rounded-full border border-white/40 shadow-md flex items-center gap-1.5 transition-all ${
              selectedSector === "entertainment" ? "bg-[#004d40] text-[#7ebdac]" : "bg-white/90 backdrop-blur-md text-[#191c1b] hover:bg-white"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">theaters</span> Theaters
          </button>

          <button
            onClick={() => filterCategory("all")}
            className={`whitespace-nowrap font-bold text-xs px-4 py-2 rounded-full border border-white/40 shadow-md flex items-center gap-1.5 transition-all ${
              selectedSector === "all" ? "bg-[#004d40] text-[#7ebdac]" : "bg-white/90 backdrop-blur-md text-[#191c1b] hover:bg-white"
            }`}
          >
            Show All
          </button>
        </div>
      </div>

      {/* Bottom Sheet Drawer for Selected Place */}
      <div className="mt-auto relative z-20 px-5 pb-20 md:pb-6 max-w-2xl mx-auto w-full pointer-events-auto">
        {activePlace && (
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl animate-slide-up border border-white/60">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-bold text-xl text-[#191c1b] mb-1">{activePlace.name}</h2>
                <p className="text-sm text-[#3f4945] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#00342b]">
                    location_on
                  </span>
                  {activePlace.distance} away • {activePlace.category}
                </p>
              </div>

              {/* Status Badge & Confidence */}
              <div className="flex items-center gap-2">
                <div
                  className={`rounded-xl px-3.5 py-1.5 flex items-center gap-2 border ${
                    activePlace.crowdLevel === "high"
                      ? "bg-[#F44336]/10 border-[#F44336]/30 text-[#F44336]"
                      : activePlace.crowdLevel === "medium"
                      ? "bg-[#FFC107]/15 border-[#FFC107]/30 text-[#b08d00]"
                      : "bg-[#4CAF50]/15 border-[#4CAF50]/30 text-[#4CAF50]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {activePlace.crowdLevel === "high"
                      ? "error"
                      : activePlace.crowdLevel === "medium"
                      ? "warning"
                      : "check_circle"}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-bold text-[10px] uppercase tracking-wider">
                      {activePlace.statusLabel}
                    </span>
                    <span className="text-xs font-bold">
                      {activePlace.currentWaitMin > 0 ? `${activePlace.currentWaitMin}m wait` : "0-5 min"}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center bg-[#004d40]/10 border border-[#004d40]/20 text-[#00342b] px-3 py-1 rounded-xl shadow-sm self-stretch h-auto">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Score</span>
                  </div>
                  <span className="text-xs font-bold text-center">{activePlace.confidence || 85}%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onSelectPlace(activePlace)}
                className="flex-1 bg-[#004d40] text-white hover:bg-[#00342b] font-bold text-sm py-3 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 active:scale-95"
              >
                View Details <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <button
                onClick={() => onOpenReportModal(activePlace.id)}
                className="bg-white border text-[#00342b] font-bold text-sm px-4 py-3 rounded-xl transition-all flex items-center gap-1 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
