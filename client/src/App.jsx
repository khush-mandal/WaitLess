import { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import NearbyScreen from './components/NearbyScreen';
import DetailsScreen from './components/DetailsScreen';
import ReportScreen from './components/ReportScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [isReporting, setIsReporting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [serverStatus, setServerStatus] = useState('Checking server...');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setServerStatus(`Server Connected: ${data.message}`))
      .catch(err => setServerStatus('Server Disconnected'));
  }, []);

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  const handleReport = () => {
    setIsReporting(true);
  };

  const handleCloseReport = () => {
    setIsReporting(false);
  };

  const handleSubmitReport = (mood) => {
    setIsReporting(false);
    handleNavigate('nearby');
    setShowToast(true);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <>
      <div style={{ background: serverStatus.includes('Connected') ? 'var(--low)' : 'var(--high)', color: '#fff', fontSize: '11px', textAlign: 'center', padding: '4px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        {serverStatus}
      </div>
      <div style={{ paddingTop: '20px' }}>
        {currentScreen === 'splash' && <SplashScreen onStart={() => handleNavigate('home')} />}
      {currentScreen === 'home' && <HomeScreen onNavigate={handleNavigate} />}
      {currentScreen === 'nearby' && <NearbyScreen onNavigate={handleNavigate} showToast={showToast} />}
      {currentScreen === 'details' && <DetailsScreen onNavigate={handleNavigate} onReport={handleReport} />}
      
      {isReporting && <ReportScreen onClose={handleCloseReport} onSubmitReport={handleSubmitReport} />}
      </div>
    </>
  );
}

export default App;
