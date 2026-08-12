import React from 'react';

export default function ReportScreen({ onClose, onSubmitReport }) {
  return (
    <div className="screen report">
      <div className="sheet">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <button style={{ background: 'transparent', border: 'none', fontSize: '24px', color: 'var(--text-3)', cursor: 'pointer', padding: 0 }} onClick={onClose}>&times;</button>
        </div>
        <h4>How crowded is it right now?</h4>
        <button className="mood-btn low" onClick={() => onSubmitReport('low')}>
          <span className="mood-ic"></span> Low — plenty of room
        </button>
        <button className="mood-btn medium" onClick={() => onSubmitReport('medium')}>
          <span className="mood-ic"></span> Medium — some wait
        </button>
        <button className="mood-btn high" onClick={() => onSubmitReport('high')}>
          <span className="mood-ic"></span> High — long wait
        </button>
      </div>
    </div>
  );
}
