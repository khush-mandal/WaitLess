import { useState } from "react";

export const ExploreView = ({
  places,
  userProfile,
  selectedSector,
  setSelectedSector,
  searchQuery,
  setSearchQuery,
  onSelectPlace,
  onOpenReportModal,
  onNavigateToReports,
  locationError
}) => {
  const [sortBy, setSortBy] = useState("default");
  const [filterOpenNow, setFilterOpenNow] = useState(false);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Updated recently';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Updated just now';
    if (minutes < 60) return `Updated ${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Updated ${hours}h ago`;
    return `Updated ${Math.floor(hours / 24)}d ago`;
  };

  let result = places.filter((place) => {
    const matchesSector = selectedSector === "all" || place.sector === selectedSector;
    const matchesQuery = searchQuery === "" || 
      (place.name && place.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (place.category && place.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // For now, we assume all mock places are open if they don't have isOpen explicitly false.
    // If we have actual isOpen data, we use it.
    const matchesOpenNow = filterOpenNow ? place.isOpen !== false : true; 
    
    return matchesSector && matchesQuery && matchesOpenNow;
  });

  if (sortBy === "wait_time") {
    result.sort((a, b) => {
      const waitA = a.currentWaitMin === -1 ? 9999 : (a.currentWaitMin || 0);
      const waitB = b.currentWaitMin === -1 ? 9999 : (b.currentWaitMin || 0);
      return waitA - waitB;
    });
  } else if (sortBy === "distance") {
    const getKm = (place) => {
      if (typeof place.rawDistanceKm === 'number') return place.rawDistanceKm;
      if (!place.distance) return 9999;
      const num = parseFloat(place.distance) || 0;
      if (place.distance.includes("m away") || place.distance.endsWith("m")) {
        return place.distance.includes("km") ? num : num / 1000;
      }
      if (place.distance.includes("mi")) return num * 1.60934;
      return num;
    };
    result.sort((a, b) => getKm(a) - getKm(b));
  }


  const filteredPlaces = result;
  return <div className="mesh-bg min-h-screen pt-20 pb-28 px-5">
      <main className="max-w-7xl mx-auto space-y-6">
        {
    /* Search Bar */
  }
        <section className="animate-slide-up delay-100">
          <div className="glass-card rounded-full flex items-center px-4 py-3 gap-3 transition-all focus-within:border-[#00342b] focus-within:bg-white/90 focus-within:shadow-md hover:bg-white/80 cursor-text border border-white/60">
            <span className="material-symbols-outlined text-[#707975]">search</span>
            <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search hospitality, banks, retail..."
    className="bg-transparent border-none outline-none w-full text-sm text-[#191c1b] placeholder-[#707975] focus:ring-0 p-0 font-medium"
  />
            {searchQuery && <button
    onClick={() => setSearchQuery("")}
    className="text-[#707975] hover:text-[#191c1b] p-1"
  >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>}
          </div>
        </section>

        {
    /* Activity Summary / Impact Banner */
  }
        <section className="animate-slide-up delay-200">
          <div
    onClick={onNavigateToReports}
    className="glass-card rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/80 transition-all border border-white/60 group shadow-sm active:scale-[0.99]"
  >
            <div>
              <h3 className="font-extrabold text-base text-[#191c1b]">Your Impact</h3>
              <p className="text-xs text-[#3f4945] mt-0.5 font-medium">
                {userProfile.totalPoints} Points • {userProfile.reportsThisWeek} Reports this week
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#004d40]/15 flex items-center justify-center border border-[#004d40]/20 group-hover:scale-110 transition-transform">
              <span
    className="material-symbols-outlined text-[#00342b] text-[24px]"
    style={{ fontVariationSettings: "'FILL' 1" }}
  >
                workspace_premium
              </span>
            </div>
          </div>
        </section>

        {
    /* Browse Sectors Grid */
  }
        <section className="animate-slide-up delay-300">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-extrabold text-xl text-[#191c1b]">Browse Sectors</h2>
            {selectedSector !== "all" && <button
    onClick={() => setSelectedSector("all")}
    className="text-xs font-bold text-[#00342b] hover:underline"
  >
                Clear Sector Filter
              </button>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {
    /* Hospitality */
  }
            <button
    onClick={() => setSelectedSector(selectedSector === "hospitality" ? "all" : "hospitality")}
    className={`glass-card rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer border ${selectedSector === "hospitality" ? "bg-white border-[#00342b] ring-2 ring-[#00342b]/20 shadow-md" : "hover:bg-white/80 border-white/60"}`}
  >
              <div className="w-14 h-14 rounded-full bg-[#B2DFDB]/30 flex items-center justify-center border border-[#B2DFDB]/60">
                <span className="material-symbols-outlined text-[#00342b] text-2xl">
                  restaurant
                </span>
              </div>
              <span className="font-bold text-sm text-[#191c1b]">Hospitality</span>
            </button>

            {
    /* Finance */
  }
            <button
    onClick={() => setSelectedSector(selectedSector === "finance" ? "all" : "finance")}
    className={`glass-card rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer border ${selectedSector === "finance" ? "bg-white border-[#00342b] ring-2 ring-[#00342b]/20 shadow-md" : "hover:bg-white/80 border-white/60"}`}
  >
              <div className="w-14 h-14 rounded-full bg-[#E3F2FD]/40 flex items-center justify-center border border-[#E3F2FD]">
                <span className="material-symbols-outlined text-[#00342b] text-2xl">
                  account_balance
                </span>
              </div>
              <span className="font-bold text-sm text-[#191c1b]">Finance</span>
            </button>

            {
    /* Retail */
  }
            <button
    onClick={() => setSelectedSector(selectedSector === "retail" ? "all" : "retail")}
    className={`glass-card rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer border ${selectedSector === "retail" ? "bg-white border-[#00342b] ring-2 ring-[#00342b]/20 shadow-md" : "hover:bg-white/80 border-white/60"}`}
  >
              <div className="w-14 h-14 rounded-full bg-[#ffb5a1]/30 flex items-center justify-center border border-[#ffb5a1]/50">
                <span className="material-symbols-outlined text-[#4e2013] text-2xl">
                  storefront
                </span>
              </div>
              <span className="font-bold text-sm text-[#191c1b]">Retail</span>
            </button>

            {
    /* Entertainment */
  }
            <button
    onClick={() => setSelectedSector(selectedSector === "entertainment" ? "all" : "entertainment")}
    className={`glass-card rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer border ${selectedSector === "entertainment" ? "bg-white border-[#00342b] ring-2 ring-[#00342b]/20 shadow-md" : "hover:bg-white/80 border-white/60"}`}
  >
              <div className="w-14 h-14 rounded-full bg-[#96f592]/30 flex items-center justify-center border border-[#96f592]/50">
                <span className="material-symbols-outlined text-[#006e1c] text-2xl">movie</span>
              </div>
              <span className="font-bold text-sm text-[#191c1b]">Entertainment</span>
            </button>
          </div>
        </section>

        {
    /* Filter Chips Bar */
  }
        <section className="animate-slide-up delay-300">
          <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
            <button
    onClick={() => { setSortBy("default"); setFilterOpenNow(false); setSelectedSector("all"); }}
    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${(sortBy === "default" && !filterOpenNow && selectedSector === "all") ? "bg-[#004d40] text-white shadow-sm" : "glass-card text-[#3f4945] hover:bg-white"}`}
  >
              <span className="material-symbols-outlined text-[15px]">tune</span>
              Filters
            </button>

            <button
    onClick={() => setSortBy(sortBy === "wait_time" ? "default" : "wait_time")}
    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${sortBy === "wait_time" ? "bg-[#004d40] text-white shadow-sm" : "glass-card text-[#3f4945] hover:bg-white"}`}
  >
              Wait Time
              <span className="material-symbols-outlined text-[15px]">arrow_drop_down</span>
            </button>

            <button
    onClick={() => setSortBy(sortBy === "distance" ? "default" : "distance")}
    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${sortBy === "distance" ? "bg-[#004d40] text-white shadow-sm" : "glass-card text-[#3f4945] hover:bg-white"}`}
  >
              Distance
              <span className="material-symbols-outlined text-[15px]">arrow_drop_down</span>
            </button>

            <button
    onClick={() => setFilterOpenNow(!filterOpenNow)}
    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filterOpenNow ? "bg-[#004d40] text-white shadow-sm" : "glass-card text-[#3f4945] hover:bg-white"}`}
  >
              Open Now
            </button>
          </div>
        </section>

        {
    /* Nearby Spots - Horizontal Carousel / Grid */
  }
        <section className="animate-slide-up delay-400">
          <div className="flex justify-between items-end mb-3">
            <h2 className="font-extrabold text-xl text-[#191c1b]">
              {selectedSector !== "all" ? `Nearby ${selectedSector.charAt(0).toUpperCase() + selectedSector.slice(1)}` : "Nearby Spots"}
            </h2>
            <span className="text-xs text-[#00342b] font-bold">
              {filteredPlaces.length} places available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredPlaces.length === 0 && locationError && (
              <div className="col-span-full glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-white/60 my-4">
                <span className="material-symbols-outlined text-[48px] text-[#F44336] mb-4 opacity-80">location_off</span>
                <h3 className="font-extrabold text-xl text-[#191c1b] mb-2">Location Access Required</h3>
                <p className="text-sm text-[#3f4945] max-w-md mx-auto mb-6">
                  WaitLess needs your location to show real-time crowds and wait times for places near you. Please enable location access in your browser or device settings.
                </p>
              </div>
            )}
            {filteredPlaces.map((place) => {
    const isUnknown = place.crowdLevel === "unknown";
    if (isUnknown) {
      return <div
        key={place.id}
        onClick={() => onSelectPlace(place)}
        className="glass-card rounded-2xl p-5 flex flex-col justify-between border-dashed border-2 border-white/60 bg-white/30 hover:bg-white/50 transition-all cursor-pointer group"
      >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-base text-[#191c1b]">{place.name}</h3>
                        <span className="bg-white/60 px-2 py-0.5 rounded text-[10px] font-bold text-[#707975]">
                          Unknown
                        </span>
                      </div>
                      <p className="text-xs text-[#3f4945] flex items-center gap-1 mb-3">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {place.distance} away
                      </p>
                      <p className="text-xs text-[#707975] font-medium">
                        No recent reports - be the first to update!
                      </p>
                    </div>

                    <button
        onClick={() => onOpenReportModal(place.id)}
        className="mt-4 w-full bg-[#004d40] text-white hover:bg-[#00342b] font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
      >
                      <span className="material-symbols-outlined text-[16px]">add_circle</span>
                      Submit Report
                    </button>
                  </div>;
    }
    let statusBg = "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/20";
    let statusIcon = "groups";
    if (place.crowdLevel === "high") {
      statusBg = "bg-[#F44336]/15 text-[#F44336] border-[#F44336]/20";
      statusIcon = "error";
    } else if (place.crowdLevel === "medium") {
      statusBg = "bg-[#FFC107]/15 text-[#b08d00] border-[#FFC107]/20";
      statusIcon = "warning";
    }
    return <div
      key={place.id}
      onClick={() => onSelectPlace(place)}
      className="glass-card rounded-2xl overflow-hidden cursor-pointer group hover:scale-[1.02] hover:bg-white/80 transition-all border border-white/60 shadow-sm active:scale-[0.99] flex flex-col"
    >
                  {
      /* Image Container */
    }
                  <div className="h-36 bg-slate-200 relative overflow-hidden">
                    <img
      src={place.image}
      alt={place.name}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/50 shadow-sm">
                      <span className="material-symbols-outlined text-[14px] text-[#191c1b]">
                        location_on
                      </span>
                      <span className="text-xs font-bold text-[#191c1b]">{place.distance}</span>
                    </div>
                  </div>

                  {
      /* Body Content */
    }
                  <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                    <div>
                      <h4 className="font-extrabold text-base text-[#191c1b] truncate group-hover:text-[#00342b] transition-colors">
                        {place.name}
                      </h4>
                      <p className="text-xs text-[#3f4945] truncate font-medium mt-0.5">
                        {place.category}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-1 mt-1">
                      <div className="flex items-center gap-1.5 text-xs text-[#3f4945] font-medium">
                        <span className="material-symbols-outlined text-[15px] text-[#004d40]">schedule</span>
                        {place.currentWaitMin > 0 ? `~${place.currentWaitMin}m wait` : 'No wait'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#3f4945] font-medium">
                        <span className="material-symbols-outlined text-[15px] text-[#004d40]">verified</span>
                        {place.confidence}% Score
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#3f4945] font-medium col-span-2">
                        <span className="material-symbols-outlined text-[15px] text-[#004d40]">update</span>
                        {place.updatedAt ? formatTimeAgo(place.updatedAt) : 'Updated recently'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/40">
                      <div className="flex items-center gap-1.5">
                        <span
      className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${statusBg}`}
    >
                          <span className="material-symbols-outlined text-[14px]">
                            {statusIcon}
                          </span>
                          {place.statusLabel}
                        </span>
                      </div>

                      <button
      onClick={(e) => {
        e.stopPropagation();
        onSelectPlace(place);
      }}
      className="bg-white/60 hover:bg-white text-[#00342b] font-bold text-xs px-3 py-1.5 rounded-lg border border-white/40 active:scale-95 transition-all"
    >
                        Details
                      </button>
                    </div>
                  </div>
                </div>;
  })}
          </div>
        </section>
      </main>
    </div>;
};
