import React from 'react';

export default function HomeScreen({ onNavigate }) {
  return (
    <div className="screen">
      <div className="app-greet">Good afternoon</div>
      <div className="app-title">Where are you headed?</div>
      <div className="search">
        <span>🔍</span> Search a place or category
      </div>
      
      <div className="label-sm">Browse by sector</div>
      <div className="chips">
        <div className="chip c1" onClick={() => onNavigate('nearby')}><div className="ic">🍽️</div>Hospitality</div>
        <div className="chip c2" onClick={() => onNavigate('nearby')}><div className="ic">🏦</div>Finance</div>
        <div className="chip c3" onClick={() => onNavigate('nearby')}><div className="ic">🛍️</div>Retail</div>
        <div className="chip c4" onClick={() => onNavigate('nearby')}><div className="ic">🎬</div>Entertainment</div>
      </div>
      
      <div className="label-sm">Nearby now</div>
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
    </div>
  );
}
