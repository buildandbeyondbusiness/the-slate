import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Cpu, Music, Compass, Activity } from 'lucide-react';
import { MacSystemSpecs, MediaTrackState } from '../types';

interface StandbyScreenProps {
  macSpecs: MacSystemSpecs;
  mediaState: MediaTrackState;
  onTogglePlayPause: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeek: (seconds: number) => void;
  onNavigateToStreamDeck: () => void;
}

export const StandbyScreen: React.FC<StandbyScreenProps> = ({
  macSpecs,
  mediaState,
  onTogglePlayPause,
  onNextTrack,
  onPrevTrack,
  onSeek,
  onNavigateToStreamDeck,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [ampmStr, setAmpmStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const rawHours = now.getHours();
      const mins = String(now.getMinutes()).padStart(2, '0');
      const ampm = rawHours >= 12 ? 'PM' : 'AM';
      const displayHours = String(rawHours % 12 || 12).padStart(2, '0');
      
      setTimeStr(`${displayHours}:${mins}`);
      setAmpmStr(ampm);
      setDateStr(
        now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
      );
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

  return (
    <div className="standby-grid">
      {/* ======================================================== */}
      {/* LEFT PANEL: Hero Apple Standby Clock (Page 1)            */}
      {/* ======================================================== */}
      <div className="glass-card hero-clock-card">
        {/* Top Row */}
        <div className="card-top-row">
          <span className="standby-tag">Apple Standby Mode</span>
          
          {/* Compass Circle Button (From User Sketch!) */}
          <button
            onClick={onNavigateToStreamDeck}
            className="compass-btn"
            title="Go to Stream Deck Screen (Page 2)"
          >
            <Compass style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {/* Center Hero Clock */}
        <div className="clock-center-display">
          <div className="clock-hero-time">
            <span>{timeStr}</span>
            <span className="clock-hero-ampm">{ampmStr}</span>
          </div>
          <div className="clock-hero-date">{dateStr}</div>
        </div>

        {/* Bottom Row */}
        <div className="card-bottom-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            <span>Samsung Tab Desk Docked</span>
          </div>
          <span>Click Compass or Swipe for Stream Deck</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT PANEL: Stacked Widgets (Page 1)                   */}
      {/* ======================================================== */}
      <div className="standby-right-stack">
        
        {/* Mac Specs Widget (Top Right) */}
        <div className="glass-card mac-specs-card">
          <div className="widget-header">
            <div className="widget-title">
              <Cpu style={{ width: '20px', height: '20px', color: '#38bdf8' }} />
              <span>Mac Specs & Health</span>
            </div>
            <span className="badge-pill">{macSpecs.macName}</span>
          </div>

          <div className="spec-list">
            {/* CPU */}
            <div>
              <div className="spec-item-header">
                <span style={{ color: '#cbd5e1' }}>CPU Usage</span>
                <span style={{ color: '#38bdf8' }}>{macSpecs.cpuUsage}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill fill-cpu" style={{ width: `${macSpecs.cpuUsage}%` }} />
              </div>
            </div>

            {/* GPU */}
            <div>
              <div className="spec-item-header">
                <span style={{ color: '#cbd5e1' }}>GPU Pressure</span>
                <span style={{ color: '#a855f7' }}>{macSpecs.gpuUsage}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill fill-gpu" style={{ width: `${macSpecs.gpuUsage}%` }} />
              </div>
            </div>

            {/* Memory */}
            <div>
              <div className="spec-item-header">
                <span style={{ color: '#cbd5e1' }}>Memory</span>
                <span style={{ color: '#10b981' }}>{macSpecs.memoryUsedGB} GB / {macSpecs.memoryTotalGB} GB ({macSpecs.memoryPercentage}%)</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill fill-mem" style={{ width: `${macSpecs.memoryPercentage}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Music Player Widget (Bottom Right) */}
        <div className="glass-card music-player-card">
          <div className="widget-header">
            <div className="widget-title">
              <Music style={{ width: '20px', height: '20px', color: '#f43f5e' }} />
              <span>Now Playing on Mac</span>
            </div>
            <span className="badge-pill" style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e' }}>{mediaState.sourceApp}</span>
          </div>

          <div className="music-content">
            {/* Album Art Square */}
            <div className="album-art-box">
              <img src={mediaState.albumArt} alt={mediaState.trackName} />
            </div>

            {/* Track Info & Controls */}
            <div className="track-details">
              <div className="track-name">{mediaState.trackName}</div>
              <div className="artist-name">{mediaState.artist}</div>

              <div className="media-controls-row">
                <button onClick={onPrevTrack} className="ctrl-btn" title="Previous Track">
                  <SkipBack style={{ width: '18px', height: '18px' }} />
                </button>

                <button onClick={onTogglePlayPause} className="play-btn" title={mediaState.isPlaying ? 'Pause' : 'Play'}>
                  {mediaState.isPlaying ? (
                    <Pause style={{ width: '18px', height: '18px', fill: 'currentColor' }} />
                  ) : (
                    <Play style={{ width: '18px', height: '18px', fill: 'currentColor', marginLeft: '2px' }} />
                  )}
                </button>

                <button onClick={onNextTrack} className="ctrl-btn" title="Next Track">
                  <SkipForward style={{ width: '18px', height: '18px' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Timeline Seekbar */}
          <div className="seekbar-container">
            <input
              type="range"
              min="0"
              max={mediaState.durationSeconds || 180}
              value={mediaState.positionSeconds || 0}
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
