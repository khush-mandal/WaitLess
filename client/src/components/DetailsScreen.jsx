import React from 'react';

export default function DetailsScreen({ onNavigate, onReport }) {
  return (
    <div className="screen">
      <div className="header-back" onClick={() => onNavigate('nearby')}>
        <span>←</span> Back
      </div>

      <div className="detail-hero">
        <div className="place-top">
          <span className="place-name">Spice Route</span>
          <span className="badge high">High</span>
        </div>
        <div className="wait-num">18–24 min</div>
        <div className="wait-sub">Estimated wait · 84% confidence</div>
      </div>
      
      <div className="card-block">
        <div className="label-sm">Best time today</div>
        <div className="besttime">3:00 – 4:00 PM</div>
      </div>
      
      <div className="card-block">
        <div className="label-sm">Smart alternative</div>
        <div className="alt-card">
          <div className="alt-top">
            <span className="place-name">Cafe Aroma</span>
            <span className="alt-save">Save ~18 min</span>
          </div>
          <div className="place-meta" style={{ margin: '6px 0 0' }}>
            Low crowd · 0.4 km away
          </div>
        </div>
      </div>
      
      <button className="report-btn" onClick={onReport}>
        Report crowd now
      </button>
    </div>
  );
}
