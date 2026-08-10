import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Cpu, Music, Sun, Bell, Maximize2 } from 'lucide-react';
import { MacSystemSpecs, MediaTrackState, ClockStyle } from '../types';

interface StandbyScreenProps {
  macSpecs: MacSystemSpecs;
  mediaState: MediaTrackState;
  clockStyle: ClockStyle;
  clockColor: string;
  onClockStyleChange: (style: ClockStyle) => void;
  onOpenMusicModal: () => void;
  onTogglePlayPause: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeek: (seconds: number) => void;
  onNavigateToStreamDeck: () => void;
}

export const StandbyScreen: React.FC<StandbyScreenProps> = ({
  macSpecs,
  mediaState,
  clockStyle,
  clockColor = '#E0A84E',
  onClockStyleChange,
  onOpenMusicModal,
  onTogglePlayPause,
  onNextTrack,
  onPrevTrack,
  onSeek,
  onNavigateToStreamDeck,
}) => {
  const [hours, setHours] = useState('05');
  const [minutes, setMinutes] = useState('13');
  const [ampmStr, setAmpmStr] = useState('PM');
  const [dateStr, setDateStr] = useState('');
  const [dayAbbr, setDayAbbr] = useState('WED');
  const [dayNum, setDayNum] = useState('26');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const rawHours = now.getHours();
      const mins = now.getMinutes();
      const ampm = rawHours >= 12 ? 'PM' : 'AM';
      const displayHours = rawHours % 12 || 12;

      const hStr = String(displayHours).padStart(2, '0');
      const mStr = String(mins).padStart(2, '0');

      setHours(hStr);
      setMinutes(mStr);
      setAmpmStr(ampm);
      setDateStr(
        now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
      );
      setDayAbbr(now.toLocaleDateString([], { weekday: 'short' }).toUpperCase());
      setDayNum(String(now.getDate()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const renderClockDisplay = () => {
    switch (clockStyle) {
      // 1. Apple iOS 17 Curvy Organic Serif Numeral Clock (PROPERLY SCALED GIANT CLOCK)
      case 'curvy-apple':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', lineHeight: 0.9 }}>
              <span style={{ fontSize: '9.8rem', fontWeight: 900, color: clockColor, fontFamily: '"New York", "Georgia", serif', fontStyle: 'italic', letterSpacing: '-5px' }}>
                {parseInt(hours)}
              </span>
              <span style={{ fontSize: '7rem', fontWeight: 700, color: '#8B9299', margin: '0 4px', transform: 'translateY(-8px)' }}>:</span>
              <span style={{ fontSize: '9.8rem', fontWeight: 900, color: '#F1F3F4', fontFamily: '"New York", "Georgia", serif', letterSpacing: '-5px' }}>
                {minutes}
              </span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: clockColor, marginTop: '16px', letterSpacing: '0.5px' }}>
              {dateStr}
            </div>
          </div>
        );

      // 2. Apple iOS StandBy Translucent Pill Capsules Clock
      case 'pill-blocks':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: `1px solid ${clockColor}50`, borderRadius: '32px', padding: '16px 28px', backdropFilter: 'blur(20px)', boxShadow: '0 12px 32px rgba(0,0,0,0.45)' }}>
                <span style={{ fontSize: '7.2rem', fontWeight: 900, color: clockColor, letterSpacing: '-3px', lineHeight: 1, fontFamily: '"Outfit", sans-serif' }}>
                  {hours}
                </span>
              </div>

              <span style={{ fontSize: '4rem', fontWeight: 900, color: '#8B9299' }}>:</span>

              <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '32px', padding: '16px 28px', backdropFilter: 'blur(20px)', boxShadow: '0 12px 32px rgba(0,0,0,0.45)' }}>
                <span style={{ fontSize: '7.2rem', fontWeight: 900, color: '#F1F3F4', letterSpacing: '-3px', lineHeight: 1, fontFamily: '"Outfit", sans-serif' }}>
                  {minutes}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: clockColor, marginTop: '20px' }}>
              {dateStr}
            </div>
          </div>
        );

      // 3. Apple StandBy Hero Clock
      case 'minimal-hero':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', width: '100%', padding: '0 10px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontSize: '9.5rem', fontWeight: 900, color: '#F1F3F4', letterSpacing: '-6px', lineHeight: 0.9, fontFamily: '"Outfit", sans-serif' }}>
                {parseInt(hours)}:{minutes}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', paddingLeft: '24px', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: clockColor, letterSpacing: '0.5px' }}>
                  {dayAbbr} {dayNum}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 700, color: '#F1F3F4', marginTop: '4px' }}>
                  <span>30°</span>
                  <Sun style={{ width: '20px', height: '20px', color: clockColor }} />
                </div>
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid #2A2F34' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: clockColor }}>
                  <Bell style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F1F3F4' }}>8:00AM</span>
                </div>
              </div>
            </div>
          </div>
        );

      // 4. Apple StandBy Playful Multi-Color Block Clock
      case 'playful-colors':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', lineHeight: 0.9 }}>
              <span style={{ fontSize: '9.8rem', fontWeight: 900, color: clockColor, fontFamily: '"Outfit", sans-serif', letterSpacing: '-4px' }}>
                {hours[0]}
              </span>
              <span style={{ fontSize: '9.8rem', fontWeight: 900, color: '#F4D28A', fontFamily: '"Outfit", sans-serif', letterSpacing: '-4px' }}>
                {hours[1]}
              </span>
              <span style={{ fontSize: '7rem', fontWeight: 900, color: '#8B9299', margin: '0 4px', transform: 'translateY(-8px)' }}>
                :
              </span>
              <span style={{ fontSize: '9.8rem', fontWeight: 900, color: '#69C58A', fontFamily: '"Outfit", sans-serif', letterSpacing: '-4px' }}>
                {minutes[0]}
              </span>
              <span style={{ fontSize: '9.8rem', fontWeight: 900, color: '#F1F3F4', fontFamily: '"Outfit", sans-serif', letterSpacing: '-4px' }}>
                {minutes[1]}
              </span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: clockColor, marginTop: '12px' }}>
              {dateStr}
            </div>
          </div>
        );

      // 5. Stacked Big Numerals
      case 'stacked':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', width: '100%', padding: '0 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.82 }}>
              <span style={{ fontSize: '7.8rem', fontWeight: 900, color: '#F1F3F4', letterSpacing: '-4px' }}>{hours}</span>
              <span style={{ fontSize: '7.8rem', fontWeight: 900, color: clockColor, letterSpacing: '-4px' }}>{minutes}</span>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#F4D28A', textTransform: 'uppercase', letterSpacing: '2px' }}>{ampmStr}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#8B9299' }}>{dateStr}</span>
            </div>
          </div>
        );

      // 6. Apple World Clock
      case 'world':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', width: '100%', padding: '0 12px' }}>
            <div className="clock-hero-time" style={{ fontSize: '6rem', lineHeight: 1 }}>
              <span>{hours}:{minutes}</span>
              <span className="clock-hero-ampm" style={{ fontSize: '1.4rem' }}>{ampmStr}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #2A2F34' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: clockColor, textTransform: 'uppercase' }}>CUPERTINO</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#F1F3F4', marginTop: '4px' }}>
                  {String((parseInt(hours) + 15) % 12 || 12).padStart(2, '0')}:{minutes}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#69C58A', textTransform: 'uppercase' }}>LONDON</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#F1F3F4', marginTop: '4px' }}>
                  {String((parseInt(hours) + 5) % 12 || 12).padStart(2, '0')}:{minutes}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#F4D28A', textTransform: 'uppercase' }}>TOKYO</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#F1F3F4', marginTop: '4px' }}>
                  {String((parseInt(hours) + 14) % 12 || 12).padStart(2, '0')}:{minutes}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="standby-grid">
      {/* ======================================================== */}
      {/* LEFT PANEL: Clean, Uncluttered Pure Apple Hero Clock    */}
      {/* ======================================================== */}
      <div 
        className="glass-card hero-clock-card"
        style={{ padding: '32px 36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {renderClockDisplay()}
      </div>

      {/* ======================================================== */}
      {/* RIGHT PANEL: Stacked Widgets                             */}
      {/* ======================================================== */}
      <div className="standby-right-stack">
        
        {/* Mac Specs Widget */}
        <div className="glass-card mac-specs-card">
          <div className="widget-header">
            <div className="widget-title">
              <Cpu style={{ width: '20px', height: '20px', color: clockColor }} />
              <span>Mac Specs & Health</span>
            </div>
            <span className="badge-pill">{macSpecs.macName}</span>
          </div>

          <div className="spec-list">
            {/* CPU */}
            <div>
              <div className="spec-item-header">
                <span style={{ color: '#8B9299' }}>CPU Usage</span>
                <span style={{ color: clockColor }}>{macSpecs.cpuUsage}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill fill-cpu" style={{ width: `${macSpecs.cpuUsage}%` }} />
              </div>
            </div>

            {/* GPU */}
            <div>
              <div className="spec-item-header">
                <span style={{ color: '#8B9299' }}>GPU Pressure</span>
                <span style={{ color: '#F4D28A' }}>{macSpecs.gpuUsage}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill fill-gpu" style={{ width: `${macSpecs.gpuUsage}%` }} />
              </div>
            </div>

            {/* Memory */}
            <div>
              <div className="spec-item-header">
                <span style={{ color: '#8B9299' }}>Memory</span>
                <span style={{ color: '#69C58A' }}>{macSpecs.memoryUsedGB} GB / {macSpecs.memoryTotalGB} GB ({macSpecs.memoryPercentage}%)</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill fill-mem" style={{ width: `${macSpecs.memoryPercentage}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Music Player Widget */}
        <div 
          onClick={onOpenMusicModal}
          className="glass-card music-player-card"
          style={{ cursor: 'pointer', transition: 'transform 0.2s ease, border-color 0.2s ease' }}
          title="Click to open Fullscreen CarPlay Music Player"
        >
          <div className="widget-header">
            <div className="widget-title">
              <Music style={{ width: '20px', height: '20px', color: clockColor }} />
              <span>Now Playing</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge-pill" style={{ background: `${clockColor}20`, color: clockColor }}>{mediaState.sourceApp}</span>
              <Maximize2 style={{ width: '14px', height: '14px', color: '#8B9299' }} />
            </div>
          </div>

          <div className="music-content">
            <div className="album-art-box">
              <img src={mediaState.albumArt} alt={mediaState.trackName} />
            </div>

            <div className="track-details">
              <div className="track-name">{mediaState.trackName}</div>
              <div className="artist-name" style={{ color: clockColor }}>{mediaState.artist}</div>

              <div className="media-controls-row">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrevTrack();
                  }} 
                  className="ctrl-btn" 
                  title="Previous Track"
                >
                  <SkipBack style={{ width: '18px', height: '18px' }} />
                </button>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePlayPause();
                  }} 
                  className="play-btn" 
                  style={{ background: clockColor }}
                  title={mediaState.isPlaying ? 'Pause' : 'Play'}
                >
                  {mediaState.isPlaying ? (
                    <Pause style={{ width: '18px', height: '18px', fill: 'currentColor' }} />
                  ) : (
                    <Play style={{ width: '18px', height: '18px', fill: 'currentColor', marginLeft: '2px' }} />
                  )}
                </button>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onNextTrack();
                  }} 
                  className="ctrl-btn" 
                  title="Next Track"
                >
                  <SkipForward style={{ width: '18px', height: '18px' }} />
                </button>
              </div>
            </div>
          </div>

          <div className="seekbar-container">
            <input
              type="range"
              min="0"
              max={mediaState.durationSeconds || 180}
              value={mediaState.positionSeconds || 0}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onSeek(Number(e.target.value))}
            />
            <div className="seekbar-timestamps">
              <span>{formatSeconds(mediaState.positionSeconds)}</span>
              <span>{formatSeconds(mediaState.durationSeconds)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
