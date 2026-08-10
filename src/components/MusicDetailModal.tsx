import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  MoreHorizontal, 
  Map, 
  Music as MusicIcon, 
  MessageSquare, 
  Grid,
  ListMusic
} from 'lucide-react';
import { MediaTrackState } from '../types';

interface MusicDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaState: MediaTrackState;
  onTogglePlayPause: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
}

export const MusicDetailModal: React.FC<MusicDetailModalProps> = ({
  isOpen,
  onClose,
  mediaState,
  onTogglePlayPause,
  onNextTrack,
  onPrevTrack,
  onSeek,
}) => {
  if (!isOpen) return null;

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const formatRemaining = (sec: number, total: number) => {
    const rem = Math.max(0, total - sec);
    const m = Math.floor(rem / 60);
    const s = Math.floor(rem % 60);
    return `-${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay" style={{ padding: 0, background: '#000000' }}>
      
      {/* Dynamic Album Art Ambient Background Illumination */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${mediaState.albumArt})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(80px) brightness(0.45) saturate(160%)',
          transform: 'scale(1.2)',
          transition: 'all 0.8s ease'
        }}
      />

      {/* Main CarPlay Screen Container */}
      <div 
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          zIndex: 10,
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Outfit", sans-serif'
        }}
      >
        {/* ======================================================== */}
        {/* LEFT PERSISTENT CARPLAY SIDEBAR DOCK                    */}
        {/* ======================================================== */}
        <div 
          style={{
            width: '72px',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 0',
            zIndex: 20
          }}
        >
          {/* Status Top */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>3:57</span>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px' }}>LTE</span>
          </div>

          {/* Quick App Icons Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            {/* Maps Icon */}
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #38bdf8, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer' }}>
              <Map style={{ width: '22px', height: '22px', color: '#ffffff' }} />
            </div>

            {/* Apple Music Icon (Active) */}
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(244, 63, 94, 0.5)', cursor: 'pointer' }}>
              <MusicIcon style={{ width: '22px', height: '22px', color: '#ffffff' }} />
            </div>

            {/* Messages Icon */}
            <div style={{ position: 'relative', width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer' }}>
              <MessageSquare style={{ width: '22px', height: '22px', color: '#ffffff' }} />
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', border: '2px solid #000000' }} />
            </div>
          </div>

          {/* Bottom Grid Button */}
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'all 0.2s' }}
            title="Return to Standby Dashboard"
          >
            <Grid style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {/* ======================================================== */}
        {/* MAIN CARPLAY NOW PLAYING SCREEN                          */}
        {/* ======================================================== */}
        <div 
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px 36px',
            position: 'relative'
          }}
        >
          {/* Top Header Bar: < Back  ... Up Next */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(56, 189, 248, 0.2)',
                border: 'none',
                color: '#38bdf8',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <ChevronLeft style={{ width: '20px', height: '20px' }} />
              <span>Back</span>
            </button>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <ListMusic style={{ width: '18px', height: '18px' }} />
              <span>Up Next</span>
            </button>
          </div>

          {/* Center Main Content: Left Details & Controls + Right Album Art */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '36px', alignItems: 'center', flex: 1, margin: '16px 0' }}>
            
            {/* Left Column: Track Info, Playback Controls, Timeline & Options */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '8px 0' }}>
              
              {/* Titles */}
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {mediaState.trackName}
                </h1>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#38bdf8', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {mediaState.artist} — {mediaState.album}
                </p>
              </div>

              {/* Large CarPlay Playback Controls (Rewind, Play/Pause, Fast Forward) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '32px', margin: '20px 0' }}>
                <button
                  onClick={onPrevTrack}
                  style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '8px', transition: 'transform 0.15s' }}
                  title="Rewind / Previous"
                >
                  <SkipBack style={{ width: '40px', height: '40px', fill: '#ffffff' }} />
                </button>

                <button
                  onClick={onTogglePlayPause}
                  style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '8px', transition: 'transform 0.15s' }}
                  title={mediaState.isPlaying ? 'Pause' : 'Play'}
                >
                  {mediaState.isPlaying ? (
                    <Pause style={{ width: '48px', height: '48px', fill: '#ffffff' }} />
                  ) : (
                    <Play style={{ width: '48px', height: '48px', fill: '#ffffff', marginLeft: '4px' }} />
                  )}
                </button>

                <button
                  onClick={onNextTrack}
                  style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '8px', transition: 'transform 0.15s' }}
                  title="Fast Forward / Next"
                >
                  <SkipForward style={{ width: '40px', height: '40px', fill: '#ffffff' }} />
                </button>
              </div>

              {/* Timeline Seekbar & Timestamps */}
              <div>
                <input
                  type="range"
                  min="0"
                  max={mediaState.durationSeconds || 180}
                  value={mediaState.positionSeconds || 0}
                  onChange={(e) => onSeek(Number(e.target.value))}
                  style={{
                    width: '100%',
                    WebkitAppearance: 'none',
                    height: '4px',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.3)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginTop: '6px', fontFamily: 'monospace' }}>
                  <span>{formatElapsed(mediaState.positionSeconds)}</span>
                  <span>{formatRemaining(mediaState.positionSeconds, mediaState.durationSeconds)}</span>
                </div>
              </div>

              {/* Bottom Action Row: Shuffle | Ellipsis | Repeat */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '12px' }}>
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  style={{ background: 'none', border: 'none', color: isShuffle ? '#38bdf8' : '#94a3b8', cursor: 'pointer', padding: '8px' }}
                >
                  <Shuffle style={{ width: '22px', height: '22px' }} />
                </button>

                <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}>
                  <MoreHorizontal style={{ width: '24px', height: '24px' }} />
                </button>

                <button
                  onClick={() => setIsRepeat(!isRepeat)}
                  style={{ background: 'none', border: 'none', color: isRepeat ? '#38bdf8' : '#94a3b8', cursor: 'pointer', padding: '8px' }}
                >
                  <Repeat style={{ width: '22px', height: '22px' }} />
                </button>
              </div>

            </div>

            {/* Right Column: Album Artwork Card */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div 
                style={{
                  width: '280px',
                  height: '280px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.15)',
                  flexShrink: 0
                }}
              >
                <img
                  src={mediaState.albumArt}
                  alt={mediaState.trackName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
