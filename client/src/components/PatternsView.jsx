import { useState, useEffect } from "react";

export const PatternsView = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [category, setCategory] = useState("All");
  const [userFeedback, setUserFeedback] = useState(null);
  
  // Real data state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [patternData, setPatternData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const categories = ["All", "Groceries", "Coffee", "Gyms", "Restaurants"];

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      }
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectPlace = async (place) => {
    const name = place.display_name.split(',')[0];
    setSelectedPlace(place);
    setSearchQuery(name);
    setSearchResults([]);
    setIsLoading(true);
    
    try {
      const res = await fetch(`http://localhost:5000/api/patterns?lat=${place.lat}&lon=${place.lon}&name=${encodeURIComponent(name)}`);
      const data = await res.json();
      setPatternData(data);
    } catch (err) {
      console.error(err);
    }
    
    setIsLoading(false);
    setUserFeedback(null); // Reset feedback for new place
  };

  return (
    <div className="mesh-bg min-h-screen pt-20 pb-28 px-5">
      <main className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center animate-slide-up">
          <div>
            <h1 className="text-3xl font-extrabold text-[#00342b]">Crowd Patterns</h1>
            <p className="text-sm text-[#3f4945] font-medium">Predictive density and optimal visit windows.</p>
          </div>
        </div>

        {/* Location & Category Search */}
        <section className="glass-card p-4 rounded-xl animate-slide-up flex flex-col md:flex-row gap-4 border border-white/60 relative z-50">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3f4945]">search</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search nearby places (e.g., Target, Starbucks)" 
              className="w-full bg-white/60 border border-white/80 rounded-lg py-2.5 pl-10 pr-4 text-sm font-bold text-[#00342b] placeholder-[#707975] focus:outline-none focus:ring-2 focus:ring-[#00342b]/20"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="material-symbols-outlined animate-spin text-[#3f4945]">progress_activity</span>
              </div>
            )}
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-[#00342b]/10 rounded-lg shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <button 
                    key={result.place_id}
                    onClick={() => handleSelectPlace(result)}
                    className="w-full text-left px-4 py-3 hover:bg-[#00342b]/5 border-b border-[#00342b]/5 last:border-0 transition-colors"
                  >
                    <p className="text-sm font-bold text-[#00342b]">{result.display_name.split(',')[0]}</p>
                    <p className="text-xs text-[#707975] truncate">{result.display_name.split(',').slice(1).join(',')}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${category === cat ? 'bg-[#00342b] text-white shadow-md' : 'bg-white/50 text-[#3f4945] hover:bg-white/80'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {!selectedPlace && !isLoading && (
          <div className="text-center py-20 animate-slide-up delay-100">
             <span className="material-symbols-outlined text-6xl text-[#00342b]/20 mb-4">storefront</span>
             <h2 className="text-xl font-bold text-[#00342b]">Search for a place</h2>
             <p className="text-sm text-[#3f4945]">Enter a location above to see real-time crowd patterns and wait times.</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-20 animate-pulse">
            <span className="material-symbols-outlined text-4xl text-[#00342b] animate-spin mb-4">progress_activity</span>
            <p className="text-sm font-bold text-[#00342b]">Analyzing crowd data...</p>
          </div>
        )}

        {patternData && !isLoading && (
          <div className="space-y-6 animate-slide-up">
            {/* Time Selector */}
            <section className="glass-card p-1.5 flex justify-between items-center rounded-xl">
              {['today', 'week', 'month'].map(t => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`flex-1 py-2 text-center capitalize rounded-lg text-sm font-bold transition-all ${timeRange === t ? "bg-white/90 text-[#00342b] shadow-sm" : "text-[#3f4945] hover:bg-white/40"}`}
                >
                  {t}
                </button>
              ))}
            </section>

            {/* Crowdsourcing Feedback Widget */}
            <section className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/60 bg-gradient-to-r from-white/40 to-transparent">
              <div className="flex items-center gap-3">
                <div className="bg-[#00342b]/10 p-2 rounded-full text-[#00342b]">
                  <span className="material-symbols-outlined text-[20px]">radar</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#00342b]">Are you at {patternData.venue_info.venue_name}?</h3>
                  <p className="text-xs text-[#3f4945]">Help others by reporting the current crowd.</p>
                </div>
              </div>
              {!userFeedback ? (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => setUserFeedback('quiet')} className="flex-1 sm:flex-none px-4 py-2 bg-white/60 hover:bg-[#4CAF50]/20 text-[#4CAF50] rounded-lg text-xs font-bold transition-colors border border-white/80">Quiet</button>
                  <button onClick={() => setUserFeedback('busy')} className="flex-1 sm:flex-none px-4 py-2 bg-white/60 hover:bg-[#F44336]/20 text-[#F44336] rounded-lg text-xs font-bold transition-colors border border-white/80">Busy</button>
                </div>
              ) : (
                <div className="text-xs font-bold text-[#4CAF50] bg-[#4CAF50]/10 px-4 py-2 rounded-lg flex items-center gap-1 border border-[#4CAF50]/20">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span> Thanks for your update!
                </div>
              )}
            </section>

            {/* Weekly Trends Chart Card */}
            <section className="glass-card rounded-2xl p-6 border border-white/60 relative overflow-hidden">
              {patternData.insights.current_status.is_live_spike && (
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-[#F44336]/10 px-3 py-1.5 rounded-full border border-[#F44336]/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F44336] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F44336]"></span>
                  </span>
                  <span className="text-[10px] font-extrabold text-[#F44336] uppercase tracking-wider">Live: Busier than usual</span>
                </div>
              )}

              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#00342b] mb-1">
                    {timeRange === "today" ? "Hourly Density" : timeRange === "week" ? "Weekly Trends" : "Monthly Overview"}
                  </h2>
                  <p className="text-xs text-[#3f4945]">Based on live reports and API forecasts.</p>
                </div>
              </div>

              {/* Chart Area */}
              <div className="relative h-48 w-full flex items-end justify-between gap-2 mt-8 border-b border-white/30 pb-2">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-t border-[#707975] w-full" />
                  <div className="border-t border-[#707975] w-full" />
                  <div className="border-t border-[#707975] w-full" />
                </div>

                {patternData.analysis.map((dayData, idx) => {
                  // Calculate average busyness for the day to plot on the week chart
                  const avgBusyness = dayData.day_raw.reduce((a, b) => a + b, 0) / dayData.day_raw.filter(b => b > 0).length || 0;
                  const height = `${Math.min(100, Math.max(10, avgBusyness))}%`;
                  const isCurrent = new Date().getDay() === dayData.day_info.day_int;
                  
                  let level = 'low';
                  let color = 'bg-[#4CAF50]';
                  let bg = 'bg-[#4CAF50]/20';
                  
                  if (avgBusyness > 60) {
                    level = 'high'; color = 'bg-[#F44336]'; bg = 'bg-[#F44336]/20';
                  } else if (avgBusyness > 30) {
                    level = 'medium'; color = 'bg-[#FFC107]'; bg = 'bg-[#FFC107]/20';
                  }

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 z-10 group h-full justify-end relative">
                      {isCurrent && patternData.insights.current_status.is_live_spike && (
                         <div className="absolute -top-6 bg-white/90 text-[#F44336] text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm border border-[#F44336]/20 whitespace-nowrap">
                           Spike
                         </div>
                      )}
                      <div className={`w-full ${bg} rounded-t-md relative overflow-hidden h-full flex items-end cursor-pointer`}>
                        <div
                          className={`w-full ${color} rounded-t-md transition-all duration-700 group-hover:brightness-110`}
                          style={{ height: height }}
                        />
                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#00342b] text-white text-[10px] py-1 px-2 rounded font-bold pointer-events-none whitespace-nowrap z-20">
                          {Math.round(avgBusyness)}%
                        </div>
                      </div>
                      <span className={`text-xs font-bold ${isCurrent ? "text-[#00342b]" : "text-[#3f4945]"}`}>
                        {dayData.day_info.day_text.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Forecast & Planning Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Next 4 Hours Forecast */}
              <section className="glass-card rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-2 text-[#00342b]">
                     <span className="material-symbols-outlined text-[20px]">schedule</span>
                     <h3 className="font-bold text-base">Forecast</h3>
                   </div>
                   <span className="text-[10px] font-bold text-[#3f4945] bg-white/50 px-2 py-1 rounded-md truncate max-w-[120px]">
                     {patternData.venue_info.venue_name}
                   </span>
                </div>
                
                <div className="space-y-3.5">
                  {/* Generate 4 hour slots starting from current hour */}
                  {[0, 1, 2, 3].map(offset => {
                    const h = (new Date().getHours() + offset) % 24;
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    const displayH = h % 12 || 12;
                    const currentDayData = patternData.analysis.find(a => a.day_info.day_int === new Date().getDay());
                    const busyness = currentDayData.day_raw[h];
                    
                    let status = "Quiet";
                    let color = "text-[#4CAF50]";
                    let icon = "person";
                    let est = "0-5 min";
                    
                    if (busyness > 60) {
                      status = "Busy"; color = "text-[#F44336]"; icon = "groups"; est = "20-30+ min";
                    } else if (busyness > 30) {
                      status = "Moderate"; color = "text-[#b08d00]"; icon = "group"; est = "10-15 min";
                    } else if (busyness === 0) {
                       status = "Closed"; color = "text-[#707975]"; icon = "block"; est = "-";
                    }

                    return (
                      <div key={offset} className="flex justify-between items-center pb-2.5 border-b border-white/20 last:border-0 last:pb-0">
                        <span className="text-sm font-semibold text-[#191c1b]">
                          {displayH}:00 {ampm} {offset === 0 && <span className="text-[#F44336] text-[10px] ml-1 font-bold">(Now)</span>}
                        </span>
                        <div className="flex items-center gap-3 text-right">
                          <div className="flex flex-col">
                            <span className={`text-sm font-extrabold ${color}`}>{est}</span>
                            <span className={`text-[10px] font-semibold ${color}/80`}>{status}</span>
                          </div>
                          <span className={`material-symbols-outlined ${color} text-[18px]`}>{icon}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Planning Insights */}
              <section className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-base text-[#00342b] mb-4">Planning Insights</h3>

                <div className="bg-white/60 border border-[#00342b]/20 rounded-xl p-4 mb-3.5 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-5">
                    <span className="material-symbols-outlined text-[100px] text-[#00342b]">verified</span>
                  </div>
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="bg-[#00342b]/10 p-2 rounded-full text-[#00342b] mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">recommend</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#00342b] uppercase tracking-wider">
                        Best Time To Go
                      </p>
                      <p className="text-base font-extrabold text-[#00342b]">
                        {patternData.insights.best_time_to_go.day}, {patternData.insights.best_time_to_go.hour}
                      </p>
                      <p className="text-xs text-[#3f4945] mt-1">
                        {patternData.insights.best_time_to_go.reason}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/50 border border-white/60 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-[#F44336]/20 p-2 rounded-full text-[#F44336] mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#3f4945] uppercase tracking-wider">
                        Recent User Reports
                      </p>
                      <p className="text-sm font-bold text-[#191c1b]">"Line is wrapping around the aisle!"</p>
                      <p className="text-[10px] text-[#707975] mt-1">
                        Reported 12 minutes ago by 3 users
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

