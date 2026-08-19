import { useState } from "react";
export const ReportModal = ({
  isOpen,
  onClose,
  places,
  preselectedPlaceId,
  onSubmitReport
}) => {
  const [selectedPlaceId, setSelectedPlaceId] = useState(
    preselectedPlaceId || places[0]?.id || "place-1"
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(10);
  if (!isOpen) return null;
  const currentPlace = places.find((p) => p.id === selectedPlaceId) || places[0];
  const handleSelectLevel = (level) => {
    onSubmitReport(currentPlace.id, level);
    setEarnedPoints(10);
    setShowSuccessModal(true);
  };
  const handleDone = () => {
    setShowSuccessModal(false);
    onClose();
  };
  return <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      {
    /* Main Selection Card */
  }
      {!showSuccessModal ? <div className="glass-card w-full max-w-md rounded-2xl p-6 relative shadow-2xl animate-slide-up border border-white/60">
          {
    /* Header */
  }
          <div className="flex items-center justify-between pb-4 border-b border-white/40">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="WaitLess Logo" className="w-8 h-8 rounded-md" />
              <h2 className="font-extrabold text-[#00342b] text-xl">WaitLess</h2>
            </div>
            <button
    onClick={onClose}
    className="text-[#3f4945] hover:text-[#191c1b] p-1.5 rounded-full hover:bg-black/5 active:scale-90 transition-all"
  >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          {
    /* Place Dropdown / Selector */
  }
          <div className="mt-4 mb-6">
            <label className="block text-xs font-bold text-[#707975] uppercase tracking-wider mb-1.5">
              Reporting for Location
            </label>
            <select
    value={selectedPlaceId}
    onChange={(e) => setSelectedPlaceId(e.target.value)}
    className="w-full bg-white/70 border border-white/50 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#00342b] focus:outline-none focus:ring-2 focus:ring-[#00342b] shadow-sm"
  >
              {places.map((p) => <option key={p.id} value={p.id}>
                  {p.name} ({p.category.split("\u2022")[0].trim()})
                </option>)}
            </select>
          </div>

          {
    /* Prompt Header */
  }
          <div className="text-center mb-6 space-y-1">
            <h3 className="text-2xl font-extrabold text-[#191c1b]">How's the crowd?</h3>
            <p className="text-sm text-[#3f4945] font-medium">
              Your real-time report helps thousands plan better.
            </p>
          </div>

          {
    /* Crowd Level Selection Buttons */
  }
          <div className="space-y-3.5">
            {
    /* Low Option */
  }
            <button
    onClick={() => handleSelectLevel("low")}
    className="w-full h-20 rounded-xl flex items-center px-5 gap-5 transition-all bg-[#4CAF50]/15 hover:bg-[#4CAF50]/25 border border-white/60 shadow-sm active:scale-95 text-left group"
  >
              <div className="w-12 h-12 rounded-full bg-[#4CAF50]/20 flex items-center justify-center border border-[#4CAF50]/30 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[#4CAF50] text-[28px]">person</span>
              </div>
              <div>
                <span className="block font-extrabold text-lg text-[#4CAF50]">Low</span>
                <span className="block text-xs font-medium text-[#4CAF50]/80">0–5 min wait</span>
              </div>
            </button>

            {
    /* Medium Option */
  }
            <button
    onClick={() => handleSelectLevel("medium")}
    className="w-full h-20 rounded-xl flex items-center px-5 gap-5 transition-all bg-[#FFC107]/15 hover:bg-[#FFC107]/25 border border-white/60 shadow-sm active:scale-95 text-left group"
  >
              <div className="w-12 h-12 rounded-full bg-[#FFC107]/20 flex items-center justify-center border border-[#FFC107]/30 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[#d49900] text-[28px]">group</span>
              </div>
              <div>
                <span className="block font-extrabold text-lg text-[#b08d00]">Medium</span>
                <span className="block text-xs font-medium text-[#b08d00]/80">5–15 min</span>
              </div>
            </button>

            {
    /* High Option */
  }
            <button
    onClick={() => handleSelectLevel("high")}
    className="w-full h-20 rounded-xl flex items-center px-5 gap-5 transition-all bg-[#F44336]/15 hover:bg-[#F44336]/25 border border-white/60 shadow-sm active:scale-95 text-left group"
  >
              <div className="w-12 h-12 rounded-full bg-[#F44336]/20 flex items-center justify-center border border-[#F44336]/30 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[#F44336] text-[28px]">groups</span>
              </div>
              <div>
                <span className="block font-extrabold text-lg text-[#F44336]">High</span>
                <span className="block text-xs font-medium text-[#F44336]/80">15+ min</span>
              </div>
            </button>
          </div>
        </div> : (
    /* Gamified Success Modal Overlay */
    <div className="glass-card w-full max-w-sm rounded-2xl p-6 flex flex-col items-center text-center shadow-2xl relative animate-slide-up border border-white/60">
          {
      /* Confetti Sparkles */
    }
          <div className="absolute -top-4 -right-4 text-3xl animate-bounce">✨</div>
          <div className="absolute -bottom-3 -left-3 text-3xl animate-pulse">🌟</div>

          <div className="w-16 h-16 rounded-full bg-[#004d40]/10 flex items-center justify-center mb-4 border border-[#004d40]/20">
            <span
      className="material-symbols-outlined text-[#004d40] text-[40px]"
      style={{ fontVariationSettings: "'FILL' 1" }}
    >
              check_circle
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-[#191c1b] mb-1">
            Thanks for contributing!
          </h3>
          <p className="text-xs text-[#3f4945] mb-4">
            Report recorded for <span className="font-bold text-[#00342b]">{currentPlace.name}</span>
          </p>

          <div className="bg-[#00342b]/5 border border-[#00342b]/20 rounded-xl px-4 py-2 mb-6 inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00342b] text-[20px]">
              local_activity
            </span>
            <span className="font-extrabold text-lg text-[#00342b]">
              +{earnedPoints} Points
            </span>
          </div>

          {
      /* Progress to Badge */
    }
          <div className="flex flex-col items-center space-y-2 w-full">
            <div className="progress-circle">
              <div className="progress-circle-inner text-xs font-extrabold text-[#00342b]">
                75%
              </div>
            </div>
            <p className="text-xs text-[#3f4945]">
              towards <span className="font-bold text-[#00342b]">Local Guide</span> badge
            </p>
          </div>

          <button
      onClick={handleDone}
      className="mt-6 w-full py-3 bg-[#004d40] text-white font-bold text-sm rounded-xl hover:bg-[#00342b] transition-all active:scale-95 shadow-lg"
    >
            Done
          </button>
        </div>
  )}
    </div>;
};
