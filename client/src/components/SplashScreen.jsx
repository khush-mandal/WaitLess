import React from 'react';
import logo from '../assets/logo.svg';

export default function SplashScreen({ onStart }) {
  return (
    <div className="screen splash">
      <img src={logo} alt="WaitLess logo" />
      <h3>WaitLess</h3>
      <p>Know the crowd. Predict the wait. Choose better.</p>
      <button className="splash-btn" onClick={onStart}>Get started</button>
    </div>
  );
}
