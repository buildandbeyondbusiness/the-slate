import React, { useState, useEffect } from 'react';
import { Compass, Moon, Sun, Settings, Monitor, Volume2, Wifi, WifiOff } from 'lucide-react';
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
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full h-16 px-6 flex items-center justify-between backdrop-blur-xl bg-white/5 border-b border-white/10 z-40">
      {/* Left: Compass / Navigation Page Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(currentPage === 'standby' ? 'streamdeck' : 'standby')}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full glass-pill hover:bg-white/20 transition-all duration-300 group"
          title="Switch between StandBy View & Stream Deck Grid"
        >
          <div className={`p-1.5 rounded-full ${currentPage === 'standby' ? 'bg-sky-500/20 text-sky-400' : 'bg-rose-500/20 text-rose-400'} transition-transform group-hover:rotate-45 duration-500`}>
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold tracking-wide">
            {currentPage === 'standby' ? 'Standby Screen' : 'Stream Deck'}
          </span>
        </button>

        {/* Page Dots Indicator */}
        <div className="flex items-center gap-1.5 ml-2">
          <button
            onClick={() => onPageChange('standby')}
            className={`w-2.5 h-2.5 rounded-full transition-all ${currentPage === 'standby' ? 'w-6 bg-sky-400' : 'bg-white/30'}`}
          />
          <button
            onClick={() => onPageChange('streamdeck')}
            className={`w-2.5 h-2.5 rounded-full transition-all ${currentPage === 'streamdeck' ? 'w-6 bg-rose-400' : 'bg-white/30'}`}
          />
        </div>
      </div>

      {/* Center: Clock & Date */}
      <div className="flex flex-col items-center">
        <span className="text-lg font-bold tracking-tight text-white/90 drop-shadow">
          {timeString}
        </span>
        <span className="text-[11px] font-medium text-slate-400 -mt-1 tracking-wider uppercase">
          {dateString}
        </span>
      </div>

      {/* Right Controls: Mac Status, Volume, Night Mode, Settings */}
      <div className="flex items-center gap-3">
        {/* Mac Connectivity Indicator */}
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition"
          onClick={onOpenSettings}
          title={macSpecs.isConnected ? `Connected to ${macSpecs.macName}` : 'Click to connect Mac Companion Server'}
        >
          <Monitor className="w-4 h-4 text-slate-400" />
          <span className="relative flex h-2 w-2">
            {macSpecs.isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="inline-flex rounded-full h-2 w-2 bg-amber-500 animate-pulse"></span>
            )}
          </span>
          <span className="text-xs text-slate-300 font-medium hidden md:inline">
            {macSpecs.isConnected ? 'Mac Live' : 'Simulated'}
          </span>
        </div>

        {/* Volume Quick Control */}
        <div className="relative flex items-center">
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="p-2 rounded-full glass-pill hover:bg-white/20 transition text-slate-300"
            title="Adjust Master Volume"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {showVolumeSlider && (
            <div className="absolute top-12 right-0 bg-slate-900/90 backdrop-blur-xl border border-white/15 p-3 rounded-2xl shadow-2xl flex items-center gap-3 w-48 z-50 animate-in fade-in slide-in-from-top-2">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-full accent-sky-400"
              />
              <span className="text-xs text-slate-300 font-semibold w-6">{volume}%</span>
            </div>
          )}
        </div>

        {/* Night Mode Toggle */}
        <button
          onClick={onToggleNightMode}
          className={`p-2 rounded-full transition-all duration-300 ${nightMode ? 'bg-rose-500/30 text-rose-400 border border-rose-500/50 shadow-lg shadow-rose-500/20' : 'glass-pill hover:bg-white/20 text-slate-300'}`}
          title="Toggle StandBy Night Red Mode"
        >
          {nightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full glass-pill hover:bg-white/20 transition text-slate-300"
          title="Open Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
