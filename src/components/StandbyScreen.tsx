import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Cpu, HardDrive, Compass, Music, Activity } from 'lucide-react';
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
    <div className="relative w-full h-full p-6 flex flex-col justify-center max-w-7xl mx-auto">
      {/* Background Dynamic Ambient Aura Glow */}
      <div 
        className="absolute inset-0 opacity-30 filter blur-[90px] transition-all duration-1000 pointer-events-none"
        style={{
          background: mediaState.albumArt
            ? `radial-gradient(circle at 70% 50%, rgba(56, 189, 248, 0.4), rgba(244, 63, 94, 0.3), transparent 70%)`
            : `radial-gradient(circle at 50% 50%, rgba(129, 140, 248, 0.25), transparent 70%)`
        }}
      />

      {/* Main Page 1 Landscape Grid Layout */}
      <div className="grid grid-cols-12 gap-6 h-full items-stretch z-10">
        
        {/* ======================================================== */}
        {/* LEFT PANEL: Standby Large Clock Card (6 Columns)         */}
        {/* ======================================================== */}
        <div className="col-span-12 lg:col-span-7 glass-card p-8 flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle iOS Apple StandBy Watermark / Glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/20 transition-all duration-700" />
          
          {/* Top Info Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-widest text-sky-400 uppercase bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
              Apple Standby Mode
            </span>
            
            {/* Navigation Compass Circle Icon (From User Sketch!) */}
            <button
              onClick={onNavigateToStreamDeck}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-lg transition-transform active:scale-95 group/btn"
              title="Go to Stream Deck Screen (Page 2)"
            >
              <Compass className="w-6 h-6 text-sky-400 group-hover/btn:rotate-90 transition-transform duration-500" />
            </button>
          </div>

          {/* Huge StandBy Hero Digital Clock Display */}
          <div className="my-auto flex flex-col items-start">
            <div className="flex items-baseline gap-3">
              <h1 className="text-7xl sm:text-8xl md:text-9xl font-extrabold tracking-tighter text-white drop-shadow-2xl font-['Outfit']">
                {timeStr}
              </h1>
              <span className="text-2xl sm:text-3xl font-bold text-sky-400 uppercase tracking-wider">
                {ampmStr}
              </span>
            </div>
            
            <p className="text-lg sm:text-xl font-medium text-slate-300 mt-1 tracking-wide">
              {dateStr}
            </p>
          </div>

          {/* Bottom Status Ribbon */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Samsung Tab Desk Docked</span>
            </div>
            <span>Swipe or click Compass for Stream Deck</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: Stacked Widgets (5 Columns)                */}
        {/* ======================================================== */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 justify-between">
          
          {/* Top Right Widget: Mac Specs Card (CPU, GPU, Memory) */}
          <div className="glass-card p-6 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white tracking-wide">
                  Mac Specs & Health
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                {macSpecs.macName}
              </span>
            </div>

            {/* Spec Meters */}
            <div className="space-y-3.5">
              {/* CPU Meter */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">CPU Usage</span>
                  <span className="text-sky-400 font-bold">{macSpecs.cpuUsage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500 rounded-full"
                    style={{ width: `${macSpecs.cpuUsage}%` }}
                  />
                </div>
              </div>

              {/* GPU Meter */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">GPU Pressure</span>
                  <span className="text-purple-400 font-bold">{macSpecs.gpuUsage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-rose-500 transition-all duration-500 rounded-full"
                    style={{ width: `${macSpecs.gpuUsage}%` }}
                  />
                </div>
              </div>

              {/* Memory Meter */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Memory</span>
                  <span className="text-emerald-400 font-bold">
                    {macSpecs.memoryUsedGB} GB / {macSpecs.memoryTotalGB} GB ({macSpecs.memoryPercentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                    style={{ width: `${macSpecs.memoryPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right Widget: Music Player Card (From User Sketch!) */}
          <div className="glass-card p-6 flex flex-col justify-between flex-1 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white tracking-wide">
                  Now Playing on Mac
                </h3>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300">
                {mediaState.sourceApp}
              </span>
            </div>

            {/* Content: Album Art Left + Controls & Title Right */}
            <div className="flex items-center gap-4 my-2">
              {/* Album Art Thumbnail Square */}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-xl border border-white/20 flex-shrink-0 group">
                <img
                  src={mediaState.albumArt}
                  alt={mediaState.trackName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {mediaState.isPlaying && (
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white animate-pulse" />
                  </div>
                )}
              </div>

              {/* Title & Track Controls */}
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-white truncate tracking-tight">
                  {mediaState.trackName}
                </h4>
                <p className="text-xs text-slate-300 truncate font-medium mt-0.5">
                  {mediaState.artist}
                </p>

                {/* Controls <  ▶  > */}
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={onPrevTrack}
                    className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition active:scale-90"
                    title="Previous Track"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onTogglePlayPause}
                    className="p-2.5 rounded-full bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/30 transition transform active:scale-90"
                    title={mediaState.isPlaying ? 'Pause' : 'Play'}
                  >
                    {mediaState.isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={onNextTrack}
                    className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition active:scale-90"
                    title="Next Track"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Seekbar Slider */}
            <div className="mt-2">
              <input
                type="range"
                min="0"
                max={mediaState.durationSeconds || 180}
                value={mediaState.positionSeconds || 0}
                onChange={(e) => onSeek(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>{formatSeconds(mediaState.positionSeconds)}</span>
                <span>{formatSeconds(mediaState.durationSeconds)}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
