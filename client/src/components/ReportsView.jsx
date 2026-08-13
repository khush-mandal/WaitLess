import { useState } from "react";
export const ReportsView = ({
  userProfile,
  userReports,
  onOpenReportModal
}) => {
  const [showAllHistory, setShowAllHistory] = useState(false);
  const displayedReports = showAllHistory ? userReports : userReports.slice(0, 3);
  return <div className="mesh-bg min-h-screen pt-20 pb-28 px-5">
      <main className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center animate-slide-up">
          <div>
            <h1 className="text-3xl font-extrabold text-[#004d40]">Your Activity</h1>
            <p className="text-sm text-[#3f4945] font-medium">Track your community impact and rewards.</p>
          </div>
          <button
    onClick={onOpenReportModal}
    className="hidden sm:flex items-center gap-1.5 bg-[#004d40] text-white hover:bg-[#00342b] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
  >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Submit Report
          </button>
        </div>

        {
    /* Summary Section (Bento Grid) */
  }
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-slide-up delay-100">
          {
    /* Total Points */
  }
          <div className="col-span-2 md:col-span-1 glass-card rounded-2xl p-5 flex flex-col justify-center items-start hover:bg-white/80 transition-all cursor-pointer group">
            <div className="flex items-center gap-2 mb-2 text-[#3f4945]">
              <span
    className="material-symbols-outlined text-[20px] text-[#00342b] group-hover:scale-110 transition-transform"
    style={{ fontVariationSettings: "'FILL' 1" }}
  >
                stars
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">Total Points</span>
            </div>
            <div className="text-2xl font-extrabold text-[#004d40]">{userProfile.totalPoints}</div>
            <div className="text-xs text-[#006e1c] mt-1 font-semibold">
              +{userProfile.weeklyPoints} this week
            </div>
          </div>

          {
    /* Total Reports */
  }
          <div className="glass-card rounded-2xl p-5 flex flex-col justify-center items-start hover:bg-white/80 transition-all cursor-pointer group">
            <div className="flex items-center gap-2 mb-2 text-[#3f4945]">
              <span className="material-symbols-outlined text-[20px] text-[#00342b] group-hover:scale-110 transition-transform">
                assignment
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">Reports</span>
            </div>
            <div className="text-2xl font-extrabold text-[#004d40]">
              {userProfile.totalReports}
            </div>
          </div>

          {
    /* Time Saved */
  }
          <div className="glass-card rounded-2xl p-5 flex flex-col justify-center items-start hover:bg-white/80 transition-all cursor-pointer group">
            <div className="flex items-center gap-2 mb-2 text-[#3f4945]">
              <span className="material-symbols-outlined text-[20px] text-[#00342b] group-hover:scale-110 transition-transform">
                schedule
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">Time Saved</span>
            </div>
            <div className="text-2xl font-extrabold text-[#004d40]">
              {userProfile.timeSavedHours}
            </div>
          </div>
        </section>

        {
    /* Crowd Impact */
  }
        <section className="glass-card rounded-2xl p-6 animate-slide-up delay-200 border border-white/60">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-extrabold text-[#004d40]">Crowd Impact</h2>
            <span className="material-symbols-outlined text-[#3f4945] text-[22px]">groups</span>
          </div>
          <p className="text-sm text-[#3f4945] mb-5 font-medium">
            Your real-time updates have helped approximately{" "}
            <strong className="text-[#004d40] font-extrabold">
              {userProfile.peopleHelped.toLocaleString()}
            </strong>{" "}
            people plan better today.
          </p>

          {
    /* Abstract Impact Visualization */
  }
          <div className="w-full h-24 rounded-xl bg-white/40 border border-white/50 relative overflow-hidden flex items-end p-2 gap-2">
            <div className="flex-1 h-1/3 bg-[#004d40] opacity-20 rounded-t hover:opacity-40 transition-opacity" />
            <div className="flex-1 h-2/3 bg-[#004d40] opacity-40 rounded-t hover:opacity-60 transition-opacity" />
            <div className="flex-1 h-1/2 bg-[#004d40] opacity-60 rounded-t hover:opacity-80 transition-opacity" />
            <div className="flex-1 h-full bg-[#004d40] opacity-80 rounded-t hover:opacity-100 transition-opacity" />
            <div className="flex-1 h-3/4 bg-[#004d40] rounded-t hover:brightness-110 transition-all" />
          </div>
        </section>

        {
    /* Recent Reports List */
  }
        <section className="animate-slide-up delay-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-extrabold text-[#004d40]">Recent Reports</h2>
            <span className="text-xs text-[#707975] font-bold">
              {userReports.length} Total Submissions
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {displayedReports.map((report) => {
    let badgeColor = "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30";
    let badgeIcon = "check_circle";
    let badgeLabel = "Low Crowd";
    if (report.crowdLevel === "high") {
      badgeColor = "bg-[#F44336]/15 text-[#F44336] border-[#F44336]/30";
      badgeIcon = "error";
      badgeLabel = "High Crowd";
    } else if (report.crowdLevel === "medium") {
      badgeColor = "bg-[#FFC107]/15 text-[#b08d00] border-[#FFC107]/30";
      badgeIcon = "warning";
      badgeLabel = "Medium Crowd";
    }
    return <div
      key={report.id}
      className="glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-white/80 transition-all cursor-pointer active:scale-[0.99]"
    >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#00342b]/10 flex items-center justify-center border border-white/40">
                      <span className="material-symbols-outlined text-[#00342b] text-[20px]">
                        {report.iconName || "storefront"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#191c1b]">{report.placeName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border ${badgeColor}`}
    >
                          <span className="material-symbols-outlined text-[12px]">
                            {badgeIcon}
                          </span>
                          {badgeLabel}
                        </span>
                        <span className="text-xs text-[#3f4945]">{report.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <div className="font-extrabold text-base text-[#006e1c]">
                    +{report.pointsEarned} pts
                  </div>
                </div>;
  })}
          </div>

          <button
    onClick={() => setShowAllHistory(!showAllHistory)}
    className="w-full mt-4 py-3 rounded-xl bg-white/40 border border-white/50 font-bold text-sm text-[#004d40] flex items-center justify-center gap-2 hover:bg-white/70 active:scale-[0.98] transition-all backdrop-blur-md"
  >
            {showAllHistory ? "Show Less" : "View All History"}
          </button>
        </section>
      </main>
    </div>;
};
