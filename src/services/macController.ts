import { MacSystemSpecs, MediaTrackState, StreamDeckCard } from '../types';

type SystemSpecsCallback = (specs: MacSystemSpecs) => void;
type MediaStateCallback = (media: MediaTrackState) => void;
type ToastCallback = (message: string) => void;

class MacControllerService {
  private ws: WebSocket | null = null;
  private macIp: string = 'localhost';
  private port: number = 3001;
  private isConnected: boolean = false;
  private reconnectTimer: any = null;

  private onSystemSpecsListeners: Set<SystemSpecsCallback> = new Set();
  private onMediaStateListeners: Set<MediaStateCallback> = new Set();
  private onToastListeners: Set<ToastCallback> = new Set();

  private mediaState: MediaTrackState = {
    trackName: 'Waiting for Mac Music...',
    artist: 'Open Spotify or Apple Music on Mac',
    album: 'Mac Companion Server',
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    isPlaying: false,
    durationSeconds: 180,
    positionSeconds: 0,
    volume: 75,
    sourceApp: 'System'
  };

  private systemSpecs: MacSystemSpecs = {
    cpuUsage: 0,
    gpuUsage: 0,
    memoryUsedGB: 0,
    memoryTotalGB: 16.0,
    memoryPercentage: 0,
    macName: 'Connecting to Mac...',
    isConnected: false
  };

  constructor() {
    // Attempt automatic IP discovery on load
    const savedIp = localStorage.getItem('slate_mac_ip');
    if (savedIp) {
      this.macIp = savedIp;
    } else if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      this.macIp = window.location.hostname;
    } else {
      this.macIp = 'localhost';
    }

    this.connectWebSocket();
  }

  public setMacAddress(ip: string, port: number = 3001) {
    this.macIp = ip || 'localhost';
    this.port = port;
    localStorage.setItem('slate_mac_ip', this.macIp);
    this.connectWebSocket();
  }

  public connectWebSocket() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
    }

    const wsUrl = `ws://${this.macIp}:${this.port}`;
    console.log(`[MacController] Connecting to Mac Companion at ${wsUrl}...`);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[MacController] Connected to Mac Companion!');
        this.isConnected = true;
        this.systemSpecs.isConnected = true;
        this.notifySpecs();
        this.notifyToast(`Connected to Mac (${this.macIp})`);
        
        if (this.reconnectTimer) {
          clearInterval(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'SYSTEM_SPECS') {
            this.systemSpecs = { ...data.payload, isConnected: true };
            this.notifySpecs();
          } else if (data.type === 'MEDIA_STATE') {
            this.mediaState = { ...data.payload };
            this.notifyMedia();
          }
        } catch (err) {
          console.error('[MacController] Message error:', err);
        }
      };

      this.ws.onerror = () => {
        this.handleDisconnect();
      };

      this.ws.onclose = () => {
        this.handleDisconnect();
      };
    } catch (err) {
      this.handleDisconnect();
    }
  }

  private handleDisconnect() {
    if (this.isConnected) {
      this.notifyToast('Disconnected from Mac. Retrying auto-connect...');
    }
    this.isConnected = false;
    this.systemSpecs = {
      ...this.systemSpecs,
      isConnected: false,
      macName: `Mac Server Offline (${this.macIp})`
    };
    this.notifySpecs();

    if (!this.reconnectTimer) {
      this.reconnectTimer = setInterval(() => {
        if (!this.isConnected) {
          this.connectWebSocket();
        }
      }, 4000);
    }
  }

  // Real App Launching on Mac
  public launchApp(appOrCommand: string) {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'LAUNCH_APP',
        appName: appOrCommand
      }));
      this.notifyToast(`Launching ${appOrCommand} on Mac...`);
    } else {
      this.notifyToast(`Mac Server Offline. Double-click Start-The-Slate-Mac-Server.command on Mac!`);
    }
  }

  // Real Playback Controls
  public togglePlayPause() {
    this.mediaState.isPlaying = !this.mediaState.isPlaying;
    this.notifyMedia();

    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'MEDIA_PLAY_PAUSE' }));
    }
  }

  public nextTrack() {
    this.mediaState.positionSeconds = 0;
    this.notifyMedia();

    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'MEDIA_NEXT' }));
    }
  }

  public previousTrack() {
    this.mediaState.positionSeconds = 0;
    this.notifyMedia();

    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'MEDIA_PREV' }));
    }
  }

  public setVolume(vol: number) {
    this.mediaState.volume = Math.max(0, Math.min(100, vol));
    this.notifyMedia();

    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'SET_VOLUME', volume: vol }));
    }
  }

  public seekPosition(seconds: number) {
    this.mediaState.positionSeconds = seconds;
    this.notifyMedia();

    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'SEEK_MEDIA', position: seconds }));
    }
  }

  // Subscriptions
  public subscribeSpecs(cb: SystemSpecsCallback) {
    this.onSystemSpecsListeners.add(cb);
    cb(this.systemSpecs);
    return () => this.onSystemSpecsListeners.delete(cb);
  }

  public subscribeMedia(cb: MediaStateCallback) {
    this.onMediaStateListeners.add(cb);
    cb(this.mediaState);
    return () => this.onMediaStateListeners.delete(cb);
  }

  public subscribeToast(cb: ToastCallback) {
    this.onToastListeners.add(cb);
    return () => this.onToastListeners.delete(cb);
  }

  private notifySpecs() {
    this.onSystemSpecsListeners.forEach((cb) => cb({ ...this.systemSpecs }));
  }

  private notifyMedia() {
    this.onMediaStateListeners.forEach((cb) => cb({ ...this.mediaState }));
  }

  private notifyToast(msg: string) {
    this.onToastListeners.forEach((cb) => cb(msg));
  }
}

export const macController = new MacControllerService();
