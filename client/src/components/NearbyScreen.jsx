import React from 'react';

export default function NearbyScreen({ onNavigate, showToast }) {
  return (
    <div className="screen" style={{ position: 'relative' }}>
      <div className="header-back" onClick={() => onNavigate('home')}>
        <span>←</span> Back
      </div>
      
      <div className="app-title">Hospitality nearby</div>
      
      <div className="place-card" onClick={() => onNavigate('details')}>
        <div className="place-top">
          <span className="place-name">Spice Route</span>
          <span className="badge high">High</span>
        </div>
        <div className="place-meta">~24 min wait · 0.6 km</div>
        <div className="place-conf">
          <span className="live-dot high pulse"></span> High confidence · updated 2m ago
        </div>
      </div>
      
      <div className="place-card" onClick={() => onNavigate('details')}>
        <div className="place-top">
          <span className="place-name">Cafe Aroma</span>
          <span className="badge low">Low</span>
        </div>
        <div className="place-meta">~6 min wait · 0.4 km</div>
        <div className="place-conf">
          <span className="live-dot low pulse"></span> High confidence · updated 1m ago
        </div>
      </div>
      
      <div className="place-card" onClick={() => onNavigate('details')}>
        <div className="place-top">
          <span className="place-name">Urban Diner</span>
          <span className="badge medium">Medium</span>
        </div>
        <div className="place-meta">~13 min wait · 0.9 km</div>
        <div className="place-conf">
          <span className="live-dot medium pulse"></span> Medium confidence · updated 5m ago
        </div>
      </div>
      
      {showToast && (
        <div className="toast">
          <span className="live-dot low pulse"></span> Thanks — your report just updated the live data
        </div>
      )}
    </div>
  );
}
