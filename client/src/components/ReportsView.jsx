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

        {/* Goals & Progress Section */}
        <section className="glass-card rounded-2xl p-6 animate-slide-up delay-150 border border-white/60">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#004d40] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F44336] animate-pulse">local_fire_department</span>
                3 Day Streak!
              </h2>
              <p className="text-sm text-[#3f4945] font-medium mt-1">
                You're earning a <strong className="text-[#004d40]">1.5x points multiplier</strong>.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-[#707975]">Next Reward</span>
              <div className="text-sm font-extrabold text-[#004d40]">Free Coffee</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#006e1c] bg-[#4CAF50]/20 border border-[#4CAF50]/30">
                  {userProfile.totalPoints} pts
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-[#004d40]">
                  500 pts
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2.5 mb-2 text-xs flex rounded-full bg-white/60 border border-white/80 shadow-inner">
              <div style={{ width: `${Math.min(100, (userProfile.totalPoints / 500) * 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#004d40] to-[#4CAF50] transition-all duration-1000 rounded-full"></div>
            </div>
            <p className="text-xs text-right text-[#3f4945] font-medium">
              {userProfile.totalPoints >= 500 
                ? "Goal reached! Claim your reward below." 
                : `${500 - userProfile.totalPoints} points to go!`}
            </p>
          </div>
        </section>

        {/* Rewards Hub Section */}
        <section className="animate-slide-up delay-175">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-extrabold text-[#004d40]">Rewards Hub</h2>
            <span className="text-xs text-[#707975] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">redeem</span>
              3 Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Reward 1 - Unlocked */}
            <div className={`glass-card rounded-2xl p-4 flex flex-col justify-between transition-all relative overflow-hidden group ${userProfile.totalPoints >= 300 ? 'border-2 border-[#4CAF50]/40' : 'opacity-70'}`}>
              {userProfile.totalPoints >= 300 && (
                <div className="absolute top-0 right-0 bg-[#4CAF50] text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg tracking-wider">
                  UNLOCKED
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-sm ${userProfile.totalPoints >= 300 ? 'bg-white border-white/80' : 'bg-white/40 border-white/40'}`}>
                  <span className={`material-symbols-outlined ${userProfile.totalPoints >= 300 ? 'text-[#4CAF50]' : 'text-[#707975]'}`}>shopping_bag</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#191c1b]">5% Off Groceries</h3>
                  <p className="text-xs text-[#3f4945]">Market Fresh</p>
                </div>
              </div>
              {userProfile.totalPoints >= 300 ? (
                <button className="w-full py-2 bg-[#004d40] text-white rounded-lg text-xs font-bold hover:bg-[#00342b] transition-all active:scale-[0.98] shadow-md">
                  Claim Reward
                </button>
              ) : (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-[#004d40]">300 pts</span>
                  <span className="text-[10px] font-bold text-[#707975] bg-white/40 px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">lock</span> LOCKED
                  </span>
                </div>
              )}
            </div>

            {/* Reward 2 - Goal */}
            <div className={`glass-card rounded-2xl p-4 flex flex-col justify-between transition-all relative overflow-hidden group ${userProfile.totalPoints >= 500 ? 'border-2 border-[#4CAF50]/40' : 'opacity-70'}`}>
              {userProfile.totalPoints >= 500 && (
                <div className="absolute top-0 right-0 bg-[#4CAF50] text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg tracking-wider">
                  UNLOCKED
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-sm ${userProfile.totalPoints >= 500 ? 'bg-white border-white/80' : 'bg-white/40 border-white/40'}`}>
                  <span className={`material-symbols-outlined ${userProfile.totalPoints >= 500 ? 'text-[#4CAF50]' : 'text-[#707975]'}`}>local_cafe</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#191c1b]">Free Coffee</h3>
                  <p className="text-xs text-[#3f4945]">The Roasted Bean</p>
                </div>
              </div>
              {userProfile.totalPoints >= 500 ? (
                <button className="w-full py-2 bg-[#004d40] text-white rounded-lg text-xs font-bold hover:bg-[#00342b] transition-all active:scale-[0.98] shadow-md">
                  Claim Reward
                </button>
              ) : (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-[#004d40]">500 pts</span>
                  <span className="text-[10px] font-bold text-[#707975] bg-white/40 px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">lock</span> LOCKED
                  </span>
                </div>
              )}
            </div>

            {/* Reward 3 - Stretch Goal */}
            <div className={`glass-card rounded-2xl p-4 flex flex-col justify-between transition-all relative overflow-hidden group ${userProfile.totalPoints >= 1000 ? 'border-2 border-[#4CAF50]/40' : 'opacity-70 hidden sm:flex'}`}>
              {userProfile.totalPoints >= 1000 && (
                <div className="absolute top-0 right-0 bg-[#4CAF50] text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg tracking-wider">
                  UNLOCKED
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-sm ${userProfile.totalPoints >= 1000 ? 'bg-white border-white/80' : 'bg-white/40 border-white/40'}`}>
                  <span className={`material-symbols-outlined ${userProfile.totalPoints >= 1000 ? 'text-[#4CAF50]' : 'text-[#707975]'}`}>restaurant</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#191c1b]">Priority Seating</h3>
                  <p className="text-xs text-[#3f4945]">Oceanview Resort</p>
                </div>
              </div>
              {userProfile.totalPoints >= 1000 ? (
                <button className="w-full py-2 bg-[#004d40] text-white rounded-lg text-xs font-bold hover:bg-[#00342b] transition-all active:scale-[0.98] shadow-md">
                  Claim Reward
                </button>
              ) : (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-[#004d40]">1000 pts</span>
                  <span className="text-[10px] font-bold text-[#707975] bg-white/40 px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">lock</span> LOCKED
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Crowd Impact */}
        <section className="glass-card rounded-2xl p-6 animate-slide-up delay-200 border border-white/60">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#3f4945] text-[22px]">groups</span>
                <h2 className="text-xl font-extrabold text-[#004d40]">Crowd Impact</h2>
              </div>
              <p className="text-sm text-[#3f4945] mb-5 font-medium leading-relaxed">
                Your real-time updates have helped approximately{" "}
                <strong className="text-[#004d40] font-extrabold text-base bg-[#4CAF50]/20 px-1.5 py-0.5 rounded">
                  {userProfile.peopleHelped.toLocaleString()}
                </strong>{" "}
                people plan better today.
              </p>

              {/* Added new helpful info */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-white/40 p-3 rounded-xl border border-white/50 shadow-sm hover:bg-white/60 transition-colors">
                  <div className="text-xs text-[#707975] font-bold uppercase mb-1">Trust Score</div>
                  <div className="text-lg font-extrabold text-[#006e1c] flex items-center gap-1">
                    98% <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  </div>
                </div>
                <div className="bg-white/40 p-3 rounded-xl border border-white/50 shadow-sm hover:bg-white/60 transition-colors">
                  <div className="text-xs text-[#707975] font-bold uppercase mb-1">Local Rank</div>
                  <div className="text-lg font-extrabold text-[#004d40] flex items-center gap-1">
                    Top 5% <span className="material-symbols-outlined text-[16px]">emoji_events</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Dynamic Impact Visualization */}
            <div className="flex-1 flex flex-col justify-end">
              <div className="text-xs font-bold text-[#707975] mb-2 uppercase tracking-wide text-center md:text-right">Recent Activity Impact</div>
              <div className="w-full h-32 rounded-xl bg-white/30 border border-white/50 relative flex items-end p-2 gap-2 shadow-inner">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const recentReports = [...userReports].slice(0, 5).reverse();
                  const reportIdx = idx - (5 - recentReports.length);
                  const report = reportIdx >= 0 ? recentReports[reportIdx] : null;
                  const maxPoints = Math.max(...recentReports.map(r => r.pointsEarned), 15);
                  const heightPercent = report ? Math.max(30, (report.pointsEarned / maxPoints) * 100) : 10;
                  const opacity = 0.4 + (idx * 0.15);
                  
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full">
                      {/* Bar Container */}
                      <div className="w-full flex-1 relative mt-8">
                        {/* The Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`absolute bottom-0 w-full ${report ? 'bg-gradient-to-t from-[#00342b] to-[#006e1c]' : 'bg-[#707975]'} rounded-t-md transition-all duration-500 group-hover:brightness-110 shadow-sm flex justify-center group`}
                        >
                          {/* Tooltip / Value on hover attached to the top of the bar */}
                          {report && (
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-[#00342b] text-white text-[10px] font-bold px-2 py-1 rounded-md transition-all whitespace-nowrap z-20 shadow-lg pointer-events-none translate-y-2 group-hover:translate-y-0 flex flex-col items-center">
                              <span className="capitalize text-[#afefdd]">{report.sector}</span>
                              <span>+{report.pointsEarned} pts</span>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#00342b]"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Label below bar */}
                      <div className="h-8 mt-1.5 shrink-0 flex items-center justify-center w-full">
                        {report ? (
                          <span className="material-symbols-outlined text-[12px] text-[#00342b] bg-white/60 rounded-full p-1 shadow-sm">
                            {report.iconName || 'storefront'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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

          {userReports.length > 3 && (
            <button
              onClick={() => setShowAllHistory(!showAllHistory)}
              className="w-full mt-4 py-3 rounded-xl bg-white/40 border border-white/50 font-bold text-sm text-[#004d40] flex items-center justify-center gap-2 hover:bg-white/70 active:scale-[0.98] transition-all backdrop-blur-md"
            >
              {showAllHistory ? "Show Less" : "View All History"}
            </button>
          )}
        </section>
      </main>
    </div>;
};
