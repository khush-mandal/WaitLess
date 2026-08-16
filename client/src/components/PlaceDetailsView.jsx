import { useState } from "react";
import { recommendBestTime } from "../utils/bestTimeRecommendation";

// Default 15-hour crowd data matching the UI/UX screenshot (8a to 10p)
const DEFAULT_HOURLY_CROWD = [
  { hour: "8 AM", label: "8a", densityPercent: 20, level: "low" },
  { hour: "9 AM", label: "9a", densityPercent: 35, level: "low" },
  { hour: "10 AM", label: "10a", densityPercent: 55, level: "medium" },
  { hour: "11 AM", label: "11a", densityPercent: 85, level: "high" },
  { hour: "12 PM", label: "12p", densityPercent: 95, level: "high" },
  { hour: "1 PM", label: "1p", densityPercent: 75, level: "medium" },
  { hour: "2 PM", label: "2p", densityPercent: 65, level: "medium" },
  { hour: "3 PM", label: "3p", densityPercent: 15, level: "low", isPeakLow: true },
  { hour: "4 PM", label: "4p", densityPercent: 25, level: "low" },
  { hour: "5 PM", label: "5p", densityPercent: 50, level: "medium" },
  { hour: "6 PM", label: "6p", densityPercent: 85, level: "high" },
  { hour: "7 PM", label: "7p", densityPercent: 80, level: "high" },
  { hour: "8 PM", label: "8p", densityPercent: 45, level: "medium" },
  { hour: "9 PM", label: "9p", densityPercent: 30, level: "low" },
  { hour: "10 PM", label: "10p", densityPercent: 15, level: "low" }
];

export const PlaceDetailsView = ({
  place,
  allPlaces = [],
  onBack,
  onSelectPlace,
  onOpenReportModal
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // Ensure hourly crowd has complete 15-hour data
  const hourlyData = (place.hourlyCrowd && place.hourlyCrowd.length >= 8) 
    ? place.hourlyCrowd.map(item => ({
        ...item,
        label: item.label || item.hour.toLowerCase().replace(" am", "a").replace(" pm", "p").replace(" ", "")
      }))
    : DEFAULT_HOURLY_CROWD;

  // Identify lowest density hour for Peak Low badge
  const minDensity = Math.min(...hourlyData.map(h => h.densityPercent));
  let peakLowMarked = false;
  const hourlyCrowdWithPeak = hourlyData.map(item => {
    const isMin = item.densityPercent === minDensity;
    const isPeakLow = item.isPeakLow || (isMin && !peakLowMarked);
    if (isPeakLow) peakLowMarked = true;
    return {
      ...item,
      isPeakLow
    };
  });

  const bestTimeRec = recommendBestTime(hourlyCrowdWithPeak);
  
  // Format best time display string (e.g. "3 PM - 4 PM")
  const bestTimeDisplay = bestTimeRec.recommendedTime !== "Unknown" ? bestTimeRec.recommendedTime : "3 PM - 4 PM";

  // Category & Sector tag (e.g. "GROCERY STORE • RETAIL")
  const categoryUpper = (place.category || "STORE").toUpperCase();
  const sectorUpper = (place.sector || "RETAIL").toUpperCase();
  const categoryTag = categoryUpper.includes("•") ? categoryUpper : `${categoryUpper} • ${sectorUpper}`;

  // Smart Alternative lookup or fallback
  const alternativePlace = place.smartAlternative 
    ? (allPlaces.find(p => p.id === place.smartAlternative.id || p.name.includes(place.smartAlternative.name)) || {
        name: place.smartAlternative.name || "Green Grocers",
        distance: place.smartAlternative.distance || "0.2 mi away",
        expectedWait: place.smartAlternative.expectedWait || "~5m expected wait"
      })
    : (allPlaces.find(p => p.id !== place.id && (p.sector === place.sector || p.name.includes("Green"))) || {
        name: "Green Grocers",
        distance: "0.2 mi away",
        expectedWait: "~5m expected wait"
      });

  const currentWaitDisplay = place.currentWaitMin > 0 ? `~${place.currentWaitMin}m wait` : "~5m wait";

  return (
    <div className="mesh-bg min-h-screen pt-20 pb-28 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top App Bar Navigation */}
        <div className="flex items-center justify-between py-1">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[#3f4945] hover:bg-black/5 hover:text-[#191c1b] px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer font-bold text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-full transition-all active:scale-90 cursor-pointer ${
                isFavorite ? "bg-[#ba1a1a]/10 text-[#ba1a1a]" : "text-[#3f4945] hover:bg-black/5"
              }`}
              title="Favorite Place"
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                favorite
              </span>
            </button>

            <button
              onClick={handleShare}
              className="relative text-[#3f4945] hover:bg-black/5 p-2 rounded-full transition-all active:scale-90 cursor-pointer"
              title="Share Place"
            >
              <span className="material-symbols-outlined text-[22px]">share</span>
              {copiedShare && (
                <span className="absolute -bottom-7 right-0 text-[10px] font-bold bg-[#00342b] text-white px-2 py-0.5 rounded shadow z-30">
                  Copied!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Hero Card: Image & Place Header */}
        <div className="glass-card rounded-3xl overflow-hidden shadow-sm border border-white/60 bg-white/70 backdrop-blur-md animate-slide-up">
          <div
            className="bg-cover bg-center w-full h-64 sm:h-72 relative"
            style={{ backgroundImage: `url('${place.image || "https://picsum.photos/seed/store/800/600"}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            
            <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end text-white">
              <div>
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 inline-block mb-1.5 shadow-sm">
                  {categoryTag}
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-md tracking-tight leading-tight">
                  {place.name}
                </h1>
              </div>

              {/* Wait Status Pill on Image */}
              <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1.5 flex items-center gap-1.5 text-white font-bold text-xs sm:text-sm shadow-md whitespace-nowrap">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">schedule</span>
                <span>{currentWaitDisplay}</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Address & Distance */}
            <p className="text-xs sm:text-sm text-[#3f4945] flex items-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-[18px] text-[#004d40]">
                location_on
              </span>
              <span>
                {place.address ? `${place.address} • ` : "88 Grand Avenue • "}
                {place.distance || "1.2 mi away"}
              </span>
            </p>

            {/* High Confidence Badge */}
            <div className="glass-panel-inner rounded-2xl p-4 flex items-start gap-3.5 bg-[#004d40]/5 border border-[#004d40]/10">
              <span
                className="material-symbols-outlined text-[#004d40] text-[24px] mt-0.5 flex-shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <div>
                <div className="text-base font-extrabold text-[#00342b]">
                  {place.confidence || 88}% Prediction Confidence
                </div>
                <div className="text-xs text-[#3f4945] font-medium mt-0.5 leading-relaxed">
                  Calculated by fusing Google/OSM APIs, live user reports, AI web sentiment & seeded demo patterns.
                </div>
              </div>
            </div>

            {/* 🌐 Multi-Source Data Fusion Breakdown */}
            <div className="bg-white/80 rounded-2xl p-4 border border-emerald-900/10 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#00342b] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">hub</span>
                Multi-Source Crowd Intelligence Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="font-bold text-[#00342b] flex items-center gap-1">
                    <span>🔗 External APIs</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 font-semibold mt-1">
                    Google / OSM Baseline ({place.sourcesBreakdown?.externalApiBaseline?.weight || '30%'})
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="font-bold text-blue-900 flex items-center gap-1">
                    <span>👥 User Reports</span>
                  </div>
                  <div className="text-[11px] text-blue-800 font-semibold mt-1">
                    {place.reportsCount || 12} live reports ({place.sourcesBreakdown?.userReports?.weight || '40%'})
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                  <div className="font-bold text-purple-900 flex items-center gap-1">
                    <span>🤖 AI Review Agent</span>
                  </div>
                  <div className="text-[11px] text-purple-800 font-semibold mt-1">
                    Web Scraper NLP ({place.sourcesBreakdown?.aiWebScraper?.weight || '15%'})
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="font-bold text-amber-900 flex items-center gap-1">
                    <span>📊 Seeded Demo Data</span>
                  </div>
                  <div className="text-[11px] text-amber-800 font-semibold mt-1">
                    Hackathon Patterns ({place.sourcesBreakdown?.seededHackathonData?.weight || '15%'})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Crowd by Hour Card */}
        <div className="glass-card rounded-3xl p-6 shadow-sm border border-white/60 bg-white/70 backdrop-blur-md animate-slide-up delay-100">
          <div className="flex flex-row justify-between items-start mb-6 gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-[#00342b]">Crowd by Hour</h2>
              <p className="text-xs sm:text-sm font-semibold text-[#3f4945] mt-1">
                Best Time: <span className="font-extrabold text-[#006e1c]">{bestTimeDisplay}</span>
              </p>
            </div>

            {/* Legend: LOW MED HIGH */}
            <div className="flex items-center gap-2.5 text-[10px] sm:text-xs font-extrabold text-[#3f4945] uppercase tracking-wider">
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

          {/* Interactive Bar Chart */}
          <div className="flex items-end h-40 gap-1 sm:gap-2 pt-8 pb-1 px-1 relative">
            {hourlyCrowdWithPeak.map((item, idx) => {
              let barFill = "bg-[#4CAF50]";
              let trackBg = "bg-[#4CAF50]/15";
              if (item.level === "high") {
                barFill = "bg-[#F44336]";
                trackBg = "bg-[#F44336]/15";
              } else if (item.level === "medium") {
                barFill = "bg-[#FFC107]";
                trackBg = "bg-[#FFC107]/15";
              }

              const isPeak = item.isPeakLow;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                >
                  {/* Floating Peak Low Badge */}
                  {isPeak && (
                    <div className="absolute -top-7 text-[9px] font-extrabold text-[#006e1c] bg-[#e8f5e9] px-2 py-0.5 rounded-full border border-[#a5d6a7] shadow-xs whitespace-nowrap z-10">
                      Peak Low
                    </div>
                  )}

                  {/* Tooltip on Hover */}
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-[#00342b] text-white text-[10px] font-bold px-2 py-0.5 rounded pointer-events-none z-20 whitespace-nowrap shadow">
                    {item.hour}: {item.densityPercent}% crowd
                  </div>

                  {/* Bar Track & Fill */}
                  <div className={`w-full ${trackBg} rounded-t-md relative overflow-hidden flex items-end h-full`}>
                    <div
                      className={`w-full ${barFill} rounded-t-md transition-all duration-500 group-hover:brightness-110`}
                      style={{ height: `${Math.max(item.densityPercent, 12)}%` }}
                    />
                  </div>

                  {/* Hour Label */}
                  <span className="text-[10px] sm:text-xs text-[#3f4945] font-bold mt-2 text-center">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Better Option Nearby Comparison Card */}
        <div className="glass-card rounded-3xl p-6 shadow-sm border border-white/60 bg-white/70 backdrop-blur-md animate-slide-up delay-200">
          <h2 className="text-xl font-extrabold text-[#00342b] mb-4">Better Option Nearby</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Choice */}
            <div className="glass-panel-inner rounded-2xl p-5 border border-slate-200/80 bg-white/60">
              <div className="text-[11px] font-extrabold text-[#707975] uppercase tracking-wider mb-1">
                CURRENT CHOICE
              </div>
              <div className="text-base sm:text-lg font-extrabold text-[#191c1b]">
                {place.name}
              </div>
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className="material-symbols-outlined text-[#FFC107] text-[18px]">
                  hourglass_empty
                </span>
                <span className="text-xs text-[#3f4945] font-medium">
                  {currentWaitDisplay} expected wait
                </span>
              </div>
            </div>

            {/* Recommended Option */}
            <div
              onClick={() => {
                if (alternativePlace && alternativePlace.id) {
                  const target = allPlaces.find(p => p.id === alternativePlace.id);
                  if (target) onSelectPlace(target);
                }
              }}
              className="glass-panel-inner rounded-2xl p-5 border border-emerald-300/80 bg-emerald-50/40 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-extrabold text-[#006e1c] uppercase tracking-wider">
                  RECOMMENDED
                </span>
                <span className="bg-[#2e7d32] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md shadow-xs group-hover:scale-105 transition-transform">
                  Faster
                </span>
              </div>
              <div className="text-base sm:text-lg font-extrabold text-[#00342b] group-hover:text-[#006e1c] transition-colors mt-0.5">
                {alternativePlace.name}
              </div>
              <div className="text-xs text-[#3f4945] font-medium mt-0.5 mb-3">
                {alternativePlace.distance || "0.2 mi away"}
              </div>
              <div className="flex items-center gap-1.5 pt-2 border-t border-emerald-200/60">
                <span className="material-symbols-outlined text-[#006e1c] text-[18px]">
                  bolt
                </span>
                <span className="text-xs font-bold text-[#006e1c]">
                  {alternativePlace.expectedWait || "~5m expected wait"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary CTA Area: Report Current Crowd */}
        <div className="pt-4 flex flex-col items-center pb-6">
          <button
            onClick={() => onOpenReportModal(place.id)}
            className="w-full sm:w-auto min-w-[280px] sm:min-w-[340px] bg-[#00342b] hover:bg-[#00201a] text-white font-extrabold text-base py-3.5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-[#004d40] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">add_location_alt</span>
            Report Current Crowd
          </button>
          
          <div className="mt-3 text-xs text-[#3f4945] font-medium flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-[#006e1c] text-[18px] animate-pulse"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              stars
            </span>
            <span>
              <strong className="text-[#006e1c] font-extrabold">+10 Points</strong> for reporting right now
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

