import React, { useState, useEffect } from 'react';
import { Compass, Moon, Sun, Settings, Monitor, Volume2, Maximize, Minimize } from 'lucide-react';
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

  return (
    <header className="top-bar">
      {/* Left: Compass / Navigation Switcher */}
      <div className="top-bar-left">
        <button
          onClick={() => onPageChange(currentPage === 'standby' ? 'streamdeck' : 'standby')}
          className="glass-pill-btn"
          title="Switch between StandBy View & Stream Deck Grid"
        >
          <div className="icon-badge" style={{ background: currentPage === 'standby' ? 'rgba(56,189,248,0.2)' : 'rgba(244,63,94,0.2)', color: currentPage === 'standby' ? '#38bdf8' : '#f43f5e' }}>
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
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: macSpecs.isConnected ? '#10b981' : '#f59e0b', boxShadow: macSpecs.isConnected ? '0 0 10px #10b981' : 'none' }} />
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
            <div style={{ position: 'absolute', top: '48px', right: 0, background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 16px', borderRadius: '20px', width: '200px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 60, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
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
          style={{ padding: '8px', borderRadius: '50%', background: nightMode ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 255, 255, 0.07)', color: nightMode ? '#f43f5e' : '#ffffff' }}
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
