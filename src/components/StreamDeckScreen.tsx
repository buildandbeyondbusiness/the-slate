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
  Command
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

  const renderCardIcon = (iconName: string, color: string) => {
    const style = { width: '28px', height: '28px', color };
    switch (iconName) {
      case 'Code': return <Code style={style} />;
      case 'Terminal': return <Terminal style={style} />;
      case 'Globe': return <Globe style={style} />;
      case 'Palette': return <Palette style={style} />;
      case 'Lock': return <Lock style={style} />;
      case 'VolumeX': return <VolumeX style={style} />;
      case 'PlayCircle': return <PlayCircle style={style} />;
      case 'Layers': return <Layers style={style} />;
      default: return <Command style={style} />;
    }
  };

  const filteredCards = cards.filter(card => {
    if (activeTab === 'apps') return card.category === 'app';
    if (activeTab === 'macros') return card.category === 'macro' || card.category === 'system';
    return true;
  });

  return (
    <div className="stream-deck-container">
      {/* Top Deck Pill Bar */}
      <div className="deck-header">
        <div className="deck-tabs-left">
          {/* Music Pill */}
          <button onClick={onOpenMusicModal} className="glass-pill-btn" title="Open Music Player">
            <Music style={{ width: '18px', height: '18px', color: '#f43f5e' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 800 }}>Music</span>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {mediaState.trackName || 'Now Playing'}
              </span>
            </div>
          </button>

          {/* Buttons Pill */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="glass-pill-btn"
            style={{ background: isEditMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.07)', borderColor: isEditMode ? '#f59e0b' : 'var(--border-glass)' }}
          >
            {isEditMode ? <Check style={{ width: '16px', height: '16px' }} /> : <Edit3 style={{ width: '16px', height: '16px', color: '#38bdf8' }} />}
            <span>{isEditMode ? 'Done Editing' : 'Buttons'}</span>
          </button>
        </div>

        {/* Center Category Tabs */}
        <div className="deck-tabs-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '9999px', border: '1px solid var(--border-glass)' }}>
          <button
            onClick={() => setActiveTab('all')}
            className={`glass-pill-btn ${activeTab === 'all' ? 'active' : ''}`}
            style={{ padding: '4px 14px', fontSize: '0.75rem' }}
          >
            All Shortcuts
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`glass-pill-btn ${activeTab === 'apps' ? 'active' : ''}`}
            style={{ padding: '4px 14px', fontSize: '0.75rem' }}
          >
            Mac Apps
          </button>
          <button
            onClick={() => setActiveTab('macros')}
            className={`glass-pill-btn ${activeTab === 'macros' ? 'active' : ''}`}
            style={{ padding: '4px 14px', fontSize: '0.75rem' }}
          >
            Macros
          </button>
        </div>

        {/* Add Shortcut */}
        <button onClick={() => onOpenButtonEditor()} className="glass-pill-btn" style={{ borderColor: '#38bdf8', color: '#38bdf8' }}>
          <Plus style={{ width: '16px', height: '16px' }} />
          <span>Add Shortcut</span>
        </button>
      </div>

      {/* 3x2 Stream Deck Grid */}
      <div className="deck-grid">
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
            className="macro-card"
          >
            <div className="macro-card-top">
              <div className="macro-icon-box" style={{ background: `${card.accentColor}20`, borderColor: `${card.accentColor}40` }}>
                {renderCardIcon(card.iconName, card.accentColor)}
              </div>

              <span className="macro-category-tag" style={{ background: `${card.accentColor}20`, color: card.accentColor }}>
                {card.badgeText || card.category}
              </span>
            </div>

            <div className="macro-card-middle">
              <div className="macro-title">{card.title}</div>
              <div className="macro-subtitle">{card.subtitle}</div>
            </div>

            <div className="macro-card-bottom">
              <span>{isEditMode ? 'Click to Edit' : 'Launch Mac Shortcut'}</span>
              <span style={{ color: card.accentColor, fontWeight: 'bold' }}>→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Right Settings Button (From User Sketch!) */}
      <div className="deck-footer">
        <button onClick={onOpenSettings} className="glass-pill-btn" style={{ padding: '12px 24px', fontSize: '0.9rem' }}>
          <Settings style={{ width: '20px', height: '20px', color: '#38bdf8' }} />
          <span style={{ fontWeight: 700 }}>Settings</span>
        </button>
      </div>
    </div>
  );
};
