import React from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Disc, Activity } from 'lucide-react';
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
  onVolumeChange,
}) => {
  if (!isOpen) return null;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      
      {/* Album Artwork Ambient Backdrop Glow */}
      <div 
        className="absolute inset-0 opacity-40 filter blur-[120px] pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: `url(${mediaState.albumArt})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <div className="relative w-full max-w-4xl glass-card p-8 bg-black/40 border border-white/20 shadow-2xl flex flex-col md:flex-row items-center gap-8 z-10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full glass-pill hover:bg-white/20 text-slate-300 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Large Album Art */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex-shrink-0 group">
          <img
            src={mediaState.albumArt}
            alt={mediaState.trackName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {mediaState.isPlaying && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
              <Disc className="w-16 h-16 text-white/80 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          )}
        </div>

        {/* Right: Info, Lyrics Preview, Controls */}
        <div className="flex-1 w-full flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold tracking-widest text-rose-400 uppercase bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/30">
              Apple Music Lyrics & Controller
            </span>

            <h1 className="text-3xl font-extrabold text-white mt-3 tracking-tight">
              {mediaState.trackName}
            </h1>
            <p className="text-lg text-slate-300 font-medium mt-1">
              {mediaState.artist} — <span className="text-slate-400">{mediaState.album}</span>
            </p>
          </div>

          {/* Simulated Animated Lyrics / Audio Visualizer Bars */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-1.5 h-16 overflow-hidden">
            {[40, 70, 35, 90, 60, 100, 45, 80, 55, 30, 85, 95, 50, 75, 40, 60].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-rose-500 to-sky-400 rounded-full transition-all duration-300"
                style={{
                  height: mediaState.isPlaying ? `${Math.min(100, Math.max(15, h * (0.6 + Math.random() * 0.5)))}%` : '15%'
                }}
              />
            ))}
          </div>

          {/* Timeline Seekbar */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={mediaState.durationSeconds || 180}
              value={mediaState.positionSeconds || 0}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="w-full accent-rose-400 cursor-pointer"
            />
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>{formatTime(mediaState.positionSeconds)}</span>
              <span>{formatTime(mediaState.durationSeconds)}</span>
            </div>
          </div>

          {/* Playback Controls & Volume */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-6">
              <button
                onClick={onPrevTrack}
                className="p-3 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition active:scale-90"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              <button
                onClick={onTogglePlayPause}
                className="p-4 rounded-full bg-rose-500 hover:bg-rose-400 text-white shadow-xl shadow-rose-500/40 transition active:scale-95"
              >
                {mediaState.isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={onNextTrack}
                className="p-3 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition active:scale-90"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 w-40">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={mediaState.volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-full accent-sky-400"
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
