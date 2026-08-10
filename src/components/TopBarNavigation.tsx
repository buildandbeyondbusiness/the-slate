import React, { useState, useEffect } from 'react';
import { Compass, Moon, Sun, Settings, Monitor, Volume2, Maximize, Minimize, Zap, Battery } from 'lucide-react';
import { ViewPage, MacSystemSpecs } from '../types';

interface TopBarProps {
  currentPage: ViewPage;
  onPageChange: (page: ViewPage) => void;
  nightMode: boolean;
  onToggleNightMode: () => void;
  onOpenSettings: () => void;
  macSpecs: MacSystemSpecs;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export const TopBarNavigation: React.FC<TopBarProps> = ({
  currentPage,
  onPageChange,
  nightMode,
  onToggleNightMode,
  onOpenSettings,
  macSpecs,
  volume,
  onVolumeChange
}) => {
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
      setDateString(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Apple Watch Ultra Circular Battery Widget Logic
  const battLevel = macSpecs.batteryLevel ?? 80;
  const isCharging = macSpecs.isCharging ?? true;
  const isLowPower = macSpecs.isLowPower ?? (battLevel <= 20);

  // Dynamic Color
  let ringColor = '#34c759'; // Apple Green
  if (isCharging) {
    ringColor = '#34c759'; // Apple Green
  } else if (battLevel <= 15) {
    ringColor = '#ef4444'; // Red
  } else if (isLowPower || battLevel <= 20) {
    ringColor = '#f59e0b'; // Amber Yellow
  }

  // SVG Circumference math (r = 13, circumference = 2 * PI * 13 = 81.68)
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (battLevel / 100) * circumference;

  return (
    <header className="top-bar">
      {/* Left: Compass / Navigation Switcher */}
      <div className="top-bar-left">
        <button
          onClick={() => onPageChange(currentPage === 'standby' ? 'streamdeck' : 'standby')}
          className="glass-pill-btn"
          title="Switch between StandBy View & Stream Deck Grid"
        >
          <div className="icon-badge" style={{ background: currentPage === 'standby' ? 'rgba(224,168,78,0.2)' : 'rgba(105,197,138,0.2)', color: currentPage === 'standby' ? '#E0A84E' : '#69C58A' }}>
            <Compass style={{ width: '18px', height: '18px' }} />
          </div>
          <span>{currentPage === 'standby' ? 'Standby Screen' : 'Stream Deck'}</span>
        </button>

        {/* Dots */}
        <div className="page-dots">
          <button onClick={() => onPageChange('standby')} className={`dot ${currentPage === 'standby' ? 'active' : ''}`} />
          <button onClick={() => onPageChange('streamdeck')} className={`dot ${currentPage === 'streamdeck' ? 'active' : ''}`} />
        </div>
      </div>

      {/* Center: Time & Date */}
      <div className="top-bar-center">
        <span className="time-title">{timeString}</span>
        <span className="date-subtitle">{dateString}</span>
      </div>

      {/* Right Controls */}
      <div className="top-bar-right">
        
        {/*  APPLE WATCH ULTRA CIRCULAR BATTERY WIDGET (USER PHOTO MATCH!) */}
        <button
          onClick={onOpenSettings}
          className="glass-pill-btn"
          style={{ padding: '4px 12px', height: '38px', borderRadius: '9999px', border: `1px solid ${ringColor}40`, background: 'rgba(23, 26, 29, 0.7)' }}
          title={`Mac Battery: ${battLevel}% ${isCharging ? '(Charging ⚡)' : isLowPower ? '(Low Power Mode 🟡)' : ''}`}
        >
          <div style={{ position: 'relative', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background Ring Track */}
              <circle
                cx="16"
                cy="16"
                r={radius}
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="3.5"
              />
              {/* Active Battery Progress Ring */}
              <circle
                cx="16"
                cy="16"
                r={radius}
                fill="transparent"
                stroke={ringColor}
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease',
                  filter: `drop-shadow(0 0 4px ${ringColor})`
                }}
              />
            </svg>

            {/* Center Icon */}
            <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isCharging ? (
                <Zap style={{ width: '13px', height: '13px', color: ringColor, fill: ringColor }} />
              ) : (
                <span style={{ fontSize: '0.62rem', fontWeight: 900, color: ringColor, fontFamily: '"Outfit", sans-serif' }}>
                  {battLevel}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '4px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#F1F3F4', lineHeight: 1 }}>{battLevel}%</span>
            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: ringColor, marginTop: '2px' }}>
              {isCharging ? 'CHARGING' : isLowPower ? 'LOW POWER' : 'BATTERY'}
            </span>
          </div>
        </button>

        {/* Fullscreen Toggle Button */}
        <button
          id="fullscreen-btn"
          onClick={toggleFullscreen}
          className="glass-pill-btn"
          style={{ padding: '8px', borderRadius: '50%', background: isFullscreen ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.07)' }}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Kiosk Mode'}
        >
          {isFullscreen ? (
            <Minimize style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
          ) : (
            <Maximize style={{ width: '16px', height: '16px', color: '#ffffff' }} />
          )}
        </button>

        {/* Mac Status Badge */}
        <button
          onClick={onOpenSettings}
          className="glass-pill-btn"
          title={macSpecs.isConnected ? `Connected to ${macSpecs.macName}` : 'Click to connect Mac Companion Server'}
        >
          <Monitor style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: macSpecs.isConnected ? '#69C58A' : '#E0A84E', boxShadow: macSpecs.isConnected ? '0 0 10px #69C58A' : 'none' }} />
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{macSpecs.isConnected ? 'Mac Live' : 'Simulated'}</span>
        </button>

        {/* Volume Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="glass-pill-btn"
            style={{ padding: '8px', borderRadius: '50%' }}
            title="Adjust Master Volume"
          >
            <Volume2 style={{ width: '16px', height: '16px' }} />
          </button>

          {showVolumeSlider && (
            <div style={{ position: 'absolute', top: '48px', right: 0, background: '#171A1D', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 16px', borderRadius: '20px', width: '200px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 60, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <Volume2 style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, width: '32px' }}>{volume}%</span>
            </div>
          )}
        </div>

        {/* StandBy Night Mode Button */}
        <button
          onClick={onToggleNightMode}
          className="glass-pill-btn"
          style={{ padding: '8px', borderRadius: '50%', background: nightMode ? 'rgba(217, 108, 108, 0.3)' : 'rgba(255, 255, 255, 0.07)', color: nightMode ? '#D96C6C' : '#ffffff' }}
          title="Toggle StandBy Night Red Mode"
        >
          {nightMode ? <Moon style={{ width: '16px', height: '16px' }} /> : <Sun style={{ width: '16px', height: '16px' }} />}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="glass-pill-btn"
          style={{ padding: '8px', borderRadius: '50%' }}
          title="Open Settings"
        >
          <Settings style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
    </header>
  );
};
