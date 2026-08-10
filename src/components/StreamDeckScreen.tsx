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
          style={{ width: '38px', height: '38px', objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))' }} 
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }

    const style = { width: '28px', height: '28px', color: card.accentColor };
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
      {/* Top Deck Header Bar */}
      <div className="deck-header">
        <div className="deck-tabs-left">
          {/* Music Pill */}
          <button onClick={onOpenMusicModal} className="glass-pill-btn" title="Open Music Player">
            <Music style={{ width: '18px', height: '18px', color: '#E0A84E' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 800 }}>Music</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {mediaState.trackName || 'Now Playing'}
              </span>
            </div>
          </button>

          {/* Edit Mode Button */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="glass-pill-btn"
            style={{ background: isEditMode ? 'rgba(224, 168, 78, 0.2)' : 'var(--bg-elevated)', borderColor: isEditMode ? '#E0A84E' : 'var(--border-glass)' }}
          >
            {isEditMode ? <Check style={{ width: '16px', height: '16px', color: '#69C58A' }} /> : <Edit3 style={{ width: '16px', height: '16px', color: '#E0A84E' }} />}
            <span>{isEditMode ? 'Done' : 'Edit Shortcuts'}</span>
          </button>
        </div>

        {/* Center Category Tabs */}
        <div className="deck-tabs-center" style={{ background: 'var(--bg-card)', padding: '4px', borderRadius: '9999px', border: '1px solid var(--border-glass)' }}>
          <button
            onClick={() => setActiveTab('all')}
            className={`glass-pill-btn ${activeTab === 'all' ? 'active' : ''}`}
            style={{ padding: '4px 16px', fontSize: '0.8rem' }}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`glass-pill-btn ${activeTab === 'apps' ? 'active' : ''}`}
            style={{ padding: '4px 16px', fontSize: '0.8rem' }}
          >
            Apps
          </button>
          <button
            onClick={() => setActiveTab('macros')}
            className={`glass-pill-btn ${activeTab === 'macros' ? 'active' : ''}`}
            style={{ padding: '4px 16px', fontSize: '0.8rem' }}
          >
            Macros
          </button>
        </div>

        {/* Add Shortcut */}
        <button onClick={() => onOpenButtonEditor()} className="glass-pill-btn" style={{ borderColor: '#E0A84E', color: '#E0A84E' }}>
          <Plus style={{ width: '16px', height: '16px' }} />
          <span>Add</span>
        </button>
      </div>

      {/* Clean, Decluttered Stream Deck Grid (Icon + Title + Subtitle ONLY) */}
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
            style={{
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '18px',
              border: isEditMode ? '1px dashed #E0A84E' : '1px solid var(--border-glass)'
            }}
          >
            {/* High-Res 3D Icon */}
            <div 
              style={{ 
                width: '52px', 
                height: '52px', 
                borderRadius: '14px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {renderCardIcon(card)}
            </div>

            {/* Clean Title & Subtitle */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F1F3F4', letterSpacing: '-0.3px' }}>
                {card.title}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#8B9299', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {card.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Right Settings Button */}
      <div className="deck-footer">
        <button onClick={onOpenSettings} className="glass-pill-btn" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
          <Settings style={{ width: '18px', height: '18px', color: '#E0A84E' }} />
          <span style={{ fontWeight: 700 }}>Settings</span>
        </button>
      </div>
    </div>
  );
};
