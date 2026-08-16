<<<<<<< HEAD
import { useState, useEffect, useMemo } from "react";

// Deterministic hash to seed per-venue crowd trends
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Client-side fallback pattern generator for instant offline/standalone support
const generateFallbackPattern = (place) => {
  const venueName = place.name || "Selected Location";
  const seed = hashString(venueName);
  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay(); // 0 is Sunday, 1 is Monday

  // 7 days of the week: Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=0
  const days = [
    { day_int: 1, day_text: "Monday", baseFactor: 0.35 + ((seed % 5) * 0.08) },
    { day_int: 2, day_text: "Tuesday", baseFactor: 0.50 + (((seed * 3) % 5) * 0.07) },
    { day_int: 3, day_text: "Wednesday", baseFactor: 0.22 + (((seed * 5) % 4) * 0.06) }, // Lowest day
    { day_int: 4, day_text: "Thursday", baseFactor: 0.55 + (((seed * 7) % 5) * 0.07) },
    { day_int: 5, day_text: "Friday", baseFactor: 0.82 + (((seed * 11) % 4) * 0.05) },
    { day_int: 6, day_text: "Saturday", baseFactor: 0.88 - (((seed * 13) % 4) * 0.05) }, // Peak weekend
    { day_int: 0, day_text: "Sunday", baseFactor: 0.38 + (((seed * 17) % 5) * 0.06) }
  ];

  let lowestDensity = Infinity;
  let bestDayText = "Wednesday";
  let bestHourText = "3:00 PM";

  const analysis = days.map((d) => {
    const day_raw = [];
    for (let h = 0; h < 24; h++) {
      if (h >= 8 && h <= 22) {
        const hourSine = Math.sin((h - 8) * Math.PI / 14);
        let busyness = Math.floor((25 + hourSine * 60) * d.baseFactor);
        const hourNoise = ((seed * (h + 1) * (d.day_int + 1)) % 13) - 6;
        busyness = Math.max(10, Math.min(98, busyness + hourNoise));

        if (d.day_int === currentDay && h === currentHour && (seed % 3 === 0)) {
          busyness = Math.min(100, busyness + 25);
        }

        day_raw.push(busyness);

        if (busyness < lowestDensity) {
          lowestDensity = busyness;
          bestDayText = d.day_text;
          const displayH = h % 12 || 12;
          const ampm = h >= 12 ? 'PM' : 'AM';
          bestHourText = `${displayH}:00 ${ampm}`;
        }
      } else {
        day_raw.push(0);
      }
    }
    return { day_info: { day_int: d.day_int, day_text: d.day_text }, day_raw };
  });

  return {
    status: 'OK',
    venue_info: {
      venue_name: venueName,
      venue_address: place.address || "88 Grand Avenue",
    },
    analysis: analysis,
    insights: {
      best_time_to_go: {
        day: bestDayText,
        hour: bestHourText,
        reason: `Typically has lowest expected crowd density (~${Math.round(lowestDensity)}% busyness, 0-5 min wait).`
      },
      current_status: {
        hour: currentHour,
        busyness: analysis.find(a => a.day_info.day_int === currentDay)?.day_raw[currentHour] || 45,
        is_live_spike: (seed % 3 === 0)
      }
    }
  };
};

export const PatternsView = ({ places = [], onSelectPlace }) => {
=======
import { useState, useEffect } from "react";

export const PatternsView = () => {
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
  const [timeRange, setTimeRange] = useState("week");
  const [category, setCategory] = useState("All");
  const [userFeedback, setUserFeedback] = useState(null);
  
<<<<<<< HEAD
=======
  // Real data state
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [patternData, setPatternData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const categories = ["All", "Groceries", "Coffee", "Gyms", "Restaurants"];

<<<<<<< HEAD
  // Filter 2-3 nearest queued/busy places
  const queuedPlaces = useMemo(() => {
    if (!places || places.length === 0) return [];
    const busy = places.filter(p => p.crowdLevel === "high" || p.crowdLevel === "medium" || (p.currentWaitMin && p.currentWaitMin > 5));
    if (busy.length >= 3) return busy.slice(0, 3);
    
    const busyIds = new Set(busy.map(p => p.id));
    const rest = places.filter(p => !busyIds.has(p.id));
    return [...busy, ...rest].slice(0, 3);
  }, [places]);

  // Handle selecting a place from the queued places cards
  const handleSelectAppPlace = async (place) => {
    setSelectedPlace(place);
    setSearchQuery(place.name);
    setSearchResults([]);
    setIsLoading(true);
    
    try {
      const lat = place.lat || 40.7580;
      const lon = place.lon || -73.9855;
      const res = await fetch(`/api/patterns?lat=${lat}&lon=${lon}&name=${encodeURIComponent(place.name)}`);
      if (res.ok) {
        const data = await res.json();
        setPatternData(data);
      } else {
        setPatternData(generateFallbackPattern(place));
      }
    } catch (err) {
      setPatternData(generateFallbackPattern(place));
    } finally {
      setIsLoading(false);
      setUserFeedback(null);
    }
  };

  // Pre-select 1st queued place on initial load so page is never empty
  useEffect(() => {
    if (!selectedPlace && queuedPlaces.length > 0) {
      handleSelectAppPlace(queuedPlaces[0]);
    }
  }, [queuedPlaces]);

=======
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
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
<<<<<<< HEAD
    const placeObj = {
      name,
      address: place.display_name,
      lat: place.lat,
      lon: place.lon,
      currentWaitMin: 15,
      crowdLevel: "medium"
    };
    setSelectedPlace(placeObj);
=======
    setSelectedPlace(place);
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
    setSearchQuery(name);
    setSearchResults([]);
    setIsLoading(true);
    
    try {
<<<<<<< HEAD
      const res = await fetch(`/api/patterns?lat=${place.lat}&lon=${place.lon}&name=${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        setPatternData(data);
      } else {
        setPatternData(generateFallbackPattern(placeObj));
      }
    } catch (err) {
      setPatternData(generateFallbackPattern(placeObj));
    } finally {
      setIsLoading(false);
      setUserFeedback(null);
    }
  };

  // Calculate day averages for weekly chart
  const weeklyDaysData = useMemo(() => {
    if (!patternData || !patternData.analysis) return [];
    return patternData.analysis.map(dayData => {
      const nonZero = dayData.day_raw.filter(b => b > 0);
      const avgBusyness = nonZero.length ? Math.round(nonZero.reduce((a, b) => a + b, 0) / nonZero.length) : 0;
      return {
        ...dayData,
        avgBusyness
      };
    });
  }, [patternData]);

  // Find lowest density day for Peak Low badge
  const minWeeklyBusyness = useMemo(() => {
    if (!weeklyDaysData.length) return 0;
    return Math.min(...weeklyDaysData.map(d => d.avgBusyness));
  }, [weeklyDaysData]);

  // Calculate today's hourly data (8 AM to 10 PM)
  const todayHourlyData = useMemo(() => {
    if (!patternData || !patternData.analysis) return [];
    const currentDayInt = new Date().getDay();
    const todayAnalysis = patternData.analysis.find(a => a.day_info.day_int === currentDayInt) || patternData.analysis[0];
    
    const hours = [];
    for (let h = 8; h <= 22; h++) {
      const displayH = h % 12 || 12;
      const ampm = h >= 12 ? 'p' : 'a';
      hours.push({
        hour: `${displayH}${ampm}`,
        density: todayAnalysis.day_raw[h] || 20,
        isCurrent: h === new Date().getHours()
      });
    }
    return hours;
  }, [patternData]);

  // Monthly data (4 weeks)
  const monthlyData = useMemo(() => {
    if (!weeklyDaysData.length) return [];
    const seed = hashString(patternData?.venue_info?.venue_name || "store");
    const weekAvg = Math.round(weeklyDaysData.reduce((a, b) => a + b.avgBusyness, 0) / weeklyDaysData.length);
    
    return [
      { label: "Week 1", density: Math.max(15, Math.min(95, weekAvg - 12 + (seed % 10))) },
      { label: "Week 2", density: Math.max(15, Math.min(95, weekAvg - 5 + ((seed * 2) % 8))) },
      { label: "Week 3", density: Math.max(15, Math.min(95, weekAvg + 15 - ((seed * 3) % 10))) },
      { label: "Week 4", density: Math.max(15, Math.min(95, weekAvg + 8 - ((seed * 5) % 8))) },
    ];
  }, [weeklyDaysData, patternData]);

  return (
    <div className="mesh-bg min-h-screen pt-20 pb-28 px-4 sm:px-6">
=======
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
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
      <main className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center animate-slide-up">
          <div>
            <h1 className="text-3xl font-extrabold text-[#00342b]">Crowd Patterns</h1>
            <p className="text-sm text-[#3f4945] font-medium">Predictive density and optimal visit windows.</p>
          </div>
        </div>

        {/* Location & Category Search */}
<<<<<<< HEAD
        <section className="glass-card p-4 rounded-2xl animate-slide-up flex flex-col md:flex-row gap-4 border border-white/60 relative z-50 shadow-sm">
=======
        <section className="glass-card p-4 rounded-xl animate-slide-up flex flex-col md:flex-row gap-4 border border-white/60 relative z-50">
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3f4945]">search</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search nearby places (e.g., Target, Starbucks)" 
<<<<<<< HEAD
              className="w-full bg-white/60 border border-white/80 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-[#00342b] placeholder-[#707975] focus:outline-none focus:ring-2 focus:ring-[#00342b]/20"
=======
              className="w-full bg-white/60 border border-white/80 rounded-lg py-2.5 pl-10 pr-4 text-sm font-bold text-[#00342b] placeholder-[#707975] focus:outline-none focus:ring-2 focus:ring-[#00342b]/20"
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="material-symbols-outlined animate-spin text-[#3f4945]">progress_activity</span>
              </div>
            )}
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
<<<<<<< HEAD
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-[#00342b]/10 rounded-xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
=======
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-[#00342b]/10 rounded-lg shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
                {searchResults.map((result) => (
                  <button 
                    key={result.place_id}
                    onClick={() => handleSelectPlace(result)}
<<<<<<< HEAD
                    className="w-full text-left px-4 py-3 hover:bg-[#00342b]/5 border-b border-[#00342b]/5 last:border-0 transition-colors cursor-pointer"
=======
                    className="w-full text-left px-4 py-3 hover:bg-[#00342b]/5 border-b border-[#00342b]/5 last:border-0 transition-colors"
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
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
<<<<<<< HEAD
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${category === cat ? 'bg-[#00342b] text-white shadow-md' : 'bg-white/50 text-[#3f4945] hover:bg-white/80'}`}
=======
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${category === cat ? 'bg-[#00342b] text-white shadow-md' : 'bg-white/50 text-[#3f4945] hover:bg-white/80'}`}
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
              >
                {cat}
              </button>
            ))}
<<<<<<< HEAD
          </div>
        </section>

        {/* 2-3 Nearest Queued Places Cards Section */}
        {queuedPlaces.length > 0 && (
          <section className="animate-slide-up space-y-3">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F44336] text-[20px] animate-pulse">
                  hourglass_top
                </span>
                <h2 className="font-extrabold text-lg text-[#00342b]">Nearest Queued Places</h2>
              </div>
              <span className="text-xs text-[#3f4945] font-semibold">
                Real-time busy spots
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {queuedPlaces.map((place) => {
                const isSelected = selectedPlace?.name === place.name || selectedPlace?.id === place.id;
                
                let statusBg = "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30";
                if (place.crowdLevel === "high") statusBg = "bg-[#F44336]/15 text-[#F44336] border-[#F44336]/30";
                else if (place.crowdLevel === "medium") statusBg = "bg-[#FFC107]/20 text-[#b08d00] border-[#FFC107]/30";

                return (
                  <div
                    key={place.id || place.name}
                    onClick={() => handleSelectAppPlace(place)}
                    className={`glass-card rounded-2xl p-4 cursor-pointer transition-all border flex flex-col justify-between group active:scale-[0.98] ${
                      isSelected 
                        ? "bg-white border-[#00342b] ring-2 ring-[#00342b]/20 shadow-md scale-[1.01]" 
                        : "hover:bg-white/80 border-white/60 shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="font-extrabold text-sm text-[#191c1b] group-hover:text-[#00342b] transition-colors truncate">
                          {place.name}
                        </h3>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border whitespace-nowrap ${statusBg}`}>
                          {place.statusLabel || (place.crowdLevel === "high" ? "Busy" : place.crowdLevel === "medium" ? "Moderate" : "Not Busy")}
                        </span>
                      </div>
                      
                      <p className="text-xs text-[#3f4945] font-semibold flex items-center gap-1 mb-2">
                        <span className="material-symbols-outlined text-[14px] text-[#004d40]">location_on</span>
                        <span className="truncate">{place.address || place.distance || "Nearby"}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/50 flex justify-between items-center mt-2 text-xs">
                      <span className="text-[#3f4945] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-[#004d40]">schedule</span>
                        {place.currentWaitMin > 0 ? `~${place.currentWaitMin}m wait` : "~5m wait"}
                      </span>
                      
                      <span className={`text-[11px] font-extrabold flex items-center gap-0.5 ${isSelected ? 'text-[#00342b]' : 'text-[#707975] group-hover:text-[#00342b]'}`}>
                        {isSelected ? "Analyzing" : "View Trends"}
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {isLoading && (
          <div className="text-center py-20 animate-pulse">
            <span className="material-symbols-outlined text-4xl text-[#00342b] animate-spin mb-4">progress_activity</span>
            <p className="text-sm font-bold text-[#00342b]">Analyzing crowd data...</p>
=======
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
          </div>
        )}

<<<<<<< HEAD
        {patternData && !isLoading && (
          <div className="space-y-6 animate-slide-up">
            {/* Time Selector */}
            <section className="glass-card p-1.5 flex justify-between items-center rounded-xl border border-white/60 shadow-xs">
              {['today', 'week', 'month'].map(t => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`flex-1 py-2 text-center capitalize rounded-lg text-sm font-bold transition-all cursor-pointer ${timeRange === t ? "bg-white/90 text-[#00342b] shadow-sm" : "text-[#3f4945] hover:bg-white/40"}`}
                >
                  {t}
                </button>
              ))}
            </section>

            {/* Crowdsourcing Feedback Widget */}
            <section className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/60 bg-gradient-to-r from-white/40 to-transparent shadow-xs">
=======
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
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
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
<<<<<<< HEAD
                  <button onClick={() => setUserFeedback('quiet')} className="flex-1 sm:flex-none px-4 py-2 bg-white/60 hover:bg-[#4CAF50]/20 text-[#4CAF50] rounded-lg text-xs font-bold transition-colors border border-white/80 cursor-pointer">Quiet</button>
                  <button onClick={() => setUserFeedback('busy')} className="flex-1 sm:flex-none px-4 py-2 bg-white/60 hover:bg-[#F44336]/20 text-[#F44336] rounded-lg text-xs font-bold transition-colors border border-white/80 cursor-pointer">Busy</button>
=======
                  <button onClick={() => setUserFeedback('quiet')} className="flex-1 sm:flex-none px-4 py-2 bg-white/60 hover:bg-[#4CAF50]/20 text-[#4CAF50] rounded-lg text-xs font-bold transition-colors border border-white/80">Quiet</button>
                  <button onClick={() => setUserFeedback('busy')} className="flex-1 sm:flex-none px-4 py-2 bg-white/60 hover:bg-[#F44336]/20 text-[#F44336] rounded-lg text-xs font-bold transition-colors border border-white/80">Busy</button>
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
                </div>
              ) : (
                <div className="text-xs font-bold text-[#4CAF50] bg-[#4CAF50]/10 px-4 py-2 rounded-lg flex items-center gap-1 border border-[#4CAF50]/20">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span> Thanks for your update!
                </div>
              )}
            </section>

<<<<<<< HEAD
            {/* Variable Trends Bar Chart Card */}
            <section className="glass-card rounded-3xl p-6 border border-white/60 relative overflow-hidden shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-extrabold text-[#00342b]">
                      {timeRange === "today" ? "Hourly Density (Today)" : timeRange === "week" ? "Weekly Trends" : "Monthly Overview"}
                    </h2>
                    {patternData.insights.current_status.is_live_spike && (
                      <span className="inline-flex items-center gap-1.5 bg-[#F44336]/10 px-2.5 py-1 rounded-full border border-[#F44336]/20">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F44336] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F44336]"></span>
                        </span>
                        <span className="text-[10px] font-extrabold text-[#F44336] uppercase tracking-wider">Live: Busier than usual</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#3f4945] mt-0.5">
                    Based on live reports and forecasts for <strong>{patternData.venue_info.venue_name}</strong>.
                  </p>
=======
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
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
                </div>

                {/* Theme Legend: LOW MED HIGH */}
                <div className="flex items-center gap-2.5 text-[10px] sm:text-xs font-extrabold text-[#3f4945] uppercase tracking-wider self-start md:self-auto">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]" /> LOW
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFC107]" /> MED
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F44336]" /> HIGH
                  </span>
                </div>
              </div>

              {/* Chart Area */}
<<<<<<< HEAD
              <div className="relative h-48 w-full flex items-end justify-between gap-1.5 sm:gap-2.5 mt-8 border-b border-white/40 pb-2 pt-6 px-1">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 z-0">
=======
              <div className="relative h-48 w-full flex items-end justify-between gap-2 mt-8 border-b border-white/30 pb-2">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
                  <div className="border-t border-[#707975] w-full" />
                  <div className="border-t border-[#707975] w-full" />
                  <div className="border-t border-[#707975] w-full" />
                </div>

<<<<<<< HEAD
                {/* WEEK VIEW (Mon - Sun Variable Trends) */}
                {timeRange === "week" && weeklyDaysData.map((dayData, idx) => {
                  const avgBusyness = dayData.avgBusyness;
                  const height = `${Math.max(12, Math.min(100, avgBusyness))}%`;
                  const isCurrent = new Date().getDay() === dayData.day_info.day_int;
                  const isPeakLow = avgBusyness === minWeeklyBusyness;
                  
                  let levelLabel = "Not Busy";
                  let barColor = "bg-[#4CAF50]";
                  let trackBg = "bg-[#4CAF50]/15";
                  
                  if (avgBusyness > 60) {
                    levelLabel = "Busy";
                    barColor = "bg-[#F44336]";
                    trackBg = "bg-[#F44336]/15";
                  } else if (avgBusyness > 35) {
                    levelLabel = "Moderate";
                    barColor = "bg-[#FFC107]";
                    trackBg = "bg-[#FFC107]/20";
=======
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
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
                  }

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 z-10 group h-full justify-end relative">
<<<<<<< HEAD
                      {/* Floating Peak Low Badge */}
                      {isPeakLow && (
                        <div className="absolute -top-7 text-[9px] font-extrabold text-[#006e1c] bg-[#e8f5e9] px-2 py-0.5 rounded-full border border-[#a5d6a7] shadow-xs whitespace-nowrap z-10">
                          Peak Low
                        </div>
                      )}

                      {isCurrent && patternData.insights.current_status.is_live_spike && !isPeakLow && (
                        <div className="absolute -top-7 bg-white/90 text-[#F44336] text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs border border-[#F44336]/20 whitespace-nowrap z-10">
                          Spike
                        </div>
                      )}

                      <div className={`w-full ${trackBg} rounded-t-md relative overflow-hidden h-full flex items-end cursor-pointer`}>
                        <div
                          className={`w-full ${barColor} rounded-t-md transition-all duration-700 group-hover:brightness-110`}
                          style={{ height }}
                        />
                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#00342b] text-white text-[10px] py-1 px-2.5 rounded font-bold pointer-events-none whitespace-nowrap z-20 shadow-md">
                          {dayData.day_info.day_text}: {avgBusyness}% ({levelLabel})
                        </div>
                      </div>
                      <span className={`text-xs font-bold ${isCurrent ? "text-[#00342b] font-extrabold underline underline-offset-2" : "text-[#3f4945]"}`}>
=======
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
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
                        {dayData.day_info.day_text.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
<<<<<<< HEAD

                {/* TODAY VIEW (15 Hourly Bars 8a to 10p) */}
                {timeRange === "today" && todayHourlyData.map((hData, idx) => {
                  const density = hData.density;
                  const height = `${Math.max(12, Math.min(100, density))}%`;
                  
                  let barColor = "bg-[#4CAF50]";
                  let trackBg = "bg-[#4CAF50]/15";
                  if (density > 60) {
                    barColor = "bg-[#F44336]";
                    trackBg = "bg-[#F44336]/15";
                  } else if (density > 35) {
                    barColor = "bg-[#FFC107]";
                    trackBg = "bg-[#FFC107]/20";
                  }

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 z-10 group h-full justify-end relative">
                      {hData.isCurrent && (
                        <div className="absolute -top-7 text-[9px] font-extrabold text-[#00342b] bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-300 shadow-xs whitespace-nowrap z-10">
                          Now
                        </div>
                      )}
                      <div className={`w-full ${trackBg} rounded-t-md relative overflow-hidden h-full flex items-end cursor-pointer`}>
                        <div
                          className={`w-full ${barColor} rounded-t-md transition-all duration-700 group-hover:brightness-110`}
                          style={{ height }}
                        />
                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#00342b] text-white text-[10px] py-1 px-2 rounded font-bold pointer-events-none whitespace-nowrap z-20 shadow-md">
                          {hData.hour}: {density}% density
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold ${hData.isCurrent ? "text-[#00342b] font-extrabold" : "text-[#3f4945]"}`}>
                        {hData.hour}
                      </span>
                    </div>
                  );
                })}

                {/* MONTH VIEW (4 Weekly Blocks W1 - W4) */}
                {timeRange === "month" && monthlyData.map((mWeek, idx) => {
                  const density = mWeek.density;
                  const height = `${Math.max(15, Math.min(100, density))}%`;
                  
                  let barColor = "bg-[#4CAF50]";
                  let trackBg = "bg-[#4CAF50]/15";
                  if (density > 60) {
                    barColor = "bg-[#F44336]";
                    trackBg = "bg-[#F44336]/15";
                  } else if (density > 35) {
                    barColor = "bg-[#FFC107]";
                    trackBg = "bg-[#FFC107]/20";
                  }

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 z-10 group h-full justify-end relative px-2">
                      <div className={`w-full ${trackBg} rounded-t-md relative overflow-hidden h-full flex items-end cursor-pointer`}>
                        <div
                          className={`w-full ${barColor} rounded-t-md transition-all duration-700 group-hover:brightness-110`}
                          style={{ height }}
                        />
                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#00342b] text-white text-[10px] py-1 px-2.5 rounded font-bold pointer-events-none whitespace-nowrap z-20 shadow-md">
                          {mWeek.label}: ~{density}% avg density
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#3f4945]">
                        {mWeek.label}
                      </span>
                    </div>
                  );
                })}
=======
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
              </div>
            </section>

            {/* Forecast & Planning Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Next 4 Hours Forecast */}
<<<<<<< HEAD
              <section className="glass-card rounded-2xl p-6 shadow-xs">
=======
              <section className="glass-card rounded-2xl p-6">
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
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
<<<<<<< HEAD
=======
                  {/* Generate 4 hour slots starting from current hour */}
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
                  {[0, 1, 2, 3].map(offset => {
                    const h = (new Date().getHours() + offset) % 24;
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    const displayH = h % 12 || 12;
                    const currentDayData = patternData.analysis.find(a => a.day_info.day_int === new Date().getDay());
<<<<<<< HEAD
                    const busyness = currentDayData ? currentDayData.day_raw[h] : 30;
=======
                    const busyness = currentDayData.day_raw[h];
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
                    
                    let status = "Quiet";
                    let color = "text-[#4CAF50]";
                    let icon = "person";
                    let est = "0-5 min";
                    
                    if (busyness > 60) {
                      status = "Busy"; color = "text-[#F44336]"; icon = "groups"; est = "20-30+ min";
<<<<<<< HEAD
                    } else if (busyness > 35) {
=======
                    } else if (busyness > 30) {
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
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
<<<<<<< HEAD
              <section className="glass-card rounded-2xl p-6 shadow-xs">
                <h3 className="font-bold text-base text-[#00342b] mb-4">Planning Insights</h3>

                <div className="bg-white/60 border border-[#00342b]/20 rounded-xl p-4 mb-3.5 shadow-xs relative overflow-hidden">
=======
              <section className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-base text-[#00342b] mb-4">Planning Insights</h3>

                <div className="bg-white/60 border border-[#00342b]/20 rounded-xl p-4 mb-3.5 shadow-sm relative overflow-hidden">
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
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
<<<<<<< HEAD
                      <p className="text-xs text-[#3f4945] mt-1 font-medium">
=======
                      <p className="text-xs text-[#3f4945] mt-1">
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
                        {patternData.insights.best_time_to_go.reason}
                      </p>
                    </div>
                  </div>
                </div>

<<<<<<< HEAD
                <div className="bg-white/50 border border-white/60 rounded-xl p-4 shadow-xs">
=======
                <div className="bg-white/50 border border-white/60 rounded-xl p-4 shadow-sm">
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
                  <div className="flex items-start gap-3">
                    <div className="bg-[#F44336]/20 p-2 rounded-full text-[#F44336] mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#3f4945] uppercase tracking-wider">
                        Recent User Reports
                      </p>
                      <p className="text-sm font-bold text-[#191c1b]">"Line is wrapping around the aisle!"</p>
<<<<<<< HEAD
                      <p className="text-[10px] text-[#707975] mt-1 font-medium">
=======
                      <p className="text-[10px] text-[#707975] mt-1">
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
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

<<<<<<< HEAD

=======
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
