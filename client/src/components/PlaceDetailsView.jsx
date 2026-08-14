import { useState } from "react";
export const PlaceDetailsView = ({
  place,
  allPlaces,
  onBack,
  onSelectPlace,
  onOpenReportModal
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2e3);
  };
  const alternativePlace = place.smartAlternative ? allPlaces.find((p) => p.name.includes("Green") || p.id === place.smartAlternative?.id) : null;
  return <div className="mesh-bg min-h-screen pt-20 pb-28 px-5">
      <div className="max-w-3xl mx-auto space-y-6">
        {
    /* Top App Bar inside Details */
  }
        <div className="flex items-center justify-between py-2">
          <button
    onClick={onBack}
    className="flex items-center gap-1.5 text-[#3f4945] hover:bg-black/5 hover:text-[#191c1b] p-2 rounded-full transition-all active:scale-95"
  >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            <span className="font-bold text-sm hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
    onClick={() => setIsFavorite(!isFavorite)}
    className={`p-2 rounded-full transition-all active:scale-90 ${isFavorite ? "bg-[#ba1a1a]/10 text-[#ba1a1a]" : "text-[#3f4945] hover:bg-black/5"}`}
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
    className="relative text-[#3f4945] hover:bg-black/5 p-2 rounded-full transition-all active:scale-90"
    title="Share Place"
  >
              <span className="material-symbols-outlined text-[22px]">share</span>
              {copiedShare && <span className="absolute -bottom-7 right-0 text-[10px] font-bold bg-[#00342b] text-white px-2 py-0.5 rounded shadow">
                  Copied!
                </span>}
            </button>
          </div>
        </div>

        {
    /* Header Card: Hero Image & Core Info */
  }
        <div className="glass-card rounded-2xl overflow-hidden relative animate-slide-up">
          <div
    className="bg-cover bg-center w-full h-52 sm:h-64 relative"
    style={{ backgroundImage: `url('${place.image}')` }}
  >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                  {place.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 text-white drop-shadow">
                  {place.name}
                </h1>
              </div>

              {
    /* Wait Status Pill */
  }
              <div
    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md text-sm font-bold shadow-md ${place.crowdLevel === "high" ? "bg-[#F44336]/20 border-[#F44336] text-white" : place.crowdLevel === "medium" ? "bg-[#FFC107]/30 border-[#FFC107] text-white" : "bg-[#4CAF50]/30 border-[#4CAF50] text-white"}`}
  >
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span>{place.statusLabel}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-sm text-[#3f4945] mb-4 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[18px] text-[#00342b]">
                location_on
              </span>
              {place.address ? `${place.address} \u2022 ` : ""}
              {place.distance} away
            </p>

            {
    /* High Confidence Verified Badge */
  }
            <div className="glass-panel-inner rounded-xl p-4 flex items-start gap-3">
              <span
    className="material-symbols-outlined text-[#00342b] text-[24px] mt-0.5"
    style={{ fontVariationSettings: "'FILL' 1" }}
  >
                verified_user
              </span>
              <div>
                <div className="text-base font-bold text-[#00342b]">
                  {place.confidence || 82}% High Confidence
                </div>
                <div className="text-xs text-[#3f4945] mt-0.5">
                  Based on {place.reportsCount || 14} real-time user reports.
                  <br />
                  <span className="font-semibold text-[#00342b]">
                    Updated: {place.updatedAt ? (
                      (() => {
                        const diff = Math.floor((Date.now() - place.updatedAt) / 60000);
                        if (diff < 1) return "Just now";
                        return `${diff} minutes ago`;
                      })()
                    ) : "12 minutes ago"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {
    /* Crowd Patterns: Hourly Bar Chart */
  }
        <div className="glass-card rounded-2xl p-6 animate-slide-up delay-100">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-xl font-bold text-[#00342b]">Crowd by Hour</h2>
              <p className="text-sm text-[#3f4945] mt-0.5">
                Best Time:{" "}
                <span className="font-bold text-[#4CAF50]">{place.bestHours || "3 PM - 4 PM"}</span>
              </p>
            </div>
            <div className="flex gap-2 text-[10px] font-bold text-[#3f4945] uppercase">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#4CAF50]" /> Low
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FFC107]" /> Med
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F44336]" /> High
              </span>
            </div>
          </div>

          {
    /* Interactive Bar Chart */
  }
          <div className="flex items-end h-36 gap-1.5 sm:gap-2 mt-6 border-b border-white/40 pb-2 px-1 relative">
            {place.hourlyCrowd.map((item, idx) => {
    let barColor = "bg-[#4CAF50]";
    let barBg = "bg-[#4CAF50]/20";
    if (item.level === "high") {
      barColor = "bg-[#F44336]";
      barBg = "bg-[#F44336]/20";
    } else if (item.level === "medium") {
      barColor = "bg-[#FFC107]";
      barBg = "bg-[#FFC107]/20";
    }
    return <div
      key={idx}
      className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
    >
                  {
      /* Tooltip on hover */
    }
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-[#00342b] text-white text-[10px] font-bold px-2 py-0.5 rounded pointer-events-none z-20 whitespace-nowrap shadow">
                    {item.hour}: {item.densityPercent}%
                  </div>

                  {item.isPeakLow && <div className="absolute -top-6 text-[9px] font-extrabold text-[#4CAF50] bg-[#4CAF50]/15 px-1.5 py-0.5 rounded-full border border-[#4CAF50]/30 whitespace-nowrap">
                      Peak Low
                    </div>}

                  <div className={`w-full ${barBg} rounded-t-md relative overflow-hidden flex items-end h-full`}>
                    <div
      className={`w-full ${barColor} rounded-t-md transition-all duration-700 group-hover:brightness-110`}
      style={{ height: `${item.densityPercent}%` }}
    />
                  </div>
                  <span className="text-[10px] text-[#3f4945] font-semibold mt-1">
                    {item.hour.replace(" AM", "a").replace(" PM", "p")}
                  </span>
                </div>;
  })}
          </div>
        </div>

        {
    /* Smart Alternative Comparison Card */
  }
        {place.smartAlternative && <div className="glass-card rounded-2xl p-6 animate-slide-up delay-200">
            <h2 className="text-xl font-bold text-[#00342b] mb-4">Better Option Nearby</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {
    /* Current Option */
  }
              <div className="glass-panel-inner rounded-xl p-4 opacity-80 cursor-default">
                <div className="text-[11px] font-bold text-[#707975] uppercase tracking-wider mb-1">
                  Current Choice
                </div>
                <div className="text-base font-bold text-[#191c1b]">{place.name}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="material-symbols-outlined text-[#FFC107] text-[18px]">
                    hourglass_empty
                  </span>
                  <span className="text-xs text-[#3f4945] font-medium">
                    ~{place.currentWaitMin > 0 ? place.currentWaitMin : 15}m expected wait
                  </span>
                </div>
              </div>

              {
    /* Recommended Option */
  }
              <div
    onClick={() => {
      if (alternativePlace) onSelectPlace(alternativePlace);
    }}
    className="glass-panel-inner rounded-xl p-4 border border-[#4CAF50]/30 bg-[#4CAF50]/5 hover:border-[#4CAF50]/60 hover:shadow-md cursor-pointer transition-all group"
  >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] font-bold text-[#4CAF50] uppercase tracking-wider">
                    Recommended
                  </span>
                  <span className="bg-[#4CAF50] text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm group-hover:scale-105 transition-transform">
                    Faster
                  </span>
                </div>
                <div className="text-base font-bold text-[#00342b] group-hover:text-[#4CAF50] transition-colors">
                  {place.smartAlternative.name}
                </div>
                <div className="text-xs text-[#3f4945] mb-2">
                  {place.smartAlternative.distance}
                </div>
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/40">
                  <span className="material-symbols-outlined text-[#4CAF50] text-[18px]">
                    bolt
                  </span>
                  <span className="text-xs font-bold text-[#4CAF50]">
                    {place.smartAlternative.expectedWait}
                  </span>
                </div>
              </div>
            </div>
          </div>}

        {
    /* Primary CTA Area */
  }
        <div className="pt-4 flex flex-col items-center">
          <button
    onClick={() => onOpenReportModal(place.id)}
    className="w-full sm:w-auto sm:min-w-[320px] bg-[#004d40] text-white hover:bg-[#00342b] rounded-full py-3.5 px-8 font-bold text-base shadow-[0_0_20px_rgba(0,77,64,0.3)] hover:shadow-[0_0_25px_rgba(0,77,64,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2"
  >
            <span className="material-symbols-outlined text-[22px]">add_location_alt</span>
            Report Current Crowd
          </button>
          <div className="mt-3 text-xs text-[#3f4945] font-medium flex items-center gap-1">
            <span
    className="material-symbols-outlined text-[#006e1c] text-[16px] animate-pulse"
    style={{ fontVariationSettings: "'FILL' 1" }}
  >
              stars
            </span>
            <span className="text-[#006e1c] font-bold">+10 Points</span> for reporting right now
          </div>
        </div>
      </div>
    </div>;
};
