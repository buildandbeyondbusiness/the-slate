import React, { useState, useEffect } from 'react';
import { ViewPage, MacSystemSpecs, MediaTrackState, StreamDeckCard, SettingsConfig, ClockStyle } from './types';
import { macController } from './services/macController';
import { TopBarNavigation } from './components/TopBarNavigation';
import { StandbyScreen } from './components/StandbyScreen';
import { StreamDeckScreen } from './components/StreamDeckScreen';
import { SettingsModal } from './components/SettingsModal';
import { MusicDetailModal } from './components/MusicDetailModal';
import { ButtonEditorModal } from './components/ButtonEditorModal';
import { ToastNotification } from './components/ToastNotification';
import { Wifi, RefreshCw, Zap } from 'lucide-react';

const INITIAL_CARDS: StreamDeckCard[] = [
  {
    id: 'card_antigravity',
    title: 'Antigravity',
    subtitle: 'AI Coding Assistant',
    iconName: 'Code',
    iconUrl: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/google-gemini.png',
    category: 'app',
    targetAppOrCommand: 'Antigravity',
    accentColor: '#E0A84E',
    badgeText: 'AI'
  },
  {
    id: 'card_music',
    title: 'Music',
    subtitle: 'Apple Music / Spotify',
    iconName: 'PlayCircle',
    iconUrl: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/apple-music.png',
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
    iconUrl: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/whatsapp.png',
    category: 'app',
    targetAppOrCommand: 'WhatsApp',
    accentColor: '#25D366',
    badgeText: 'CHAT'
  },
  {
    id: 'card_vscode',
    title: 'VS Code',
    subtitle: 'Visual Studio Code',
    iconName: 'Terminal',
    iconUrl: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/visual-studio-code.png',
    category: 'app',
    targetAppOrCommand: 'Visual Studio Code',
    accentColor: '#007ACC',
    badgeText: 'IDE'
  },
  {
    id: 'card_gemini',
    title: 'Gemini',
    subtitle: 'Google AI Portal',
    iconName: 'Layers',
    iconUrl: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/google-gemini.png',
    category: 'app',
    targetAppOrCommand: 'Gemini',
    accentColor: '#8E75FF',
    badgeText: 'AI'
  },
  {
    id: 'card_github',
    title: 'GitHub',
    subtitle: 'Code Repositories',
    iconName: 'Globe',
    iconUrl: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/github.png',
    category: 'app',
    targetAppOrCommand: 'GitHub',
    accentColor: '#F4D28A',
    badgeText: 'GIT'
  },
  {
    id: 'card_screenshot',
    title: 'Screenshot',
    subtitle: 'Capture Mac Screen',
    iconName: 'Palette',
    iconUrl: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/mac-os.png',
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
    iconUrl: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/keycloak.png',
    category: 'macro',
    targetAppOrCommand: 'LockMac',
    accentColor: '#E0A84E',
    badgeText: 'SECURITY'
  },
  {
    id: 'card_mute',
    title: 'Mute Mac',
    subtitle: 'Mute System Audio',
    iconName: 'VolumeX',
    iconUrl: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/audiobookshelf.png',
    category: 'macro',
    targetAppOrCommand: 'MuteMac',
    accentColor: '#D96C6C',
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
  
  // Persisted Apple Standby Clock Style & Color Accent
  const [clockStyle, setClockStyle] = useState<ClockStyle>(() => {
    return (localStorage.getItem('the_slate_clock_style') as ClockStyle) || 'curvy-apple';
  });

  const [clockColor, setClockColor] = useState<string>(() => {
    return localStorage.getItem('the_slate_clock_color') || '#E0A84E';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cards, setCards] = useState<StreamDeckCard[]>(INITIAL_CARDS);
  const [ipInput, setIpInput] = useState('');

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
    clockStyle: clockStyle,
    clockColor: clockColor,
    enableHaptics: true
  });

  const handleClockStyleChange = (newStyle: ClockStyle) => {
    setClockStyle(newStyle);
    localStorage.setItem('the_slate_clock_style', newStyle);
  };

  const handleClockColorChange = (newColor: string) => {
    setClockColor(newColor);
    localStorage.setItem('the_slate_clock_color', newColor);
  };

  // WebApp Simulated Finger Press & Fullscreen Trigger Engine
  useEffect(() => {
    const simulateFingerPress = () => {
      const btn = document.getElementById('fullscreen-btn');
      if (btn) {
        try {
          // Dispatch synthetic touch, pointer, and click events directly on the fullscreen button
          btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'touch' }));
          btn.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true }));
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          btn.click();
        } catch (e) {}
      }

      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    };

    // Trigger synthetic finger presses at 500ms, 1500ms, and 3000ms after load
    const t1 = setTimeout(simulateFingerPress, 500);
    const t2 = setTimeout(simulateFingerPress, 1500);
    const t3 = setTimeout(simulateFingerPress, 3000);

    // Global first gesture fallback
    window.addEventListener('touchstart', simulateFingerPress, { once: true });
    window.addEventListener('pointerdown', simulateFingerPress, { once: true });
    window.addEventListener('click', simulateFingerPress, { once: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('touchstart', simulateFingerPress);
      window.removeEventListener('pointerdown', simulateFingerPress);
      window.removeEventListener('click', simulateFingerPress);
    };
  }, []);

  useEffect(() => {
    setIpInput(macController.getMacIp());
    const unsubSpecs = macController.subscribeSpecs((specs) => {
      setMacSpecs(specs);
    });
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

  const handleConnectIp = () => {
    if (ipInput.trim()) {
      macController.setMacAddress(ipInput.trim());
    }
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

      {/* Disconnected Mac Auto-Connect Banner */}
      {!macSpecs.isConnected && (
        <div style={{ background: 'rgba(224, 168, 78, 0.15)', borderBottom: '1px solid rgba(224, 168, 78, 0.3)', backdropFilter: 'blur(16px)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', zIndex: 50, color: '#F4D28A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
            <Wifi style={{ width: '18px', height: '18px', color: clockColor }} />
            <span><strong>Mac Companion Offline:</strong> Enter your Mac's Wi-Fi IP (e.g. <code>192.168.0.110</code>) or run USB cable:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="e.g. 192.168.0.110"
              style={{ background: '#171A1D', border: '1px solid #2A2F34', color: '#F1F3F4', borderRadius: '12px', padding: '6px 12px', fontSize: '0.85rem', width: '150px' }}
            />
            <button
              onClick={handleConnectIp}
              style={{ background: clockColor, color: '#0D0F10', border: 'none', padding: '6px 14px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Zap style={{ width: '14px', height: '14px' }} />
              <span>Connect</span>
            </button>

            <button
              onClick={() => macController.autoDiscoverMacIp()}
              style={{ background: '#202428', color: '#F1F3F4', border: '1px solid #2A2F34', padding: '6px 12px', borderRadius: '12px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              <span>Scan Subnet</span>
            </button>
          </div>
        </div>
      )}

      <main className="main-content">
        {currentPage === 'standby' ? (
          <StandbyScreen
            macSpecs={macSpecs}
            mediaState={mediaState}
            clockStyle={clockStyle}
            clockColor={clockColor}
            onClockStyleChange={handleClockStyleChange}
            onOpenMusicModal={() => setIsMusicModalOpen(true)}
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
        config={{
          ...config,
          clockStyle,
          clockColor
        }}
        onSaveConfig={(newCfg) => {
          setConfig(newCfg);
          setNightMode(newCfg.nightMode);
          if (newCfg.clockStyle) handleClockStyleChange(newCfg.clockStyle);
          if (newCfg.clockColor) handleClockColorChange(newCfg.clockColor);
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
