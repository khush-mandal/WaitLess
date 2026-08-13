import { useState } from "react";
export const PatternsView = () => {
  const [timeRange, setTimeRange] = useState("week");
  return <div className="mesh-bg min-h-screen pt-20 pb-28 px-5">
      <main className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center animate-slide-up">
          <div>
            <h1 className="text-3xl font-extrabold text-[#00342b]">Crowd Patterns</h1>
            <p className="text-sm text-[#3f4945] font-medium">Predictive density and optimal visit windows.</p>
          </div>
        </div>

        {
    /* Time Selector */
  }
        <section className="glass-card p-1.5 flex justify-between items-center rounded-xl animate-slide-up">
          <button
    onClick={() => setTimeRange("today")}
    className={`flex-1 py-2 text-center rounded-lg text-sm font-bold transition-all ${timeRange === "today" ? "bg-white/90 text-[#00342b] shadow-sm" : "text-[#3f4945] hover:bg-white/40"}`}
  >
            Today
          </button>
          <button
    onClick={() => setTimeRange("week")}
    className={`flex-1 py-2 text-center rounded-lg text-sm font-bold transition-all ${timeRange === "week" ? "bg-white/90 text-[#00342b] shadow-sm" : "text-[#3f4945] hover:bg-white/40"}`}
  >
            Week
          </button>
          <button
    onClick={() => setTimeRange("month")}
    className={`flex-1 py-2 text-center rounded-lg text-sm font-bold transition-all ${timeRange === "month" ? "bg-white/90 text-[#00342b] shadow-sm" : "text-[#3f4945] hover:bg-white/40"}`}
  >
            Month
          </button>
        </section>

        {
    /* Weekly Trends Chart Card */
  }
        <section className="glass-card rounded-2xl p-6 animate-slide-up delay-100 border border-white/60">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#00342b] mb-1">
                {timeRange === "today" ? "Hourly Density" : timeRange === "week" ? "Weekly Trends" : "Monthly Overview"}
              </h2>
              <p className="text-xs text-[#3f4945]">Average density across all saved locations.</p>
            </div>
            <div className="flex gap-2 text-[10px] uppercase font-bold text-[#3f4945]">
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
    /* Chart Area */
  }
          <div className="relative h-48 w-full flex items-end justify-between gap-2 mt-8 border-b border-white/30 pb-2">
            {
    /* Grid Lines */
  }
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-t border-[#707975] w-full" />
              <div className="border-t border-[#707975] w-full" />
              <div className="border-t border-[#707975] w-full" />
            </div>

            {
    /* Bars Mon-Sun */
  }
            {[
    { day: "Mon", height: "60%", level: "medium", color: "bg-[#FFC107]", bg: "bg-[#FFC107]/20" },
    { day: "Tue", height: "40%", level: "low", color: "bg-[#4CAF50]", bg: "bg-[#4CAF50]/20" },
    { day: "Wed", height: "30%", level: "low", color: "bg-[#4CAF50]", bg: "bg-[#4CAF50]/20" },
    { day: "Thu", height: "70%", level: "medium", color: "bg-[#FFC107]", bg: "bg-[#FFC107]/20" },
    { day: "Fri", height: "90%", level: "high", color: "bg-[#F44336]", bg: "bg-[#F44336]/20", isCurrent: true },
    { day: "Sat", height: "100%", level: "high", color: "bg-[#F44336]", bg: "bg-[#F44336]/20" },
    { day: "Sun", height: "75%", level: "medium", color: "bg-[#FFC107]", bg: "bg-[#FFC107]/20" }
  ].map((bar, idx) => <div key={idx} className="flex-1 flex flex-col items-center gap-2 z-10 group h-full justify-end">
                <div className={`w-full ${bar.bg} rounded-t-md relative overflow-hidden h-full flex items-end`}>
                  <div
    className={`w-full ${bar.color} rounded-t-md transition-all duration-700 group-hover:brightness-110`}
    style={{ height: bar.height }}
  />
                </div>
                <span
    className={`text-xs font-bold ${bar.isCurrent ? "text-[#00342b]" : "text-[#3f4945]"}`}
  >
                  {bar.day}
                </span>
              </div>)}
          </div>
        </section>

        {
    /* Forecast & Planning Insights Grid */
  }
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {
    /* Next 4 Hours Forecast */
  }
          <section className="glass-card rounded-2xl p-6 animate-slide-up delay-200">
            <div className="flex items-center gap-2 mb-4 text-[#00342b]">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
              <h3 className="font-bold text-base">Next 4 Hours Forecast</h3>
            </div>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center pb-2.5 border-b border-white/20">
                <span className="text-sm font-semibold text-[#191c1b]">12:00 PM</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-[#F44336]">Busy</span>
                  <span className="material-symbols-outlined text-[#F44336] text-[16px]">groups</span>
                </div>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-white/20">
                <span className="text-sm font-semibold text-[#191c1b]">1:00 PM</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-[#b08d00]">Moderate</span>
                  <span className="material-symbols-outlined text-[#b08d00] text-[16px]">groups</span>
                </div>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-white/20">
                <span className="text-sm font-semibold text-[#191c1b]">2:00 PM</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-[#4CAF50]">Quiet</span>
                  <span className="material-symbols-outlined text-[#4CAF50] text-[16px]">person</span>
                </div>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-sm font-semibold text-[#191c1b]">3:00 PM</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-[#4CAF50]">Quiet</span>
                  <span className="material-symbols-outlined text-[#4CAF50] text-[16px]">person</span>
                </div>
              </div>
            </div>
          </section>

          {
    /* Planning Insights */
  }
          <section className="glass-card rounded-2xl p-6 animate-slide-up delay-300">
            <h3 className="font-bold text-base text-[#00342b] mb-4">Planning Insights</h3>

            <div className="bg-white/50 border border-white/60 rounded-xl p-4 mb-3.5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="bg-[#4CAF50]/20 p-2 rounded-full text-[#4CAF50] mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">local_cafe</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#3f4945] uppercase tracking-wider">
                    Quietist Day for Coffee
                  </p>
                  <p className="text-base font-extrabold text-[#00342b]">Tuesday Mornings</p>
                  <p className="text-xs text-[#3f4945] mt-1">
                    Expect 40% less crowds than average before 9 AM.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 border border-white/60 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="bg-[#F44336]/20 p-2 rounded-full text-[#F44336] mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#3f4945] uppercase tracking-wider">
                    Avoid Groceries On
                  </p>
                  <p className="text-base font-extrabold text-[#00342b]">Sunday Afternoons</p>
                  <p className="text-xs text-[#3f4945] mt-1">
                    Peak wait times reach up to 25 mins at checkout.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>;
};
