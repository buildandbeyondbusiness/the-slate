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
    <div className="modal-overlay" style={{ padding: 0, background: '#0D0F10', overflow: 'hidden' }}>
      
      {/* Ambient Illuminated Background */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${mediaState.albumArt})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(100px) brightness(0.35) saturate(180%)',
          transform: 'scale(1.2)',
          transition: 'all 0.8s ease'
        }}
      />

      {/* Main Screen Container (Perfect 100% Bounds) */}
      <div 
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 40px',
          zIndex: 10,
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Outfit", sans-serif',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', width: '100%', height: '48px' }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(224, 168, 78, 0.18)',
              border: '1px solid rgba(224, 168, 78, 0.4)',
              color: '#E0A84E',
              padding: '6px 18px',
              borderRadius: '9999px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
            }}
          >
            <ChevronLeft style={{ width: '18px', height: '18px' }} />
            <span>Back</span>
          </button>

          <div style={{ flex: 1 }} />

          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: '#F4D28A',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ListMusic style={{ width: '18px', height: '18px' }} />
            <span>Up Next</span>
          </button>
        </div>

        {/* Center Main Content (Fully Scaled & Bounds Constrained) */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '40px', 
            flex: 1, 
            width: '100%', 
            maxWidth: '1050px', 
            margin: '0 auto', 
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}
        >
          {/* Left Column: Track Info, Controls, Seekbar */}
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-around', 
              flex: 1, 
              minWidth: 0, 
              height: '100%', 
              maxHeight: '440px' 
            }}
          >
            {/* Titles */}
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#F1F3F4', textTransform: 'uppercase', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {mediaState.trackName}
              </h1>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#E0A84E', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {mediaState.artist} — {mediaState.album}
              </p>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', margin: '12px 0' }}>
              <button
                onClick={onPrevTrack}
                style={{ background: 'none', border: 'none', color: '#F1F3F4', cursor: 'pointer', padding: '6px' }}
                title="Rewind / Previous"
              >
                <SkipBack style={{ width: '38px', height: '38px', fill: '#F1F3F4' }} />
              </button>

              <button
                onClick={onTogglePlayPause}
                style={{ background: 'none', border: 'none', color: '#E0A84E', cursor: 'pointer', padding: '6px' }}
                title={mediaState.isPlaying ? 'Pause' : 'Play'}
              >
                {mediaState.isPlaying ? (
                  <Pause style={{ width: '48px', height: '48px', fill: '#E0A84E' }} />
                ) : (
                  <Play style={{ width: '48px', height: '48px', fill: '#E0A84E', marginLeft: '4px' }} />
                )}
              </button>

              <button
                onClick={onNextTrack}
                style={{ background: 'none', border: 'none', color: '#F1F3F4', cursor: 'pointer', padding: '6px' }}
                title="Fast Forward / Next"
              >
                <SkipForward style={{ width: '38px', height: '38px', fill: '#F1F3F4' }} />
              </button>
            </div>

            {/* Seekbar */}
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
                  background: 'rgba(241, 243, 244, 0.25)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: '#8B9299', marginTop: '6px', fontFamily: 'monospace' }}>
                <span>{formatElapsed(mediaState.positionSeconds)}</span>
                <span>{formatRemaining(mediaState.positionSeconds, mediaState.durationSeconds)}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                style={{ background: 'none', border: 'none', color: isShuffle ? '#E0A84E' : '#8B9299', cursor: 'pointer', padding: '6px' }}
              >
                <Shuffle style={{ width: '20px', height: '20px' }} />
              </button>

              <button style={{ background: 'none', border: 'none', color: '#8B9299', cursor: 'pointer', padding: '6px' }}>
                <MoreHorizontal style={{ width: '22px', height: '22px' }} />
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                style={{ background: 'none', border: 'none', color: isRepeat ? '#E0A84E' : '#8B9299', cursor: 'pointer', padding: '6px' }}
              >
                <Repeat style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

          </div>

          {/* Right Column: Album Artwork (Safely Scaled) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div 
              style={{
                width: '250px',
                height: '250px',
                maxHeight: '38vh',
                maxWidth: '38vh',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), 0 0 0 1px #2A2F34',
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
