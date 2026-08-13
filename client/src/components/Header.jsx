export const Header = ({
  activeTab,
  setActiveTab,
  isMapView,
  setIsMapView,
  unreadNotifications,
  onNotificationClick
}) => {
  return <header className="fixed top-0 left-0 w-full backdrop-blur-2xl bg-white/30 dark:bg-[#191c1b]/30 border-b border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.05)] flex items-center justify-between px-5 h-16 z-50 transition-all duration-300">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        {
    /* Logo */
  }
        <div
    onClick={() => {
      setActiveTab("explore");
      setIsMapView(false);
    }}
    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
  >
          <div className="bg-gradient-to-tr from-[#00342b] to-[#00695c] p-1.5 rounded-xl shadow-sm border border-white/30 backdrop-blur-md">
            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              bubble_chart
            </span>
          </div>
          <span className="font-[#Inter] font-extrabold text-[22px] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00342b] to-[#004d40]">
            WaitLess
          </span>
        </div>

        {
    /* Web Navigation Cluster */
  }
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/40 border border-white/50 shadow-[inset_0_1px_4px_rgba(255,255,255,0.6)] backdrop-blur-xl">
          <button
    onClick={() => {
      setActiveTab("explore");
      setIsMapView(false);
    }}
    className={`font-medium text-[14px] px-4 py-1.5 rounded-full transition-all duration-300 ${activeTab === "explore" && !isMapView ? "bg-white/90 text-[#00342b] shadow-sm border border-white/60 font-bold" : "text-[#3f4945] hover:text-[#00342b] hover:bg-white/50"}`}
  >
            Explore
          </button>
          <button
    onClick={() => {
      setActiveTab("explore");
      setIsMapView(true);
    }}
    className={`font-medium text-[14px] flex items-center gap-1 px-4 py-1.5 rounded-full transition-all duration-300 ${activeTab === "explore" && isMapView ? "bg-white/90 text-[#00342b] shadow-sm border border-white/60 font-bold" : "text-[#3f4945] hover:text-[#00342b] hover:bg-white/50"}`}
  >
            <span className="material-symbols-outlined text-[16px]">map</span>
            Live Map
          </button>
          <button
    onClick={() => setActiveTab("reports")}
    className={`font-medium text-[14px] px-4 py-1.5 rounded-full transition-all duration-300 ${activeTab === "reports" ? "bg-white/90 text-[#00342b] shadow-sm border border-white/60 font-bold" : "text-[#3f4945] hover:text-[#00342b] hover:bg-white/50"}`}
  >
            Reports
          </button>
          <button
    onClick={() => setActiveTab("patterns")}
    className={`font-medium text-[14px] px-4 py-1.5 rounded-full transition-all duration-300 ${activeTab === "patterns" ? "bg-white/90 text-[#00342b] shadow-sm border border-white/60 font-bold" : "text-[#3f4945] hover:text-[#00342b] hover:bg-white/50"}`}
  >
            Patterns
          </button>
          <button
    onClick={() => setActiveTab("profile")}
    className={`font-medium text-[14px] px-4 py-1.5 rounded-full transition-all duration-300 ${activeTab === "profile" ? "bg-white/90 text-[#00342b] shadow-sm border border-white/60 font-bold" : "text-[#3f4945] hover:text-[#00342b] hover:bg-white/50"}`}
  >
            Profile
          </button>
        </nav>

        {
    /* Header Right Actions */
  }
        <div className="flex items-center gap-3">
          {
    /* Map/Grid Toggle Button for Mobile */
  }
          {activeTab === "explore" && <button
    onClick={() => setIsMapView(!isMapView)}
    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/50 border border-white/60 text-[#00342b] font-medium text-xs shadow-sm hover:bg-white/80 active:scale-95 transition-all backdrop-blur-md"
  >
              <span className="material-symbols-outlined text-[16px]">
                {isMapView ? "grid_view" : "map"}
              </span>
              <span>{isMapView ? "Grid" : "Map"}</span>
            </button>}

          {
    /* Notifications Button */
  }
          <button
    onClick={onNotificationClick}
    className="relative text-[#3f4945] bg-white/40 border border-white/50 hover:bg-white/80 p-2 rounded-full shadow-sm transition-all active:scale-90 backdrop-blur-md"
    title="Notifications"
  >
            <span className="material-symbols-outlined block text-[20px]">notifications</span>
            {unreadNotifications && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#F44336] rounded-full border-2 border-white animate-pulse" />}
          </button>
        </div>
      </div>
    </header>;
};
