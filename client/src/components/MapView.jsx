import { useState } from "react";
export const MapView = ({
  places,
  onSelectPlace,
  selectedSector,
  setSelectedSector,
  searchQuery,
  setSearchQuery,
  onOpenReportModal
}) => {
  const [activePlace, setActivePlace] = useState(
    places.find((p) => p.name === "The Roasted Bean") || places[0]
  );
  const filterCategory = (categoryKey) => {
    if (categoryKey === "coffee") setSelectedSector("hospitality");
    else if (categoryKey === "groceries") setSelectedSector("retail");
    else if (categoryKey === "finance") setSelectedSector("finance");
    else setSelectedSector("all");
  };
  const filteredPlaces = places.filter((place) => {
    const matchesSector = selectedSector === "all" || place.sector === selectedSector;
    const matchesQuery = searchQuery === "" || place.name.toLowerCase().includes(searchQuery.toLowerCase()) || place.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesQuery;
  });
  return <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      {
    /* Map Background Layer */
  }
      <div
    className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500"
    style={{
      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBq7IVxJddiKkn9HF7qsi9g4BemU-2fPEw98ngUma1CW8WLSyvCRgznQUGVP6IPvXztV5a79rISWV1Bz_NVVvYqmQdpB3S-9_6lX4kwZ0jDxDWaIfN6ft_uOX157YMK9mRDN01yRJF7TwzeSUCc32O5M494I4vZkaPyDKBhw3EKzLElntam8VH2_s88nNKYUUfJkiwU-z5flBGh_HSALLaHqtkqiG2B65c6J9PIU5ZpqP-LaF8Du7gRWg')`
    }}
  >
        {
    /* Map Grid Lines Overlay for aesthetic realism */
  }
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/60 pointer-events-none" />

        {
    /* Map Markers */
  }
        {filteredPlaces.map((place) => {
    const isSelected = activePlace.id === place.id;
    let badgeBg = "bg-[#4CAF50]/20 border-[#4CAF50] text-[#4CAF50]";
    let stemColor = "bg-[#4CAF50]";
    let icon = "groups";
    if (place.crowdLevel === "high") {
      badgeBg = "bg-[#F44336]/20 border-[#F44336] text-[#F44336]";
      stemColor = "bg-[#F44336]";
      icon = "timer";
    } else if (place.crowdLevel === "medium") {
      badgeBg = "bg-[#FFC107]/20 border-[#FFC107] text-[#b08d00]";
      stemColor = "bg-[#FFC107]";
      icon = "schedule";
    }
    return <div
      key={place.id}
      onClick={() => setActivePlace(place)}
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer transition-all duration-300 ${isSelected ? "scale-125 z-30" : "hover:scale-110 opacity-90 hover:opacity-100"}`}
      style={{
        left: `${place.mapCoords.xPercent}%`,
        top: `${place.mapCoords.yPercent}%`
      }}
    >
              <div className="relative flex flex-col items-center">
                <div
      className={`${badgeBg} backdrop-blur-md border rounded-full px-3 py-1 flex items-center gap-1 shadow-lg font-bold text-xs`}
    >
                  <span className="material-symbols-outlined text-[15px]">{icon}</span>
                  <span>{place.currentWaitMin > 0 ? `${place.currentWaitMin}m` : "5m"}</span>
                </div>
                <div className={`w-1 h-3 ${stemColor}`} />
                <div className={`w-2.5 h-2.5 rounded-full ${stemColor} shadow-md`} />
              </div>
            </div>;
  })}
      </div>

      {
    /* Top Floating Controls */
  }
      <div className="relative z-20 pt-4 px-5 max-w-2xl mx-auto w-full flex flex-col gap-2.5 pointer-events-auto">
        {
    /* Search Bar */
  }
        <div className="glass-panel rounded-2xl flex items-center px-4 py-2.5 hover:bg-white/90 transition-all focus-within:border-[#00342b]">
          <span className="material-symbols-outlined text-[#707975] mr-2.5">search</span>
          <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search places or sectors..."
    className="bg-transparent border-none outline-none w-full text-sm text-[#191c1b] placeholder-[#707975] focus:ring-0 p-0"
  />
          {searchQuery && <button onClick={() => setSearchQuery("")} className="text-[#707975] hover:text-[#191c1b]">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>}
          <button className="text-[#00342b] hover:opacity-80 ml-2">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>

        {
    /* Category Pills */
  }
        <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
          <button
    onClick={() => filterCategory("coffee")}
    className={`whitespace-nowrap font-bold text-xs px-4 py-2 rounded-full border border-white/40 shadow-sm flex items-center gap-1.5 transition-all ${selectedSector === "hospitality" ? "bg-[#004d40] text-[#7ebdac]" : "glass-panel text-[#191c1b] hover:bg-white"}`}
  >
            <span className="material-symbols-outlined text-[15px]">local_cafe</span> Coffee
          </button>

          <button
    onClick={() => filterCategory("groceries")}
    className={`whitespace-nowrap font-bold text-xs px-4 py-2 rounded-full border border-white/40 shadow-sm flex items-center gap-1.5 transition-all ${selectedSector === "retail" ? "bg-[#004d40] text-[#7ebdac]" : "glass-panel text-[#191c1b] hover:bg-white"}`}
  >
            <span className="material-symbols-outlined text-[15px]">shopping_cart</span> Groceries
          </button>

          <button
    onClick={() => filterCategory("finance")}
    className={`whitespace-nowrap font-bold text-xs px-4 py-2 rounded-full border border-white/40 shadow-sm flex items-center gap-1.5 transition-all ${selectedSector === "finance" ? "bg-[#004d40] text-[#7ebdac]" : "glass-panel text-[#191c1b] hover:bg-white"}`}
  >
            <span className="material-symbols-outlined text-[15px]">account_balance</span> Finance
          </button>

          <button
    onClick={() => setSelectedSector("all")}
    className={`whitespace-nowrap font-bold text-xs px-4 py-2 rounded-full border border-white/40 shadow-sm flex items-center gap-1.5 transition-all ${selectedSector === "all" ? "bg-[#004d40] text-[#7ebdac]" : "glass-panel text-[#191c1b] hover:bg-white"}`}
  >
            Show All
          </button>
        </div>
      </div>

      {
    /* Bottom Sheet Drawer for Selected Place */
  }
      <div className="mt-auto relative z-20 px-5 pb-20 md:pb-6 max-w-2xl mx-auto w-full pointer-events-auto">
        {activePlace && <div className="glass-panel rounded-2xl p-5 shadow-xl animate-slide-up border border-white/60">
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

              {
    /* Status Badge */
  }
              <div
    className={`rounded-xl px-3.5 py-1.5 flex items-center gap-2 border ${activePlace.crowdLevel === "high" ? "bg-[#F44336]/10 border-[#F44336]/30 text-[#F44336]" : activePlace.crowdLevel === "medium" ? "bg-[#FFC107]/15 border-[#FFC107]/30 text-[#b08d00]" : "bg-[#4CAF50]/15 border-[#4CAF50]/30 text-[#4CAF50]"}`}
  >
                <span className="material-symbols-outlined text-[18px]">
                  {activePlace.crowdLevel === "high" ? "error" : activePlace.crowdLevel === "medium" ? "warning" : "check_circle"}
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
            </div>

            <div className="flex gap-3">
              <button
    onClick={() => onSelectPlace(activePlace)}
    className="flex-1 bg-[#004d40] text-[#7ebdac] hover:bg-[#00342b] font-bold text-sm py-3 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 active:scale-95"
  >
                View Details <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <button
    onClick={() => onOpenReportModal(activePlace.id)}
    className="bg-white/60 hover:bg-white text-[#00342b] font-bold text-sm px-4 py-3 rounded-xl transition-all border border-white/50 flex items-center gap-1 active:scale-95"
  >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Report
              </button>
            </div>
          </div>}
      </div>
    </div>;
};
