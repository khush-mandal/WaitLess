export const BottomNav = ({
  activeTab,
  setActiveTab,
  setIsMapView
}) => {
  return <nav className="fixed bottom-4 left-4 right-4 z-50 flex justify-around items-center p-1.5 bg-white/30 dark:bg-[#191c1b]/30 backdrop-blur-2xl rounded-full border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] md:hidden">
      {
    /* Explore Tab */
  }
      <button
    onClick={() => {
      setActiveTab("explore");
    }}
    className={`flex flex-col items-center justify-center w-full max-w-[76px] py-1.5 rounded-full transition-all duration-300 active:scale-95 ${activeTab === "explore" ? "bg-white/90 text-[#00342b] shadow-sm border border-white/60 font-bold" : "text-[#3f4945] hover:text-[#00342b] hover:bg-white/50"}`}
  >
        <span
    className="material-symbols-outlined text-[20px]"
    style={activeTab === "explore" ? { fontVariationSettings: "'FILL' 1" } : {}}
  >
          explore
        </span>
        <span className="text-[10px] font-bold mt-0.5">Explore</span>
      </button>

      {
    /* Reports Tab */
  }
      <button
    onClick={() => {
      setActiveTab("reports");
      setIsMapView(false);
    }}
    className={`flex flex-col items-center justify-center w-full max-w-[76px] py-1.5 rounded-full transition-all duration-300 active:scale-95 ${activeTab === "reports" ? "bg-white/90 text-[#00342b] shadow-sm border border-white/60 font-bold" : "text-[#3f4945] hover:text-[#00342b] hover:bg-white/50"}`}
  >
        <span
    className="material-symbols-outlined text-[20px]"
    style={activeTab === "reports" ? { fontVariationSettings: "'FILL' 1" } : {}}
  >
          analytics
        </span>
        <span className="text-[10px] font-bold mt-0.5">Reports</span>
      </button>

      {
    /* Patterns Tab */
  }
      <button
    onClick={() => {
      setActiveTab("patterns");
      setIsMapView(false);
    }}
    className={`flex flex-col items-center justify-center w-full max-w-[76px] py-1.5 rounded-full transition-all duration-300 active:scale-95 ${activeTab === "patterns" ? "bg-white/90 text-[#00342b] shadow-sm border border-white/60 font-bold" : "text-[#3f4945] hover:text-[#00342b] hover:bg-white/50"}`}
  >
        <span
    className="material-symbols-outlined text-[20px]"
    style={activeTab === "patterns" ? { fontVariationSettings: "'FILL' 1" } : {}}
  >
          bar_chart
        </span>
        <span className="text-[10px] font-bold mt-0.5">Patterns</span>
      </button>

      {
    /* Profile Tab */
  }
      <button
    onClick={() => {
      setActiveTab("profile");
      setIsMapView(false);
    }}
    className={`flex flex-col items-center justify-center w-full max-w-[76px] py-1.5 rounded-full transition-all duration-300 active:scale-95 ${activeTab === "profile" ? "bg-white/90 text-[#00342b] shadow-sm border border-white/60 font-bold" : "text-[#3f4945] hover:text-[#00342b] hover:bg-white/50"}`}
  >
        <span
    className="material-symbols-outlined text-[20px]"
    style={activeTab === "profile" ? { fontVariationSettings: "'FILL' 1" } : {}}
  >
          person
        </span>
        <span className="text-[10px] font-bold mt-0.5">Profile</span>
      </button>
    </nav>;
};
