import { useState } from "react";
export const ProfileView = ({ userProfile, onResetStats }) => {
  const [activeModal, setActiveModal] = useState(null);
  return <div className="mesh-bg min-h-screen pt-20 pb-28 px-5">
      <main className="max-w-3xl mx-auto space-y-6">
        {
    /* Profile Header Card */
  }
        <section className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group animate-fade-in border border-white/60">
          <div className="relative w-24 h-24 rounded-full border-4 border-white/80 shadow-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <img
    src={userProfile.avatarUrl}
    alt={userProfile.name}
    className="w-full h-full object-cover"
  />
          </div>
          <div className="flex flex-col gap-1 z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00342b]">
              {userProfile.name}
            </h1>
            <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 bg-[#004d40]/10 rounded-full border border-[#004d40]/20 hover:bg-[#004d40]/20 transition-colors cursor-pointer">
              <span
    className="material-symbols-outlined text-[#004d40] text-[16px]"
    style={{ fontVariationSettings: "'FILL' 1" }}
  >
                workspace_premium
              </span>
              <span className="text-xs font-bold text-[#004d40]">{userProfile.level}</span>
            </div>
          </div>
        </section>

        {
    /* Stats Bento Grid */
  }
        <section className="grid grid-cols-3 gap-3 animate-slide-up delay-100">
          <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1.5 hover:bg-white/80 transition-all cursor-default">
            <span
    className="material-symbols-outlined text-[#4CAF50] text-[26px]"
    style={{ fontVariationSettings: "'FILL' 1" }}
  >
              vital_signs
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-[#191c1b]">
                {userProfile.impactScore}
              </span>
              <span className="text-[11px] font-bold text-[#707975]">Impact Score</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1.5 hover:bg-white/80 transition-all cursor-default">
            <span
    className="material-symbols-outlined text-[#FFC107] text-[26px]"
    style={{ fontVariationSettings: "'FILL' 1" }}
  >
              trophy
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-[#191c1b]">
                {userProfile.communityRank}
              </span>
              <span className="text-[11px] font-bold text-[#707975]">Community</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1.5 hover:bg-white/80 transition-all cursor-default">
            <span
    className="material-symbols-outlined text-[#004d40] text-[26px]"
    style={{ fontVariationSettings: "'FILL' 1" }}
  >
              timer
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-[#191c1b]">
                {userProfile.savedHoursNumber}h
              </span>
              <span className="text-[11px] font-bold text-[#707975]">Saved Hours</span>
            </div>
          </div>
        </section>

        {
    /* Settings List */
  }
        <section className="glass-card rounded-2xl flex flex-col overflow-hidden animate-slide-up delay-200 border border-white/60">
          {
    /* Account Settings */
  }
          <button
    onClick={() => setActiveModal("Account Settings")}
    className="flex items-center justify-between p-5 hover:bg-white/50 active:bg-white/70 transition-all border-b border-white/30 group text-left w-full"
  >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#004d40]/10 flex items-center justify-center text-[#004d40] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-[#191c1b] group-hover:text-[#00342b] transition-colors">
                  Account Settings
                </span>
                <span className="text-xs text-[#707975]">Personal info, security</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#707975] group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>

          {
    /* Preferences */
  }
          <button
    onClick={() => setActiveModal("Preferences")}
    className="flex items-center justify-between p-5 hover:bg-white/50 active:bg-white/70 transition-all border-b border-white/30 group text-left w-full"
  >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#004d40]/10 flex items-center justify-center text-[#004d40] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-[#191c1b] group-hover:text-[#00342b] transition-colors">
                  Preferences
                </span>
                <span className="text-xs text-[#707975]">Distance units (miles/km), notifications</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#707975] group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>

          {
    /* Privacy */
  }
          <button
    onClick={() => setActiveModal("Privacy")}
    className="flex items-center justify-between p-5 hover:bg-white/50 active:bg-white/70 transition-all border-b border-white/30 group text-left w-full"
  >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#004d40]/10 flex items-center justify-center text-[#004d40] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[20px]">shield</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-[#191c1b] group-hover:text-[#00342b] transition-colors">
                  Privacy
                </span>
                <span className="text-xs text-[#707975]">Data sharing, location permissions</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#707975] group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>

          {
    /* Help & Support */
  }
          <button
    onClick={() => setActiveModal("Help & Support")}
    className="flex items-center justify-between p-5 hover:bg-white/50 active:bg-white/70 transition-all group text-left w-full"
  >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#004d40]/10 flex items-center justify-center text-[#004d40] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[20px]">help</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-[#191c1b] group-hover:text-[#00342b] transition-colors">
                  Help & Support
                </span>
                <span className="text-xs text-[#707975]">FAQ, community guidelines, contact</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#707975] group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>
        </section>

        {
    /* Action Button: Reset / Log Out */
  }
        <section className="animate-slide-up delay-300">
          <button
    onClick={() => {
      if (window.confirm("Reset activity points and reports data to initial state?")) {
        onResetStats();
      }
    }}
    className="w-full glass-card py-4 flex items-center justify-center gap-2 text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition-all active:scale-[0.98] font-bold text-xs uppercase tracking-wider rounded-2xl"
  >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span>Reset Profile Stats & Activity</span>
          </button>
        </section>
      </main>

      {
    /* Settings Info Modal */
  }
      {activeModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-sm rounded-2xl p-6 relative border border-white/60 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-white/40 mb-4">
              <h3 className="font-extrabold text-[#00342b] text-lg">{activeModal}</h3>
              <button
    onClick={() => setActiveModal(null)}
    className="p-1 rounded-full text-[#707975] hover:bg-black/5"
  >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="text-xs text-[#3f4945] mb-6 leading-relaxed">
              Your {activeModal.toLowerCase()} settings are managed securely in your WaitLess session.
              Notifications for crowd surges and reward milestones are currently enabled.
            </p>
            <button
    onClick={() => setActiveModal(null)}
    className="w-full py-2.5 bg-[#004d40] text-white font-bold text-xs rounded-xl hover:bg-[#00342b] transition-all"
  >
              Close
            </button>
          </div>
        </div>}
    </div>;
};
