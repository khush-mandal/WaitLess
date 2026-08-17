/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from "react";
import { INITIAL_PLACES, INITIAL_REPORTS, INITIAL_USER_PROFILE, getPlacesNearLocation } from "./data/initialData";
import { estimateWaitTime } from "./utils/waitEstimation";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { ExploreView } from "./components/ExploreView";
import { MapView } from "./components/MapView";
import { PlaceDetailsView } from "./components/PlaceDetailsView";
import { ReportModal } from "./components/ReportModal";
import { ReportsView } from "./components/ReportsView";
import { PatternsView } from "./components/PatternsView";
import { ProfileView } from "./components/ProfileView";
import { LoginView } from "./components/LoginView";
import { LandingView } from "./components/LandingView";
import { AnalyticsView } from "./components/AnalyticsView";
import { AuthProvider, useAuth } from "./context/AuthContext";

import { useLocation } from "./utils/useLocation";
import { fetchNearbyPlaces } from "./utils/overpassApi";

function AppMain() {
  const { user, token, isAuthenticated, logout } = useAuth();

  const [places, setPlaces] = useState(() => {
    const saved = localStorage.getItem("waitless_places_v2");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
    return [];
  });
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem("waitless_user_profile_v2");
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  // Sync backend user data with local profile state
  useEffect(() => {
    if (user) {
      setUserProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        bio: user.bio || prev.bio,
        avatarUrl: user.avatarUrl || prev.avatarUrl,
        totalPoints: user.points !== undefined ? user.points : prev.totalPoints,
        totalReports: user.reportsCount !== undefined ? user.reportsCount : prev.totalReports,
        timeSavedHours: user.timeSavedHours || prev.timeSavedHours,
        peopleHelped: user.peopleHelped !== undefined ? user.peopleHelped : prev.peopleHelped,
        impactScore: user.impactScore !== undefined ? user.impactScore : prev.impactScore,
      }));
    }
  }, [user]);

  const [userReports, setUserReports] = useState(() => {
    const saved = localStorage.getItem("waitless_user_reports_v2");
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [activeTab, setActiveTab] = useState("explore");
  const [isMapView, setIsMapView] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedSector, setSelectedSector] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTargetPlaceId, setReportTargetPlaceId] = useState(void 0);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [serverStatus, setServerStatus] = useState("Checking server...");
  const [showServerStatus, setShowServerStatus] = useState(true);
  const [showLogin, setShowLogin] = useState(() => {
    return window.location.pathname === '/signup' || window.location.pathname === '/login';
  });

  const { location: userLocation, loading: locationLoading } = useLocation();

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setServerStatus(`Server Connected: ${data.message}`))
      .catch(err => setServerStatus('Server Disconnected'))
      .finally(() => {
        setTimeout(() => setShowServerStatus(false), 5000);
      });
  }, []);

  // Nilokheri, Karnal fallback coordinates
  const NILOKHERI_LAT = 29.8339;
  const NILOKHERI_LON = 76.9201;

  const loadNilokheriFallback = () => {
    setServerStatus("Showing places in Nilokheri, Karnal");
    setShowServerStatus(true);
    const nilokheriSpots = getPlacesNearLocation(NILOKHERI_LAT, NILOKHERI_LON);
    setPlaces(nilokheriSpots);

    // Fetch real OpenStreetMap places in Nilokheri, Karnal
    fetchNearbyPlaces(NILOKHERI_LAT, NILOKHERI_LON, 15000)
      .then((realPlaces) => {
        if (realPlaces && realPlaces.length > 0) {
          setPlaces([...nilokheriSpots, ...realPlaces]);
          setServerStatus(`Loaded ${realPlaces.length} places in Nilokheri, Karnal`);
        }
        setTimeout(() => setShowServerStatus(false), 5000);
      })
      .catch(() => {
        setTimeout(() => setShowServerStatus(false), 5000);
      });
  };

  // Fetch real places when location is resolved (or fallback to Nilokheri, Karnal)
  useEffect(() => {
    if (!locationLoading) {
      if (userLocation && userLocation.latitude && userLocation.longitude) {
        const userLat = userLocation.latitude;
        const userLon = userLocation.longitude;

        setServerStatus("Fetching nearby places around your location...");
        setShowServerStatus(true);

        fetchNearbyPlaces(userLat, userLon, 10000)
          .then((realPlaces) => {
            if (realPlaces && realPlaces.length > 0) {
              // Successfully fetched real places around user location
              const fallbackUser = getPlacesNearLocation(userLat, userLon);
              setPlaces([...fallbackUser, ...realPlaces]);
              setServerStatus(`Loaded ${realPlaces.length} real places near you!`);
            } else {
              // No places found around user location -> Fallback to Nilokheri, Karnal
              console.warn("No places found near user location. Falling back to Nilokheri, Karnal.");
              loadNilokheriFallback();
            }
            setTimeout(() => setShowServerStatus(false), 5000);
          })
          .catch((err) => {
            console.error("Error fetching places near user location:", err);
            // Error finding places -> Fallback to Nilokheri, Karnal
            loadNilokheriFallback();
          });
      } else {
        // Location not enabled or denied -> Fallback to Nilokheri, Karnal
        loadNilokheriFallback();
      }
    }
  }, [userLocation, locationLoading]);


  useEffect(() => {
    localStorage.setItem("waitless_places_v2", JSON.stringify(places));
  }, [places]);
  useEffect(() => {
    localStorage.setItem("waitless_user_profile_v2", JSON.stringify(userProfile));
  }, [userProfile]);
  useEffect(() => {
    localStorage.setItem("waitless_user_reports_v2", JSON.stringify(userReports));
  }, [userReports]);

  const handleSubmitReport = async (placeId, level) => {
    const pointsToAdd = level === "medium" ? 15 : 10;
    const targetPlace = places.find((p) => p.id === placeId);
    const placeName = targetPlace ? targetPlace.name : "Local Venue";

    // Send report to Node.js backend API
    try {
      fetch("/api/reports", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          placeId,
          placeName,
          crowdLevel: level === "high" ? "High" : level === "medium" ? "Moderate" : "Low",
          waitTimeMins: level === "high" ? 25 : level === "medium" ? 15 : 5
        })
      }).catch(err => console.error("Report sync error:", err));
    } catch (e) {
      console.warn("Failed to reach /api/reports:", e);
    }

    setPlaces(
      (prevPlaces) => prevPlaces.map((p) => {
        if (p.id === placeId) {
          const { waitMin, label } = estimateWaitTime(level, p.hourlyCrowd);
          return {
            ...p,
            crowdLevel: level,
            statusLabel: label,
            currentWaitMin: waitMin,
            confidence: Math.min(100, p.confidence + 5),
            reportsCount: p.reportsCount + 1,
            updatedAt: Date.now()
          };
        }
        return p;
      })
    );
    const newReport = {
      id: `rep-${Date.now()}`,
      placeId,
      placeName,
      sector: targetPlace ? targetPlace.sector : "hospitality",
      crowdLevel: level,
      timestamp: "Just now",
      pointsEarned: pointsToAdd,
      iconName: targetPlace?.sector === "retail" ? "shopping_cart" : "storefront"
    };
    setUserReports((prev) => [newReport, ...prev]);
    setUserProfile((prev) => {
      let newTimeSaved = prev.timeSavedHours || "0h 0m";
      let hours = parseInt(newTimeSaved.match(/(\d+)h/)?.[1] || 0);
      let mins = parseInt(newTimeSaved.match(/(\d+)m/)?.[1] || 0);
      mins += 5; // Add 5 mins per report for dynamic feedback
      if (mins >= 60) {
        hours += Math.floor(mins / 60);
        mins = mins % 60;
      }
      return {
        ...prev,
        totalPoints: prev.totalPoints + pointsToAdd,
        weeklyPoints: prev.weeklyPoints + pointsToAdd,
        reportsThisWeek: prev.reportsThisWeek + 1,
        totalReports: prev.totalReports + 1,
        peopleHelped: prev.peopleHelped + 45,
        impactScore: Math.min(100, prev.impactScore + 1),
        timeSavedHours: `${hours}h ${mins}m`
      };
    });
  };
  const handleOpenReportModal = (placeId) => {
    setReportTargetPlaceId(placeId);
    setIsReportModalOpen(true);
  };
  const handleResetStats = () => {
    setPlaces([]);
    setUserProfile(INITIAL_USER_PROFILE);
    setUserReports([]);
    localStorage.removeItem("waitless_places_v2");
    localStorage.removeItem("waitless_user_profile_v2");
    localStorage.removeItem("waitless_user_reports_v2");
    localStorage.removeItem("waitless_auth_v2");
    setShowLogin(true);
  };

  if (!isAuthenticated) {
    return (
      <>
        {showServerStatus && (
          <div style={{ background: serverStatus.includes('Connected') || serverStatus.includes('Loaded') ? '#00342b' : '#F44336', color: '#fff', fontSize: '11px', textAlign: 'center', padding: '4px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000 }}>
            {serverStatus}
          </div>
        )}
        {!showLogin ? (
          <LandingView onGetStarted={() => setShowLogin(true)} />
        ) : (
          <div className="min-h-screen mesh-bg text-[#191c1b] flex flex-col font-[#Inter] selection:bg-[#afefdd] selection:text-[#00201a]">
            <div className="absolute top-6 left-6 z-50">
              <button 
                onClick={() => setShowLogin(false)}
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/80 transition-all shadow-md text-[#004d40]"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            </div>
            <LoginView onLogin={() => {
              localStorage.setItem("waitless_auth_v2", "true");
            }} />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen mesh-bg text-[#191c1b] flex flex-col font-[#Inter] selection:bg-[#afefdd] selection:text-[#00201a]">
    {showServerStatus && (
      <div style={{ background: serverStatus.includes('Connected') || serverStatus.includes('Loaded') ? '#00342b' : '#F44336', color: '#fff', fontSize: '11px', textAlign: 'center', padding: '4px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000 }}>
        {serverStatus}
      </div>
    )}
    {
      /* Top Header */
    }
    <Header
      activeTab={activeTab}
      setActiveTab={(tab) => {
        setActiveTab(tab);
        setSelectedPlace(null);
      }}
      isMapView={isMapView}
      setIsMapView={(map) => {
        setIsMapView(map);
        if (map) setActiveTab("explore");
      }}
      unreadNotifications={unreadNotifications}
      onNotificationClick={() => {
        setUnreadNotifications(false);
        setShowNotificationToast(true);
      }}
    />

    {
      /* Main View Area */
    }
    <div className="flex-1 relative">
      {
        /* If a place detail is opened */
      }
      {selectedPlace ? <PlaceDetailsView
        place={selectedPlace}
        allPlaces={places}
        onBack={() => setSelectedPlace(null)}
        onSelectPlace={(place) => setSelectedPlace(place)}
        onOpenReportModal={(placeId) => handleOpenReportModal(placeId)}
      /> : activeTab === "explore" ? isMapView ? <MapView
        places={places}
        onSelectPlace={(place) => setSelectedPlace(place)}
        selectedSector={selectedSector}
        setSelectedSector={setSelectedSector}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenReportModal={(placeId) => handleOpenReportModal(placeId)}
        userLocation={userLocation}
      /> : <ExploreView
        places={places}
        userProfile={userProfile}
        selectedSector={selectedSector}
        setSelectedSector={setSelectedSector}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectPlace={(place) => setSelectedPlace(place)}
        onOpenReportModal={(placeId) => handleOpenReportModal(placeId)}
        onNavigateToReports={() => setActiveTab("reports")}
      /> : activeTab === "reports" ? <ReportsView
        userProfile={userProfile}
        userReports={userReports}
        onOpenReportModal={() => handleOpenReportModal()}
      /> : activeTab === "patterns" ? <PatternsView places={places} onSelectPlace={(place) => setSelectedPlace(place)} /> : activeTab === "profile" ? <ProfileView
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        places={places}
        onSelectPlace={(place) => setSelectedPlace(place)}
        onLogout={() => {
          localStorage.removeItem("waitless_auth_v2");
          localStorage.removeItem("waitless_jwt_token");
          localStorage.removeItem("waitless_refresh_token");
          setShowLogin(true);
        }}
        onResetStats={handleResetStats}
      /> : null}
    </div>

    {
      /* Mobile Bottom Navigation */
    }
    {!selectedPlace && <BottomNav
      activeTab={activeTab}
      setActiveTab={(tab) => {
        setActiveTab(tab);
        setSelectedPlace(null);
      }}
      setIsMapView={setIsMapView}
    />}

    {
      /* Report Modal */
    }
    <ReportModal
      isOpen={isReportModalOpen}
      onClose={() => setIsReportModalOpen(false)}
      places={places}
      preselectedPlaceId={reportTargetPlaceId}
      onSubmitReport={handleSubmitReport}
    />

      {/* Notifications Toast */}
      {showNotificationToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full glass-card rounded-2xl p-4 shadow-2xl border border-white/60 animate-slide-up">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-[#00342b] font-bold text-sm">
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
              WaitLess Alerts
            </div>
            <button
              onClick={() => setShowNotificationToast(false)}
              className="text-[#707975] hover:text-[#191c1b] p-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
          <p className="text-xs text-[#3f4945] font-medium leading-relaxed">
            ⚡ <strong>The Roasted Bean</strong> is currently <strong>Not Busy (0m wait)</strong>! Great time to grab coffee nearby.
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => {
                setShowNotificationToast(false);
                const place = places.find((p) => p.name.includes("Roasted"));
                if (place) setSelectedPlace(place);
              }}
              className="px-3 py-1.5 bg-[#004d40] text-white text-xs font-bold rounded-lg hover:bg-[#00342b] transition-all"
            >
              View Spot
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppMain />
    </AuthProvider>
  );
}
