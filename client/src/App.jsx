/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from "react";
import { INITIAL_PLACES, INITIAL_REPORTS, INITIAL_USER_PROFILE } from "./data/initialData";
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

import { useLocation } from "./utils/useLocation";
import { fetchNearbyPlaces } from "./utils/foursquareApi";

export default function App() {
  const [places, setPlaces] = useState(() => {
    const saved = localStorage.getItem("waitless_places_v2");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.filter(p => p.id && (p.id.startsWith('osm-') || p.id.startsWith('fsq-')));
    }
    return [];
  });
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem("waitless_user_profile_v2");
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });
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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("waitless_auth_v2") === "true";
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

  // Fetch real places when location is available
  useEffect(() => {
    if (userLocation) {
      setServerStatus("Fetching nearby real places (Foursquare)...");
      setShowServerStatus(true);
      fetchNearbyPlaces(userLocation.latitude, userLocation.longitude, 2000).then((realPlaces) => {
        if (realPlaces.length > 0) {
          // Merge real data
          setPlaces(prevPlaces => {
            const existingReal = prevPlaces.filter(p => p.id && (p.id.startsWith('osm-') || p.id.startsWith('fsq-')));
            const existingIds = new Set(existingReal.map(p => p.id));
            const newRealPlaces = realPlaces.filter(p => !existingIds.has(p.id));
            return [...existingReal, ...newRealPlaces];
          });
          setServerStatus(`Loaded ${realPlaces.length} real places nearby!`);
        } else {
          setServerStatus("No nearby places found. (Did you add your Foursquare API Key?)");
        }
        setTimeout(() => setShowServerStatus(false), 5000);
      });
    }
  }, [userLocation]);

  useEffect(() => {
    localStorage.setItem("waitless_places_v2", JSON.stringify(places));
  }, [places]);
  useEffect(() => {
    localStorage.setItem("waitless_user_profile_v2", JSON.stringify(userProfile));
  }, [userProfile]);
  useEffect(() => {
    localStorage.setItem("waitless_user_reports_v2", JSON.stringify(userReports));
  }, [userReports]);

  const handleSubmitReport = (placeId, level) => {
    const pointsToAdd = level === "medium" ? 15 : 10;
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
    const targetPlace = places.find((p) => p.id === placeId);
    const placeName = targetPlace ? targetPlace.name : "Local Venue";
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
    setUserProfile((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints + pointsToAdd,
      weeklyPoints: prev.weeklyPoints + pointsToAdd,
      reportsThisWeek: prev.reportsThisWeek + 1,
      totalReports: prev.totalReports + 1,
      peopleHelped: prev.peopleHelped + 45,
      impactScore: Math.min(100, prev.impactScore + 1)
    }));
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
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen mesh-bg text-[#191c1b] flex flex-col font-[#Inter] selection:bg-[#afefdd] selection:text-[#00201a]">
        {showServerStatus && (
          <div style={{ background: serverStatus.includes('Connected') || serverStatus.includes('Loaded') ? '#00342b' : '#F44336', color: '#fff', fontSize: '11px', textAlign: 'center', padding: '4px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000 }}>
            {serverStatus}
          </div>
        )}
        <LoginView onLogin={() => {
          localStorage.setItem("waitless_auth_v2", "true");
          setIsAuthenticated(true);
        }} />
      </div>
    );
  }

  return <div className="min-h-screen mesh-bg text-[#191c1b] flex flex-col font-[#Inter] selection:bg-[#afefdd] selection:text-[#00201a]">
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
  /> : activeTab === "patterns" ? <PatternsView /> : activeTab === "profile" ? <ProfileView
    userProfile={userProfile}
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

      {
    /* Notifications Toast */
  }
      {showNotificationToast && <div className="fixed top-20 right-4 z-50 max-w-sm w-full glass-card rounded-2xl p-4 shadow-2xl border border-white/60 animate-slide-up">
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
        </div>}
    </div>;
}
