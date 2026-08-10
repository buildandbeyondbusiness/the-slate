import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Cpu, Music, Compass, Sun, Bell, Maximize2 } from 'lucide-react';
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
  const [seconds, setSeconds] = useState(0);
  const [ampmStr, setAmpmStr] = useState('PM');
  const [dateStr, setDateStr] = useState('');
  const [dayAbbr, setDayAbbr] = useState('WED');
  const [dayNum, setDayNum] = useState('26');
  
  // Analog hands angles
  const [hourAngle, setHourAngle] = useState(0);
  const [minuteAngle, setMinuteAngle] = useState(0);
  const [secondAngle, setSecondAngle] = useState(0);

  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const rawHours = now.getHours();
      const mins = now.getMinutes();
      const secs = now.getSeconds();
      const ampm = rawHours >= 12 ? 'PM' : 'AM';
      const displayHours = rawHours % 12 || 12;

      const hStr = String(displayHours).padStart(2, '0');
      const mStr = String(mins).padStart(2, '0');

      setHours(hStr);
      setMinutes(mStr);
      setSeconds(secs);
      setAmpmStr(ampm);
      setDateStr(
        now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
      );
      setDayAbbr(now.toLocaleDateString([], { weekday: 'short' }).toUpperCase());
      setDayNum(String(now.getDate()));

      // Analog Angles
      setSecondAngle(secs * 6);
      setMinuteAngle(mins * 6 + secs * 0.1);
      setHourAngle((displayHours % 12) * 30 + mins * 0.5);
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

  // Swiping Up / Down on Clock Face to Cycle Clock Styles (Apple Smart Stack)
  const handleClockTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleClockTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY - touchEndY;

    if (Math.abs(diffY) > 35) {
      const styles: ClockStyle[] = ['curvy-apple', 'pill-blocks', 'minimal-hero', 'playful-colors', 'analog', 'stacked', 'world'];
      const currIdx = styles.indexOf(clockStyle);
      if (diffY > 0) {
        const nextStyle = styles[(currIdx + 1) % styles.length];
        onClockStyleChange(nextStyle);
      } else {
        const prevStyle = styles[(currIdx - 1 + styles.length) % styles.length];
        onClockStyleChange(prevStyle);
      }
    }
    setTouchStartY(null);
  };

  const renderClockDisplay = () => {
    switch (clockStyle) {
      // 1. Apple iOS 17 Curvy Organic Serif Numeral Clock
      case 'curvy-apple':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'auto 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', lineHeight: 1 }}>
              <span style={{ fontSize: '7.5rem', fontWeight: 900, color: clockColor, fontFamily: '"New York", "Georgia", "Outfit", serif', fontStyle: 'italic', letterSpacing: '-2px' }}>
                {parseInt(hours)}
              </span>
              <span style={{ fontSize: '5.5rem', fontWeight: 700, color: '#8B9299', margin: '0 2px' }}>:</span>
              <span style={{ fontSize: '7.5rem', fontWeight: 900, color: '#F1F3F4', fontFamily: '"New York", "Georgia", "Outfit", serif', letterSpacing: '-2px' }}>
                {minutes}
              </span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: clockColor, marginTop: '8px', letterSpacing: '0.5px' }}>
              {dateStr}
            </div>
          </div>
        );

      // 2. Apple iOS StandBy Translucent Pill Capsules Clock
      case 'pill-blocks':
        const hDigit1 = hours[0];
        const hDigit2 = hours[1];
        const mDigit1 = minutes[0];
        const mDigit2 = minutes[1];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'auto 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Hours Pill Block */}
              <div style={{ background: 'rgba(255, 255, 255, 0.07)', border: `1px solid ${clockColor}40`, borderRadius: '24px', padding: '12px 22px', backdropFilter: 'blur(16px)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                <span style={{ fontSize: '5.5rem', fontWeight: 900, color: clockColor, letterSpacing: '-2px', lineHeight: 1, fontFamily: '"Outfit", sans-serif' }}>
                  {hours}
                </span>
              </div>

              <span style={{ fontSize: '3rem', fontWeight: 900, color: '#8B9299' }}>:</span>

              {/* Minutes Pill Block */}
              <div style={{ background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', padding: '12px 22px', backdropFilter: 'blur(16px)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                <span style={{ fontSize: '5.5rem', fontWeight: 900, color: '#F1F3F4', letterSpacing: '-2px', lineHeight: 1, fontFamily: '"Outfit", sans-serif' }}>
                  {minutes}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: clockColor, marginTop: '14px' }}>
              {dateStr}
            </div>
          </div>
        );

      // 3. Apple StandBy Hero Clock
      case 'minimal-hero':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 'auto 0', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '7.2rem', fontWeight: 900, color: '#F1F3F4', letterSpacing: '-4px', lineHeight: 1, fontFamily: '"Outfit", sans-serif' }}>
                {parseInt(hours)}:{minutes}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', paddingLeft: '20px' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: clockColor, letterSpacing: '0.5px' }}>
                  {dayAbbr} {dayNum}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', fontWeight: 700, color: '#F1F3F4', marginTop: '2px' }}>
                  <span>30°</span>
                  <Sun style={{ width: '18px', height: '18px', color: clockColor }} />
                </div>
              </div>

              <div style={{ paddingTop: '10px', borderTop: '1px solid #2A2F34' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: clockColor }}>
                  <Bell style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F1F3F4' }}>8:00AM</span>
                </div>
              </div>
            </div>
          </div>
        );

      // 4. Apple StandBy Playful Multi-Color Block Clock
      case 'playful-colors':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'auto 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', lineHeight: 1 }}>
              <span style={{ fontSize: '7.5rem', fontWeight: 900, color: clockColor, fontFamily: '"Outfit", sans-serif', letterSpacing: '-2px' }}>
                {hours[0]}
              </span>
              <span style={{ fontSize: '7.5rem', fontWeight: 900, color: '#F4D28A', fontFamily: '"Outfit", sans-serif', letterSpacing: '-2px' }}>
                {hours[1]}
              </span>
              <span style={{ fontSize: '5.5rem', fontWeight: 900, color: '#8B9299', margin: '0 4px', transform: 'translateY(-6px)' }}>
                :
              </span>
              <span style={{ fontSize: '7.5rem', fontWeight: 900, color: '#69C58A', fontFamily: '"Outfit", sans-serif', letterSpacing: '-2px' }}>
                {minutes[0]}
              </span>
              <span style={{ fontSize: '7.5rem', fontWeight: 900, color: '#F1F3F4', fontFamily: '"Outfit", sans-serif', letterSpacing: '-2px' }}>
                {minutes[1]}
              </span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: clockColor, marginTop: '4px' }}>
              {dateStr}
            </div>
          </div>
        );

      // 5. Apple Swiss Analog Clock
      case 'analog':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'auto 0' }}>
            <div 
              style={{ 
                width: '180px', 
                height: '180px', 
                borderRadius: '50%', 
                border: `4px solid ${clockColor}`, 
                position: 'relative', 
                background: 'radial-gradient(circle, #202428 0%, #171A1D 100%)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <div
                  key={deg}
                  style={{
                    position: 'absolute',
                    width: deg % 90 === 0 ? '4px' : '2px',
                    height: deg % 90 === 0 ? '10px' : '6px',
                    background: deg % 90 === 0 ? clockColor : '#8B9299',
                    transform: `rotate(${deg}deg) translateY(-80px)`
                  }}
                />
              ))}

              <div 
                style={{
                  position: 'absolute',
                  width: '6px',
                  height: '48px',
                  background: '#F1F3F4',
                  borderRadius: '9999px',
                  transformOrigin: 'bottom center',
                  transform: `rotate(${hourAngle}deg) translateY(-24px)`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                }}
              />

              <div 
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '66px',
                  background: '#F4D28A',
                  borderRadius: '9999px',
                  transformOrigin: 'bottom center',
                  transform: `rotate(${minuteAngle}deg) translateY(-33px)`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                }}
              />

              <div 
                style={{
                  position: 'absolute',
                  width: '2px',
                  height: '75px',
                  background: clockColor,
                  borderRadius: '9999px',
                  transformOrigin: 'bottom center',
                  transform: `rotate(${secondAngle}deg) translateY(-30px)`
                }}
              />

              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: clockColor, zIndex: 10, border: '2px solid #F1F3F4' }} />
            </div>

            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: clockColor, marginTop: '14px' }}>
              {hours}:{minutes} {ampmStr}
            </div>
          </div>
        );

      // 6. Stacked Big Numerals
      case 'stacked':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 'auto 0', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.85 }}>
              <span style={{ fontSize: '6rem', fontWeight: 900, color: '#F1F3F4', letterSpacing: '-3px' }}>{hours}</span>
              <span style={{ fontSize: '6rem', fontWeight: 900, color: clockColor, letterSpacing: '-3px' }}>{minutes}</span>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F4D28A', textTransform: 'uppercase', letterSpacing: '1px' }}>{ampmStr}</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#8B9299' }}>{dateStr}</span>
            </div>
          </div>
        );

      // 7. Apple World Clock
      case 'world':
        return (
          <div style={{ margin: 'auto 0', width: '100%' }}>
            <div className="clock-hero-time">
              <span>{hours}:{minutes}</span>
              <span className="clock-hero-ampm">{ampmStr}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #2A2F34' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: clockColor, textTransform: 'uppercase' }}>CUPERTINO</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F1F3F4', marginTop: '2px' }}>
                  {String((parseInt(hours) + 15) % 12 || 12).padStart(2, '0')}:{minutes}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#69C58A', textTransform: 'uppercase' }}>LONDON</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F1F3F4', marginTop: '2px' }}>
                  {String((parseInt(hours) + 5) % 12 || 12).padStart(2, '0')}:{minutes}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#F4D28A', textTransform: 'uppercase' }}>TOKYO</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F1F3F4', marginTop: '2px' }}>
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
      {/* LEFT PANEL: Swappable Apple Standby Clock Widget         */}
      {/* ======================================================== */}
      <div 
        onTouchStart={handleClockTouchStart}
        onTouchEnd={handleClockTouchEnd}
        className="glass-card hero-clock-card"
        style={{ cursor: 'pointer', position: 'relative' }}
      >
        {/* Top Header */}
        <div className="card-top-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="standby-tag" style={{ color: clockColor, borderColor: `${clockColor}40`, background: `${clockColor}15` }}>StandBy Clock</span>
            
            {/* Clock Face Indicator Dots */}
            <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
              {(['curvy-apple', 'pill-blocks', 'minimal-hero', 'playful-colors', 'analog', 'stacked', 'world'] as ClockStyle[]).map((st) => (
                <button
                  key={st}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClockStyleChange(st);
                  }}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: clockStyle === st ? clockColor : '#2A2F34',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>
          </div>
          
          <button
            onClick={onNavigateToStreamDeck}
            className="compass-btn"
            title="Go to Stream Deck Screen (Page 2)"
          >
            <Compass style={{ width: '22px', height: '22px', color: clockColor }} />
          </button>
        </div>

        {/* Center Clock Render */}
        {renderClockDisplay()}

        {/* Bottom Row Footer */}
        <div className="card-bottom-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#69C58A' }} />
            <span>Swipe ↑↓ to Change Clock Design</span>
          </div>
          <span style={{ color: clockColor, fontWeight: 700 }}>{clockStyle.toUpperCase()}</span>
        </div>
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

        {/* Music Player Widget (TAPPING OPENS FULL CARPLAY MUSIC MODAL!) */}
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
