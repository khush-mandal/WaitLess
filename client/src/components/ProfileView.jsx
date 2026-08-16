import { useState } from "react";
import { useAuth } from "../context/AuthContext";

// Sample preset avatars for user selection
const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=ffb5a1",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica&backgroundColor=ccebe1",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily&backgroundColor=e3f2fd",
];

export const ProfileView = ({
  userProfile,
  setUserProfile,
  places = [],
  onSelectPlace,
  onLogout,
  onResetStats,
}) => {
  const { logout: authLogout, updateProfile } = useAuth();
  const [activeModal, setActiveModal] = useState(null); // 'edit_profile', 'Account', 'Preferences', 'Privacy', 'Help', 'badge_detail'
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Edit Profile Form State
  const [editName, setEditName] = useState(userProfile?.name || "Alex Rivera");
  const [editBio, setEditBio] = useState(
    userProfile?.bio || "Saving time & dodging crowd surges daily ⚡"
  );
  const [editEmail, setEditEmail] = useState(
    userProfile?.email || "alex.rivera@example.com"
  );
  const [editAvatar, setEditAvatar] = useState(
    userProfile?.avatarUrl || PRESET_AVATARS[0]
  );

  // Preferences State
  const [preferences, setPreferences] = useState(
    userProfile?.preferences || {
      distanceUnit: "miles",
      crowdAlerts: true,
      weeklyDigest: true,
      defaultSector: "all",
    }
  );

  // Privacy State
  const [privacy, setPrivacy] = useState(
    userProfile?.privacy || {
      anonymousReporting: false,
      preciseLocation: true,
      dataSharing: true,
    }
  );

  // Help FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Helper trigger Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (setUserProfile) {
      setUserProfile((prev) => ({
        ...prev,
        name: editName,
        bio: editBio,
        email: editEmail,
        avatarUrl: editAvatar,
      }));
    }
    if (updateProfile) {
      await updateProfile({
        name: editName,
        bio: editBio,
        avatarUrl: editAvatar,
      });
    }
    setActiveModal(null);
    showToast("Profile details updated successfully!");
  };

  // Toggle Preferences
  const handleTogglePref = (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    if (setUserProfile) {
      setUserProfile((prev) => ({ ...prev, preferences: updated }));
    }
    showToast(`Preference updated!`);
  };

  // Toggle Privacy
  const handleTogglePrivacy = (key) => {
    const updated = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updated);
    if (setUserProfile) {
      setUserProfile((prev) => ({ ...prev, privacy: updated }));
    }
    showToast(`Privacy setting updated!`);
  };

  // Toggle Favorite Place
  const handleToggleFavorite = (placeId) => {
    const currentFavs = userProfile?.favoritePlaceIds || [];
    const isFav = currentFavs.includes(placeId);
    const updatedFavs = isFav
      ? currentFavs.filter((id) => id !== placeId)
      : [...currentFavs, placeId];

    if (setUserProfile) {
      setUserProfile((prev) => ({
        ...prev,
        favoritePlaceIds: updatedFavs,
      }));
    }
    showToast(isFav ? "Removed from favorites" : "Added to favorites");
  };

  // Handle Logout
  const handleLogoutAction = () => {
    if (authLogout) {
      authLogout();
    }
    if (onLogout) {
      onLogout();
    }
    showToast("Logged out successfully");
  };

  // Calculate dynamic level and XP percentage based on totalPoints
  const currentXP = userProfile?.totalPoints || 0;
  const currentLevelNumber = Math.floor(currentXP / 100) + 1;
  const targetXP = currentLevelNumber * 100;
  const xpPercentage = Math.min(100, Math.round(((currentXP % 100) / 100) * 100));
  const currentLevelName = `Level ${currentLevelNumber} Pioneer`;

  // Badges list
  const badgesList = userProfile?.badges || [
    { id: "b1", title: "Early Bird", description: "Report crowd status before 9 AM", icon: "wb_sunny", unlocked: true, color: "from-amber-400 to-orange-500", date: "Aug 10, 2026" },
    { id: "b2", title: "Surge Spotter", description: "Detect an unexpected surge rush", icon: "bolt", unlocked: true, color: "from-emerald-400 to-teal-600", date: "Aug 12, 2026" },
    { id: "b3", title: "Time Saver", description: "Save over 10 hours using WaitLess", icon: "timer", unlocked: true, color: "from-blue-400 to-indigo-600", date: "Aug 14, 2026" },
    { id: "b4", title: "Community Hero", description: "Reach Top 5% community rank", icon: "military_tech", unlocked: true, color: "from-purple-400 to-pink-600", date: "Aug 15, 2026" },
    { id: "b5", title: "Master Reporter", description: "Submit 25 crowd reports", icon: "rate_review", unlocked: false, progress: userProfile?.totalReports || 15, maxProgress: 25, color: "from-cyan-500 to-blue-600" },
    { id: "b6", title: "Local Explorer", description: "Report across 5 different sectors", icon: "explore", unlocked: false, progress: 4, maxProgress: 5, color: "from-amber-500 to-emerald-600" },
  ];

  // Saved Favorite Places list
  const savedPlaces = places.filter((p) =>
    (userProfile?.favoritePlaceIds || ["place-1", "place-2"]).includes(p.id)
  );

  return (
    <div className="mesh-bg min-h-screen pt-20 pb-28 px-4 sm:px-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-card px-5 py-3 rounded-full shadow-2xl border border-emerald-500/40 text-[#00342b] font-bold text-xs flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-emerald-600 text-sm">
            check_circle
          </span>
          {toastMessage}
        </div>
      )}

      <main className="max-w-3xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden group animate-fade-in border border-white/60 shadow-xl">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar with Edit Badge */}
            <div className="relative group/avatar cursor-pointer" onClick={() => setActiveModal("edit_profile")}>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white/90 shadow-xl overflow-hidden group-hover/avatar:scale-105 transition-all duration-300">
                <img
                  src={userProfile?.avatarUrl || editAvatar}
                  alt={userProfile?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#004d40] text-white flex items-center justify-center shadow-lg border-2 border-white hover:bg-[#00342b] hover:scale-110 transition-all"
                title="Edit Profile"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00342b] tracking-tight">
                  {userProfile?.name}
                </h1>
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-[#004d40]/10 rounded-full border border-[#004d40]/20 hover:bg-[#004d40]/20 transition-colors">
                  <span
                    className="material-symbols-outlined text-[#004d40] text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    workspace_premium
                  </span>
                  <span className="text-xs font-bold text-[#004d40]">
                    {currentLevelName}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#505a56] max-w-md">
                {userProfile?.bio || "Saving time & dodging crowd surges daily ⚡"}
              </p>

              {/* XP Progress Bar */}
              <div className="w-full mt-2 space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-bold text-[#004d40]">
                  <span>Progress to Level {currentLevelNumber + 1}</span>
                  <span>{currentXP} / {targetXP} XP ({xpPercentage}%)</span>
                </div>
                <div className="w-full h-2.5 bg-black/5 rounded-full overflow-hidden p-0.5 border border-white/60">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-[#004d40] rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${xpPercentage}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons: Edit Profile */}
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => setActiveModal("edit_profile")}
                  className="px-4 py-2 bg-[#004d40] hover:bg-[#00342b] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  Edit Profile
                </button>
                <button
                  onClick={() => setActiveModal("Account")}
                  className="px-4 py-2 bg-white/70 hover:bg-white text-[#004d40] text-xs font-bold rounded-xl border border-[#004d40]/20 shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                  Account Settings
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up delay-100">
          <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1 hover:bg-white/90 hover:scale-[1.02] transition-all cursor-default shadow-sm border border-white/60">
            <span
              className="material-symbols-outlined text-[#4CAF50] text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              vital_signs
            </span>
            <span className="text-2xl font-extrabold text-[#191c1b] tracking-tight">
              {userProfile?.impactScore || 92}
            </span>
            <span className="text-[11px] font-bold text-[#707975]">Impact Score</span>
          </div>

          <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1 hover:bg-white/90 hover:scale-[1.02] transition-all cursor-default shadow-sm border border-white/60">
            <span
              className="material-symbols-outlined text-[#FFC107] text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              trophy
            </span>
            <span className="text-2xl font-extrabold text-[#191c1b] tracking-tight">
              {userProfile?.communityRank || "Top 5%"}
            </span>
            <span className="text-[11px] font-bold text-[#707975]">Community Rank</span>
          </div>

          <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1 hover:bg-white/90 hover:scale-[1.02] transition-all cursor-default shadow-sm border border-white/60">
            <span
              className="material-symbols-outlined text-[#004d40] text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              timer
            </span>
            <span className="text-2xl font-extrabold text-[#191c1b] tracking-tight">
              {userProfile?.savedHoursNumber || 14}h
            </span>
            <span className="text-[11px] font-bold text-[#707975]">Saved Hours</span>
          </div>

          <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1 hover:bg-white/90 hover:scale-[1.02] transition-all cursor-default shadow-sm border border-white/60">
            <span
              className="material-symbols-outlined text-[#0288D1] text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              groups
            </span>
            <span className="text-2xl font-extrabold text-[#191c1b] tracking-tight">
              {userProfile?.peopleHelped ? `${userProfile.peopleHelped}` : "1.2k"}
            </span>
            <span className="text-[11px] font-bold text-[#707975]">People Helped</span>
          </div>
        </section>

        {/* Gamified Achievements & Badges Showcase */}
        <section className="glass-card rounded-3xl p-5 sm:p-6 space-y-4 animate-slide-up delay-150 border border-white/60 shadow-lg">
          <div className="flex justify-between items-center pb-2 border-b border-white/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004d40] text-[22px]">
                verified
              </span>
              <h2 className="font-extrabold text-[#00342b] text-base sm:text-lg">
                Achievements & Badges
              </h2>
            </div>
            <span className="text-xs font-bold text-[#004d40] bg-[#004d40]/10 px-2.5 py-1 rounded-full border border-[#004d40]/20">
              {badgesList.filter((b) => b.unlocked).length} / {badgesList.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badgesList.map((badge) => (
              <button
                key={badge.id}
                onClick={() => {
                  setSelectedBadge(badge);
                  setActiveModal("badge_detail");
                }}
                className={`p-3.5 rounded-2xl flex flex-col items-center text-center gap-2 border transition-all group ${
                  badge.unlocked
                    ? "bg-white/80 border-emerald-500/30 hover:border-emerald-500/60 shadow-sm hover:shadow-md hover:scale-[1.02]"
                    : "bg-white/30 border-white/40 opacity-70 hover:opacity-90 hover:bg-white/50"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md bg-gradient-to-tr ${badge.color} group-hover:scale-110 transition-transform relative`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {badge.icon}
                  </span>
                  {badge.unlocked && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] border border-white shadow">
                      ✓
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center w-full">
                  <span className="font-extrabold text-xs text-[#191c1b] group-hover:text-[#00342b]">
                    {badge.title}
                  </span>
                  <span className="text-[10px] text-[#707975] line-clamp-1">
                    {badge.unlocked ? badge.description : `Progress: ${badge.progress}/${badge.maxProgress}`}
                  </span>

                  {!badge.unlocked && badge.maxProgress && (
                    <div className="w-full h-1.5 bg-black/5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-teal-600 rounded-full"
                        style={{
                          width: `${Math.round(
                            (badge.progress / badge.maxProgress) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Saved Favorites Section */}
        {savedPlaces.length > 0 && (
          <section className="glass-card rounded-3xl p-5 sm:p-6 space-y-4 animate-slide-up delay-200 border border-white/60 shadow-lg">
            <div className="flex justify-between items-center pb-2 border-b border-white/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <h2 className="font-extrabold text-[#00342b] text-base sm:text-lg">
                  Saved Favorite Places
                </h2>
              </div>
              <span className="text-xs text-[#707975]">
                {savedPlaces.length} saved
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedPlaces.map((place) => (
                <div
                  key={place.id}
                  className="glass-card p-3 rounded-2xl border border-white/80 flex items-center justify-between hover:bg-white/90 transition-all shadow-sm group"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => onSelectPlace && onSelectPlace(place)}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-emerald-100 flex-shrink-0 shadow-sm border border-white">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-[#191c1b] truncate group-hover:text-[#004d40]">
                        {place.name}
                      </h4>
                      <span className="text-[11px] text-[#707975] truncate">
                        {place.category} • {place.distance}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            place.crowdLevel === "low"
                              ? "bg-emerald-500"
                              : place.crowdLevel === "medium"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                        />
                        <span className="text-[10px] font-bold text-[#3f4945]">
                          {place.statusLabel} ({place.currentWaitMin}m wait)
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFavorite(place.id)}
                    className="p-1.5 text-amber-500 hover:bg-black/5 rounded-full transition-colors ml-2"
                    title="Remove from favorites"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Settings List */}
        <section className="glass-card rounded-3xl flex flex-col overflow-hidden animate-slide-up delay-250 border border-white/60 shadow-lg">
          {/* Account Settings */}
          <button
            onClick={() => setActiveModal("Account")}
            className="flex items-center justify-between p-5 hover:bg-white/50 active:bg-white/70 transition-all border-b border-white/30 group text-left w-full"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#004d40]/10 flex items-center justify-center text-[#004d40] group-hover:scale-110 transition-transform shadow-inner">
                <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-[#191c1b] group-hover:text-[#00342b] transition-colors">
                  Account Settings
                </span>
                <span className="text-xs text-[#707975]">Display name, email, security & profile edit</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#707975] group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>

          {/* Preferences */}
          <button
            onClick={() => setActiveModal("Preferences")}
            className="flex items-center justify-between p-5 hover:bg-white/50 active:bg-white/70 transition-all border-b border-white/30 group text-left w-full"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#004d40]/10 flex items-center justify-center text-[#004d40] group-hover:scale-110 transition-transform shadow-inner">
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-[#191c1b] group-hover:text-[#00342b] transition-colors">
                  App Preferences
                </span>
                <span className="text-xs text-[#707975]">
                  Distance units ({preferences.distanceUnit}), push alerts, notifications
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#707975] group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>

          {/* Privacy */}
          <button
            onClick={() => setActiveModal("Privacy")}
            className="flex items-center justify-between p-5 hover:bg-white/50 active:bg-white/70 transition-all border-b border-white/30 group text-left w-full"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#004d40]/10 flex items-center justify-center text-[#004d40] group-hover:scale-110 transition-transform shadow-inner">
                <span className="material-symbols-outlined text-[20px]">shield</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-[#191c1b] group-hover:text-[#00342b] transition-colors">
                  Privacy & Data
                </span>
                <span className="text-xs text-[#707975]">
                  Anonymous crowd contribution, GPS precision
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#707975] group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>

          {/* Help & Support */}
          <button
            onClick={() => {
              setFeedbackSent(false);
              setActiveModal("Help");
            }}
            className="flex items-center justify-between p-5 hover:bg-white/50 active:bg-white/70 transition-all group text-left w-full"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#004d40]/10 flex items-center justify-center text-[#004d40] group-hover:scale-110 transition-transform shadow-inner">
                <span className="material-symbols-outlined text-[20px]">help</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-[#191c1b] group-hover:text-[#00342b] transition-colors">
                  Help, FAQ & Support
                </span>
                <span className="text-xs text-[#707975]">
                  Frequently asked questions, app feedback, version details
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#707975] group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </button>
        </section>

        {/* Action Buttons: Log Out & Danger Reset */}
        <section className="animate-slide-up delay-300 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleLogoutAction}
            className="w-full glass-card py-3.5 px-4 flex items-center justify-center gap-2 text-[#004d40] hover:bg-[#004d40]/10 transition-all active:scale-[0.98] font-bold text-xs uppercase tracking-wider rounded-2xl border border-[#004d40]/30 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Log Out of WaitLess</span>
          </button>

          <button
            onClick={() => {
              if (
                window.confirm(
                  "Reset activity points, reports, and local places to initial state?"
                )
              ) {
                onResetStats();
              }
            }}
            className="w-full glass-card py-3.5 px-4 flex items-center justify-center gap-2 text-[#ba1a1a] hover:bg-[#ffdad6]/60 transition-all active:scale-[0.98] font-bold text-xs uppercase tracking-wider rounded-2xl border border-[#ba1a1a]/30 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span>Reset Profile Stats & Data</span>
          </button>
        </section>
      </main>

      {/* MODAL 1: EDIT PROFILE MODAL */}
      {activeModal === "edit_profile" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 relative border border-white/60 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/40">
              <div className="flex items-center gap-2 text-[#00342b]">
                <span className="material-symbols-outlined text-[22px]">edit</span>
                <h3 className="font-extrabold text-lg">Edit Profile</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-[#707975] hover:bg-black/5"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#004d40] mb-2">
                  Choose Avatar Icon
                </label>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Avatar option ${idx}`}
                      onClick={() => setEditAvatar(url)}
                      className={`w-14 h-14 rounded-full object-cover cursor-pointer border-2 transition-all flex-shrink-0 ${
                        editAvatar === url
                          ? "border-[#004d40] scale-110 ring-2 ring-[#004d40]/40"
                          : "border-white/80 opacity-70 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#004d40] mb-1">
                  Or Image URL
                </label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/70 rounded-xl border border-white/80 text-xs font-medium text-[#191c1b] focus:outline-none focus:ring-2 focus:ring-[#004d40]"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#004d40] mb-1">
                  Full Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/70 rounded-xl border border-white/80 text-sm font-semibold text-[#191c1b] focus:outline-none focus:ring-2 focus:ring-[#004d40]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#004d40] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/70 rounded-xl border border-white/80 text-sm font-semibold text-[#191c1b] focus:outline-none focus:ring-2 focus:ring-[#004d40]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#004d40] mb-1">
                  Tagline / Bio
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/70 rounded-xl border border-white/80 text-xs font-medium text-[#191c1b] focus:outline-none focus:ring-2 focus:ring-[#004d40]"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 bg-black/5 hover:bg-black/10 text-[#3f4945] font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#004d40] hover:bg-[#00342b] text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ACCOUNT SETTINGS MODAL */}
      {activeModal === "Account" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 relative border border-white/60 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/40">
              <div className="flex items-center gap-2 text-[#00342b]">
                <span className="material-symbols-outlined text-[22px]">manage_accounts</span>
                <h3 className="font-extrabold text-lg">Account Details</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-[#707975] hover:bg-black/5"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white/60 rounded-2xl flex justify-between items-center border border-white">
                <div>
                  <span className="text-[#707975] block">Account Name</span>
                  <span className="font-bold text-[#191c1b] text-sm">{userProfile?.name}</span>
                </div>
                <button
                  onClick={() => setActiveModal("edit_profile")}
                  className="text-xs text-[#004d40] font-bold hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="p-3 bg-white/60 rounded-2xl flex justify-between items-center border border-white">
                <div>
                  <span className="text-[#707975] block">Email Address</span>
                  <span className="font-bold text-[#191c1b] text-sm">{userProfile?.email || "alex.rivera@example.com"}</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  Verified
                </span>
              </div>

              <div className="p-3 bg-white/60 rounded-2xl flex justify-between items-center border border-white">
                <div>
                  <span className="text-[#707975] block">Membership Level</span>
                  <span className="font-bold text-[#004d40] text-sm">{currentLevelName}</span>
                </div>
                <span className="text-xs text-[#707975]">{userProfile?.totalPoints || 450} Points</span>
              </div>

              <div className="p-3 bg-white/60 rounded-2xl flex justify-between items-center border border-white">
                <div>
                  <span className="text-[#707975] block">Security Password</span>
                  <span className="font-bold text-[#191c1b]">••••••••••••</span>
                </div>
                <button
                  onClick={() => showToast("Password reset link sent to your email!")}
                  className="text-xs text-[#004d40] font-bold hover:underline"
                >
                  Change
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-[#004d40] text-white font-bold text-xs rounded-xl hover:bg-[#00342b] transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: PREFERENCES MODAL */}
      {activeModal === "Preferences" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 relative border border-white/60 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/40">
              <div className="flex items-center gap-2 text-[#00342b]">
                <span className="material-symbols-outlined text-[22px]">tune</span>
                <h3 className="font-extrabold text-lg">App Preferences</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-[#707975] hover:bg-black/5"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-white/60 rounded-2xl flex justify-between items-center border border-white">
                <div>
                  <h4 className="font-bold text-xs text-[#191c1b]">Distance Measurement</h4>
                  <p className="text-[11px] text-[#707975]">Display distances in Miles or Kilometers</p>
                </div>
                <div className="flex bg-black/5 p-1 rounded-xl">
                  <button
                    onClick={() => {
                      const updated = { ...preferences, distanceUnit: "miles" };
                      setPreferences(updated);
                      if (setUserProfile) setUserProfile((p) => ({ ...p, preferences: updated }));
                      showToast("Set unit to Miles");
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      preferences.distanceUnit === "miles"
                        ? "bg-[#004d40] text-white shadow-sm"
                        : "text-[#707975]"
                    }`}
                  >
                    Miles
                  </button>
                  <button
                    onClick={() => {
                      const updated = { ...preferences, distanceUnit: "km" };
                      setPreferences(updated);
                      if (setUserProfile) setUserProfile((p) => ({ ...p, preferences: updated }));
                      showToast("Set unit to Kilometers");
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      preferences.distanceUnit === "km"
                        ? "bg-[#004d40] text-white shadow-sm"
                        : "text-[#707975]"
                    }`}
                  >
                    KM
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-white/60 rounded-2xl flex justify-between items-center border border-white">
                <div>
                  <h4 className="font-bold text-xs text-[#191c1b]">Crowd Surge Alerts</h4>
                  <p className="text-[11px] text-[#707975]">Real-time warnings when nearby spots get crowded</p>
                </div>
                <button
                  onClick={() => handleTogglePref("crowdAlerts")}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    preferences.crowdAlerts ? "bg-[#004d40]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      preferences.crowdAlerts ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="p-3.5 bg-white/60 rounded-2xl flex justify-between items-center border border-white">
                <div>
                  <h4 className="font-bold text-xs text-[#191c1b]">Weekly Impact Email</h4>
                  <p className="text-[11px] text-[#707975]">Summary of hours saved & points earned</p>
                </div>
                <button
                  onClick={() => handleTogglePref("weeklyDigest")}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    preferences.weeklyDigest ? "bg-[#004d40]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      preferences.weeklyDigest ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-[#004d40] text-white font-bold text-xs rounded-xl hover:bg-[#00342b] transition-all"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: PRIVACY MODAL */}
      {activeModal === "Privacy" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 relative border border-white/60 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/40">
              <div className="flex items-center gap-2 text-[#00342b]">
                <span className="material-symbols-outlined text-[22px]">shield</span>
                <h3 className="font-extrabold text-lg">Privacy & Data Control</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-[#707975] hover:bg-black/5"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-white/60 rounded-2xl flex justify-between items-center border border-white">
                <div>
                  <h4 className="font-bold text-xs text-[#191c1b]">Anonymous Reports</h4>
                  <p className="text-[11px] text-[#707975]">Hide your user profile when submitting crowd updates</p>
                </div>
                <button
                  onClick={() => handleTogglePrivacy("anonymousReporting")}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    privacy.anonymousReporting ? "bg-[#004d40]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      privacy.anonymousReporting ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="p-3.5 bg-white/60 rounded-2xl flex justify-between items-center border border-white">
                <div>
                  <h4 className="font-bold text-xs text-[#191c1b]">Precise GPS Location</h4>
                  <p className="text-[11px] text-[#707975]">Use high precision GPS for exact venue proximity</p>
                </div>
                <button
                  onClick={() => handleTogglePrivacy("preciseLocation")}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    privacy.preciseLocation ? "bg-[#004d40]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      privacy.preciseLocation ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-[#004d40] text-white font-bold text-xs rounded-xl hover:bg-[#00342b] transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: HELP & SUPPORT MODAL */}
      {activeModal === "Help" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 relative border border-white/60 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/40">
              <div className="flex items-center gap-2 text-[#00342b]">
                <span className="material-symbols-outlined text-[22px]">help</span>
                <h3 className="font-extrabold text-lg">Help & Support</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-[#707975] hover:bg-black/5"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-xs text-[#004d40] uppercase tracking-wider">
                Frequently Asked Questions
              </h4>

              {[
                {
                  q: "How does WaitLess calculate crowd levels?",
                  a: "WaitLess combines real-time user crowd reports, historical hourly density patterns, and nearby OpenStreetMap/Foursquare live venue signals to estimate live wait times accurately.",
                },
                {
                  q: "How do I earn points & Level up?",
                  a: "You earn +10 to +15 points for every crowd report you submit! As you accumulate points, your level increases and unlocks special badges.",
                },
                {
                  q: "What are Smart Alternatives?",
                  a: "When a spot you search for is very busy (e.g. 45 min wait), WaitLess suggests a nearby venue in the same category with a significantly shorter line.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/60 rounded-2xl border border-white overflow-hidden transition-all"
                >
                  <button
                    onClick={() =>
                      setOpenFaqIndex(openFaqIndex === idx ? null : idx)
                    }
                    className="w-full p-3.5 text-left font-bold text-xs text-[#191c1b] flex justify-between items-center"
                  >
                    <span>{item.q}</span>
                    <span className="material-symbols-outlined text-[18px] text-[#707975]">
                      {openFaqIndex === idx ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                  {openFaqIndex === idx && (
                    <div className="p-3.5 pt-0 text-xs text-[#505a56] leading-relaxed border-t border-black/5">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-white/40">
              <h4 className="font-extrabold text-xs text-[#004d40] uppercase tracking-wider">
                Send App Feedback
              </h4>

              {feedbackSent ? (
                <div className="p-3 bg-emerald-100/80 rounded-2xl text-emerald-900 text-xs font-bold text-center">
                  Thank you! Your feedback has been sent to our team.
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us what you'd like to see in WaitLess..."
                    className="w-full p-3 bg-white/70 rounded-2xl border border-white/80 text-xs text-[#191c1b] focus:outline-none focus:ring-2 focus:ring-[#004d40]"
                  />
                  <button
                    onClick={() => {
                      if (feedbackText.trim()) {
                        setFeedbackSent(true);
                        setFeedbackText("");
                        setTimeout(() => setFeedbackSent(false), 4000);
                      }
                    }}
                    className="w-full py-2 bg-[#004d40] hover:bg-[#00342b] text-white text-xs font-bold rounded-xl shadow transition-all"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 text-center text-[11px] text-[#707975]">
              WaitLess App Version <span className="font-bold">v2.4.0-beta</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: BADGE DETAIL MODAL */}
      {activeModal === "badge_detail" && selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-sm rounded-3xl p-6 relative border border-white/60 shadow-2xl text-center space-y-4">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-[#707975] hover:bg-black/5"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div
              className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-white shadow-xl bg-gradient-to-tr ${selectedBadge.color}`}
            >
              <span className="material-symbols-outlined text-[42px]">
                {selectedBadge.icon}
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-[#00342b] text-lg">
                {selectedBadge.title}
              </h3>
              <p className="text-xs text-[#505a56] mt-1">
                {selectedBadge.description}
              </p>
            </div>

            <div className="p-3 bg-white/60 rounded-2xl border border-white text-xs">
              {selectedBadge.unlocked ? (
                <div className="text-emerald-700 font-bold flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Unlocked on {selectedBadge.date || "August 2026"}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-[#3f4945] text-[11px]">
                    <span>Progress</span>
                    <span>
                      {selectedBadge.progress} / {selectedBadge.maxProgress}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{
                        width: `${Math.round(
                          (selectedBadge.progress / selectedBadge.maxProgress) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-[#004d40] text-white font-bold text-xs rounded-xl hover:bg-[#00342b] transition-all"
            >
              Close Badge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
