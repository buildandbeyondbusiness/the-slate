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

  const renderCardIcon = (card: StreamDeckCard) => {
    if (card.iconUrl) {
      return (
        <img 
          src={card.iconUrl} 
          alt={card.title} 
          style={{ width: '26px', height: '26px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} 
          onError={(e) => {
            // Fallback to Lucide if image fails to load
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }

    const style = { width: '24px', height: '24px', color: card.accentColor };
    switch (card.iconName) {
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
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {mediaState.trackName || 'Now Playing'}
              </span>
            </div>
          </button>

          {/* Buttons Pill */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="glass-pill-btn"
            style={{ background: isEditMode ? 'rgba(224, 168, 78, 0.2)' : 'var(--bg-elevated)', borderColor: isEditMode ? '#E0A84E' : 'var(--border-glass)' }}
          >
            {isEditMode ? <Check style={{ width: '16px', height: '16px', color: '#69C58A' }} /> : <Edit3 style={{ width: '16px', height: '16px', color: '#E0A84E' }} />}
            <span>{isEditMode ? 'Done Editing' : 'Buttons'}</span>
          </button>
        </div>

        {/* Center Category Tabs */}
        <div className="deck-tabs-center" style={{ background: 'var(--bg-card)', padding: '4px', borderRadius: '9999px', border: '1px solid var(--border-glass)' }}>
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
        <button onClick={() => onOpenButtonEditor()} className="glass-pill-btn" style={{ borderColor: '#E0A84E', color: '#E0A84E' }}>
          <Plus style={{ width: '16px', height: '16px' }} />
          <span>Add Shortcut</span>
        </button>
      </div>

      {/* 3x3 Stream Deck Grid with Authentic 3D iOS App Icons */}
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
              <div className="macro-icon-box" style={{ background: `${card.accentColor}18`, borderColor: `${card.accentColor}35` }}>
                {renderCardIcon(card)}
              </div>

              <span className="macro-category-tag" style={{ background: `${card.accentColor}18`, color: card.accentColor }}>
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

      {/* Bottom Right Settings Button */}
      <div className="deck-footer">
        <button onClick={onOpenSettings} className="glass-pill-btn" style={{ padding: '12px 24px', fontSize: '0.9rem' }}>
          <Settings style={{ width: '20px', height: '20px', color: '#E0A84E' }} />
          <span style={{ fontWeight: 700 }}>Settings</span>
        </button>
      </div>
    </div>
  );
};
