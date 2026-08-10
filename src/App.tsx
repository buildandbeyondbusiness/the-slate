import React, { useState, useEffect } from 'react';
import { ViewPage, MacSystemSpecs, MediaTrackState, StreamDeckCard, SettingsConfig } from './types';
import { macController } from './services/macController';
import { TopBarNavigation } from './components/TopBarNavigation';
import { StandbyScreen } from './components/StandbyScreen';
import { StreamDeckScreen } from './components/StreamDeckScreen';
import { SettingsModal } from './components/SettingsModal';
import { MusicDetailModal } from './components/MusicDetailModal';
import { ButtonEditorModal } from './components/ButtonEditorModal';
import { ToastNotification } from './components/ToastNotification';

const INITIAL_CARDS: StreamDeckCard[] = [
  {
    id: 'card_antigravity',
    title: 'Antigravity',
    subtitle: 'AI Coding Assistant',
    iconName: 'Code',
    category: 'app',
    targetAppOrCommand: 'Antigravity',
    accentColor: '#38bdf8',
    badgeText: 'AI'
  },
  {
    id: 'card_music',
    title: 'Music',
    subtitle: 'Spotify / Apple Music',
    iconName: 'PlayCircle',
    category: 'app',
    targetAppOrCommand: 'Music',
    accentColor: '#f43f5e',
    badgeText: 'AUDIO'
  },
  {
    id: 'card_whatsapp',
    title: 'WhatsApp',
    subtitle: 'Messaging App',
    iconName: 'Globe',
    category: 'app',
    targetAppOrCommand: 'WhatsApp',
    accentColor: '#10b981',
    badgeText: 'CHAT'
  },
  {
    id: 'card_vscode',
    title: 'VS Code',
    subtitle: 'Visual Studio Code',
    iconName: 'Terminal',
    category: 'app',
    targetAppOrCommand: 'Visual Studio Code',
    accentColor: '#818cf8',
    badgeText: 'IDE'
  },
  {
    id: 'card_gemini',
    title: 'Gemini',
    subtitle: 'Google AI Portal',
    iconName: 'Layers',
    category: 'app',
    targetAppOrCommand: 'Gemini',
    accentColor: '#a855f7',
    badgeText: 'AI'
  },
  {
    id: 'card_github',
    title: 'GitHub',
    subtitle: 'Code Repositories',
    iconName: 'Globe',
    category: 'app',
    targetAppOrCommand: 'GitHub',
    accentColor: '#f59e0b',
    badgeText: 'GIT'
  },
  {
    id: 'card_screenshot',
    title: 'Screenshot',
    subtitle: 'Capture Mac Screen',
    iconName: 'Palette',
    category: 'macro',
    targetAppOrCommand: 'Screenshot',
    accentColor: '#ec4899',
    badgeText: 'MACRO'
  },
  {
    id: 'card_lock',
    title: 'Lock Mac',
    subtitle: 'Sleep Screen',
    iconName: 'Lock',
    category: 'macro',
    targetAppOrCommand: 'LockMac',
    accentColor: '#38bdf8',
    badgeText: 'SECURITY'
  },
  {
    id: 'card_mute',
    title: 'Mute Mac',
    subtitle: 'Mute System Audio',
    iconName: 'VolumeX',
    category: 'macro',
    targetAppOrCommand: 'MuteMac',
    accentColor: '#f43f5e',
    badgeText: 'AUDIO'
  }
];

export function App() {
  const [currentPage, setCurrentPage] = useState<ViewPage>('standby');
  const [nightMode, setNightMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<StreamDeckCard | undefined>(undefined);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cards, setCards] = useState<StreamDeckCard[]>(INITIAL_CARDS);

  const [macSpecs, setMacSpecs] = useState<MacSystemSpecs>({
    cpuUsage: 0,
    gpuUsage: 0,
    memoryUsedGB: 0,
    memoryTotalGB: 16.0,
    memoryPercentage: 0,
    macName: "Connecting to Mac...",
    isConnected: false
  });

  const [mediaState, setMediaState] = useState<MediaTrackState>({
    trackName: 'Waiting for Mac Music...',
    artist: 'Open Spotify or Apple Music on Mac',
    album: 'Mac Integration',
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    isPlaying: false,
    durationSeconds: 180,
    positionSeconds: 0,
    volume: 75,
    sourceApp: 'System'
  });

  const [config, setConfig] = useState<SettingsConfig>({
    macHostIp: 'localhost',
    macPort: 3001,
    autoConnect: true,
    nightMode: false,
    standbyTheme: 'glass',
    enableHaptics: true
  });

  useEffect(() => {
    const unsubSpecs = macController.subscribeSpecs(setMacSpecs);
    const unsubMedia = macController.subscribeMedia(setMediaState);
    const unsubToast = macController.subscribeToast((msg) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3500);
    });

    return () => {
      unsubSpecs();
      unsubMedia();
      unsubToast();
    };
  }, []);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    if (Math.abs(diffX) > 60) {
      if (diffX > 0 && currentPage === 'standby') {
        setCurrentPage('streamdeck');
      } else if (diffX < 0 && currentPage === 'streamdeck') {
        setCurrentPage('standby');
      }
    }
    setTouchStartX(null);
  };

  const handleLaunchCard = (card: StreamDeckCard) => {
    macController.launchApp(card.targetAppOrCommand);
  };

  const handleSaveCard = (savedCard: StreamDeckCard) => {
    setCards((prev) => {
      const exists = prev.some((c) => c.id === savedCard.id);
      if (exists) {
        return prev.map((c) => (c.id === savedCard.id ? savedCard : c));
      }
      return [...prev, savedCard];
    });
  };

  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`app-container ${nightMode ? 'night-mode' : ''}`}
    >
      <TopBarNavigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        nightMode={nightMode}
        onToggleNightMode={() => setNightMode(!nightMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        macSpecs={macSpecs}
        volume={mediaState.volume}
        onVolumeChange={(vol) => macController.setVolume(vol)}
      />

      <main className="main-content">
        {currentPage === 'standby' ? (
          <StandbyScreen
            macSpecs={macSpecs}
            mediaState={mediaState}
            onTogglePlayPause={() => macController.togglePlayPause()}
            onNextTrack={() => macController.nextTrack()}
            onPrevTrack={() => macController.previousTrack()}
            onSeek={(sec) => macController.seekPosition(sec)}
            onNavigateToStreamDeck={() => setCurrentPage('streamdeck')}
          />
        ) : (
          <StreamDeckScreen
            cards={cards}
            onLaunch={handleLaunchCard}
            onOpenMusicModal={() => setIsMusicModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenButtonEditor={(card) => {
              setEditingCard(card);
              setIsEditorOpen(true);
            }}
            mediaState={mediaState}
          />
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={(newCfg) => {
          setConfig(newCfg);
          setNightMode(newCfg.nightMode);
          macController.setMacAddress(newCfg.macHostIp, newCfg.macPort);
        }}
        macSpecs={macSpecs}
        onReconnectMac={() => macController.connect()}
      />

      <MusicDetailModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        mediaState={mediaState}
        onTogglePlayPause={() => macController.togglePlayPause()}
        onNextTrack={() => macController.nextTrack()}
        onPrevTrack={() => macController.previousTrack()}
        onSeek={(sec) => macController.seekPosition(sec)}
        onVolumeChange={(vol) => macController.setVolume(vol)}
      />

      <ButtonEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingCard(undefined);
        }}
        cardToEdit={editingCard}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />

      <ToastNotification message={toastMessage} />
    </div>
  );
}

export default App;
