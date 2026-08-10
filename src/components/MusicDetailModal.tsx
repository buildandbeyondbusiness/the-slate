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
          filter: 'blur(90px) brightness(0.45) saturate(170%)',
          transform: 'scale(1.2)',
          transition: 'all 0.8s ease'
        }}
      />

      {/* Main Screen Container (Full Edge-to-Edge) */}
      <div 
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '28px 48px',
          zIndex: 10,
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Outfit", sans-serif'
        }}
      >
        {/* Top Header Bar: < Back ... Up Next */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(56, 189, 248, 0.2)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              padding: '8px 20px',
              borderRadius: '9999px',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
            }}
          >
            <ChevronLeft style={{ width: '22px', height: '22px' }} />
            <span>Back</span>
          </button>

          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ListMusic style={{ width: '20px', height: '20px' }} />
            <span>Up Next</span>
          </button>
        </div>

        {/* Center Main Content: Left Details & Controls + Right Album Art */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px', alignItems: 'center', flex: 1, margin: '20px 0' }}>
          
          {/* Left Column: Track Info, Playback Controls, Timeline & Options */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '12px 0' }}>
            
            {/* Titles */}
            <div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {mediaState.trackName}
              </h1>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#38bdf8', marginTop: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {mediaState.artist} — {mediaState.album}
              </p>
            </div>

            {/* Large CarPlay Playback Controls (Rewind, Play/Pause, Fast Forward) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px', margin: '24px 0' }}>
              <button
                onClick={onPrevTrack}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '8px', transition: 'transform 0.15s' }}
                title="Rewind / Previous"
              >
                <SkipBack style={{ width: '46px', height: '46px', fill: '#ffffff' }} />
              </button>

              <button
                onClick={onTogglePlayPause}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '8px', transition: 'transform 0.15s' }}
                title={mediaState.isPlaying ? 'Pause' : 'Play'}
              >
                {mediaState.isPlaying ? (
                  <Pause style={{ width: '56px', height: '56px', fill: '#ffffff' }} />
                ) : (
                  <Play style={{ width: '56px', height: '56px', fill: '#ffffff', marginLeft: '4px' }} />
                )}
              </button>

              <button
                onClick={onNextTrack}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '8px', transition: 'transform 0.15s' }}
                title="Fast Forward / Next"
              >
                <SkipForward style={{ width: '46px', height: '46px', fill: '#ffffff' }} />
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
                  height: '5px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.35)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 600, color: '#94a3b8', marginTop: '8px', fontFamily: 'monospace' }}>
                <span>{formatElapsed(mediaState.positionSeconds)}</span>
                <span>{formatRemaining(mediaState.positionSeconds, mediaState.durationSeconds)}</span>
              </div>
            </div>

            {/* Bottom Action Row: Shuffle | Ellipsis | Repeat */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '16px' }}>
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                style={{ background: 'none', border: 'none', color: isShuffle ? '#38bdf8' : '#94a3b8', cursor: 'pointer', padding: '8px' }}
              >
                <Shuffle style={{ width: '24px', height: '24px' }} />
              </button>

              <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}>
                <MoreHorizontal style={{ width: '26px', height: '26px' }} />
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                style={{ background: 'none', border: 'none', color: isRepeat ? '#38bdf8' : '#94a3b8', cursor: 'pointer', padding: '8px' }}
              >
                <Repeat style={{ width: '24px', height: '24px' }} />
              </button>
            </div>

          </div>

          {/* Right Column: Album Artwork Card */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div 
              style={{
                width: '320px',
                height: '320px',
                borderRadius: '28px',
                overflow: 'hidden',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.2)',
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
  );
};
