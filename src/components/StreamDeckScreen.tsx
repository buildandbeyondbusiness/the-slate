import React, { useState } from 'react';
import { 
  Music, 
  Settings, 
  Plus, 
  Edit3, 
  Check, 
  Terminal, 
  Code, 
  Globe, 
  Palette, 
  Lock, 
  VolumeX, 
  PlayCircle, 
  Layers, 
  Compass,
  Monitor,
  Command,
  AppWindow
} from 'lucide-react';
import { StreamDeckCard, MediaTrackState } from '../types';

interface StreamDeckScreenProps {
  cards: StreamDeckCard[];
  onLaunch: (card: StreamDeckCard) => void;
  onOpenMusicModal: () => void;
  onOpenSettings: () => void;
  onOpenButtonEditor: (card?: StreamDeckCard) => void;
  mediaState: MediaTrackState;
}

export const StreamDeckScreen: React.FC<StreamDeckScreenProps> = ({
  cards,
  onLaunch,
  onOpenMusicModal,
  onOpenSettings,
  onOpenButtonEditor,
  mediaState,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'apps' | 'macros'>('all');

  // Dynamic Lucide Icon Mapper
  const renderCardIcon = (iconName: string, color: string) => {
    const props = { className: "w-8 h-8", style: { color } };
    switch (iconName) {
      case 'Code': return <Code {...props} />;
      case 'Terminal': return <Terminal {...props} />;
      case 'Globe': return <Globe {...props} />;
      case 'Palette': return <Palette {...props} />;
      case 'Lock': return <Lock {...props} />;
      case 'VolumeX': return <VolumeX {...props} />;
      case 'PlayCircle': return <PlayCircle {...props} />;
      case 'Layers': return <Layers {...props} />;
      default: return <Command {...props} />;
    }
  };

  const filteredCards = cards.filter(card => {
    if (activeTab === 'apps') return card.category === 'app';
    if (activeTab === 'macros') return card.category === 'macro' || card.category === 'system';
    return true;
  });

  return (
    <div className="relative w-full h-full p-6 flex flex-col justify-between max-w-7xl mx-auto z-10">
      
      {/* ======================================================== */}
      {/* TOP PILL BAR (From User Sketch Page 2: Music & Buttons)  */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between mb-6">
        
        {/* Left Pills: [ Music ] Pill & [ Buttons ] Pill */}
        <div className="flex items-center gap-3">
          {/* Music Pill */}
          <button
            onClick={onOpenMusicModal}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-pill hover:bg-white/20 transition-all duration-300 shadow-lg group"
            title="Open Full Music Visualizer"
          >
            <Music className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-bold text-white leading-none">Music</span>
              <span className="text-[10px] text-slate-300 font-medium truncate max-w-[120px]">
                {mediaState.trackName || 'Now Playing'}
              </span>
            </div>
          </button>

          {/* Buttons Filter / Edit Pill */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full glass-pill transition-all duration-300 shadow-lg ${isEditMode ? 'bg-amber-500/30 border-amber-500/50 text-amber-300' : 'hover:bg-white/20'}`}
          >
            {isEditMode ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4 text-sky-400" />}
            <span className="text-sm font-bold text-white">
              {isEditMode ? 'Done Editing' : 'Buttons'}
            </span>
          </button>
        </div>

        {/* Center Tab Filter Pills (All / Apps / Macros) */}
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${activeTab === 'all' ? 'bg-white/20 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            All Shortcuts
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${activeTab === 'apps' ? 'bg-white/20 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Mac Apps
          </button>
          <button
            onClick={() => setActiveTab('macros')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${activeTab === 'macros' ? 'bg-white/20 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Macros
          </button>
        </div>

        {/* Right Action: Add New Button */}
        <button
          onClick={() => onOpenButtonEditor()}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass-pill hover:bg-sky-500/30 text-sky-300 border-sky-500/30 transition shadow-lg"
          title="Add New Custom Mac Shortcut"
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs font-bold hidden sm:inline">Add Shortcut</span>
        </button>

      </div>

      {/* ======================================================== */}
      {/* STREAM DECK MAC SHORTCUT GRID (Page 2 from User Sketch)  */}
      {/* 3x2 or 3x3 Responsive Landscape Grid                      */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5 flex-1 items-stretch my-auto">
        {filteredCards.map((card) => (
          <div
            key={card.id}
            onClick={() => {
              if (isEditMode) {
                onOpenButtonEditor(card);
              } else {
                onLaunch(card);
              }
            }}
            className={`glass-card p-6 flex flex-col justify-between items-start stream-button group cursor-pointer relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isEditMode ? 'animate-jiggle border-amber-400/50' : ''}`}
            style={{
              boxShadow: `0 10px 30px rgba(0,0,0,0.3)`
            }}
          >
            {/* Top Row: Icon + Category Badge */}
            <div className="w-full flex items-center justify-between">
              <div 
                className="p-3 rounded-2xl bg-white/10 border border-white/10 transition-transform group-hover:scale-110 duration-300 shadow-md"
                style={{ backgroundColor: `${card.accentColor}20`, borderColor: `${card.accentColor}40` }}
              >
                {renderCardIcon(card.iconName, card.accentColor)}
              </div>

              <span 
                className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase"
                style={{ backgroundColor: `${card.accentColor}20`, color: card.accentColor }}
              >
                {card.badgeText || card.category}
              </span>
            </div>

            {/* Middle Content: Title & Target App Subtitle */}
            <div className="mt-4 mb-2">
              <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-sky-300 transition-colors">
                {card.title}
              </h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5 line-clamp-1">
                {card.subtitle}
              </p>
            </div>

            {/* Bottom Row: Tap Feedback Bar */}
            <div className="w-full pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 group-hover:text-white transition-colors">
              <span>{isEditMode ? 'Click to Edit' : 'Launch Mac Shortcut'}</span>
              <span className="text-sky-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        ))}
      </div>

      {/* ======================================================== */}
      {/* BOTTOM RIGHT SETTINGS GEAR BUTTON (From User Sketch!)    */}
      {/* ======================================================== */}
      <div className="flex items-center justify-end mt-4">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold shadow-2xl backdrop-blur-xl transition transform active:scale-95 group"
          title="Open Settings (From User Sketch)"
        >
          <Settings className="w-5 h-5 text-sky-400 group-hover:rotate-90 transition-transform duration-500" />
          <span className="text-sm font-semibold tracking-wide">Settings</span>
        </button>
      </div>

    </div>
  );
};
