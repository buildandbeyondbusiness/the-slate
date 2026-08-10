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
    <div className="modal-overlay" style={{ padding: 0, background: '#000000', overflow: 'hidden' }}>
      
      {/* Ambient Illuminated Background */}
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

      {/* Main Screen Container (Full Edge-to-Edge with Inner Safe Bounds) */}
      <div 
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 64px',
          zIndex: 10,
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Outfit", sans-serif',
          maxWidth: '1300px',
          margin: '0 auto'
        }}
      >
        {/* Top Header Bar: < Back ... Up Next */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '54px' }}>
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
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
            }}
          >
            <ChevronLeft style={{ width: '20px', height: '20px' }} />
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
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ListMusic style={{ width: '18px', height: '18px' }} />
            <span>Up Next</span>
          </button>
        </div>

        {/* Center Main Content Layout */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '48px', flex: 1, margin: '16px 0', width: '100%', overflow: 'hidden' }}>
          
          {/* Left Column: Track Info, Playback Controls, Timeline & Options */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%', flex: 1, minWidth: 0, paddingRight: '12px' }}>
            
            {/* Titles */}
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {mediaState.trackName}
              </h1>
              <p style={{ fontSize: '1.15rem', fontWeight: 600, color: '#38bdf8', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {mediaState.artist} — {mediaState.album}
              </p>
            </div>

            {/* Playback Controls (Rewind, Play/Pause, Next) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '36px', margin: '16px 0' }}>
              <button
                onClick={onPrevTrack}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '6px', transition: 'transform 0.15s' }}
                title="Rewind / Previous"
              >
                <SkipBack style={{ width: '42px', height: '42px', fill: '#ffffff' }} />
              </button>

              <button
                onClick={onTogglePlayPause}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '6px', transition: 'transform 0.15s' }}
                title={mediaState.isPlaying ? 'Pause' : 'Play'}
              >
                {mediaState.isPlaying ? (
                  <Pause style={{ width: '52px', height: '52px', fill: '#ffffff' }} />
                ) : (
                  <Play style={{ width: '52px', height: '52px', fill: '#ffffff', marginLeft: '4px' }} />
                )}
              </button>

              <button
                onClick={onNextTrack}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '6px', transition: 'transform 0.15s' }}
                title="Fast Forward / Next"
              >
                <SkipForward style={{ width: '42px', height: '42px', fill: '#ffffff' }} />
              </button>
            </div>

            {/* Timeline Seekbar & Timestamps */}
            <div style={{ width: '100%' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginTop: '6px', fontFamily: 'monospace' }}>
                <span>{formatElapsed(mediaState.positionSeconds)}</span>
                <span>{formatRemaining(mediaState.positionSeconds, mediaState.durationSeconds)}</span>
              </div>
            </div>

            {/* Bottom Action Row: Shuffle | Ellipsis | Repeat */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '8px' }}>
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                style={{ background: 'none', border: 'none', color: isShuffle ? '#38bdf8' : '#94a3b8', cursor: 'pointer', padding: '6px' }}
              >
                <Shuffle style={{ width: '22px', height: '22px' }} />
              </button>

              <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}>
                <MoreHorizontal style={{ width: '24px', height: '24px' }} />
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                style={{ background: 'none', border: 'none', color: isRepeat ? '#38bdf8' : '#94a3b8', cursor: 'pointer', padding: '6px' }}
              >
                <Repeat style={{ width: '22px', height: '22px' }} />
              </button>
            </div>

          </div>

          {/* Right Column: Album Artwork Card (Safely Constrained) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div 
              style={{
                width: '280px',
                height: '280px',
                maxHeight: '42vh',
                maxWidth: '42vh',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.2)',
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
