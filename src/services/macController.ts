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
  private mockTimer: any = null;

  private onSystemSpecsListeners: Set<SystemSpecsCallback> = new Set();
  private onMediaStateListeners: Set<MediaStateCallback> = new Set();
  private onToastListeners: Set<ToastCallback> = new Set();

  private mediaState: MediaTrackState = {
    trackName: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy',
    albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80',
    isPlaying: true,
    durationSeconds: 230,
    positionSeconds: 84,
    volume: 75,
    sourceApp: 'Spotify'
  };

  private systemSpecs: MacSystemSpecs = {
    cpuUsage: 34,
    gpuUsage: 18,
    memoryUsedGB: 9.2,
    memoryTotalGB: 18.0,
    memoryPercentage: 51,
    macName: 'Sidhh\'s MacBook Pro M3',
    isConnected: false
  };

  constructor() {
    this.startMockSimulation();
  }

  public setMacAddress(ip: string, port: number = 3001) {
    this.macIp = ip || 'localhost';
    this.port = port;
    this.connectWebSocket();
  }

  public connectWebSocket() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
    }

    const wsUrl = `ws://${this.macIp}:${this.port}`;
    console.log(`[MacController] Connecting to ${wsUrl}...`);

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
          console.error('[MacController] Error parsing message:', err);
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
      this.notifyToast('Mac Companion disconnected. Using fallback mode.');
    }
    this.isConnected = false;
    this.systemSpecs.isConnected = false;
    this.notifySpecs();

    if (!this.reconnectTimer) {
      this.reconnectTimer = setInterval(() => {
        if (!this.isConnected) {
          this.connectWebSocket();
        }
      }, 10000);
    }
  }

  // Real or Simulated App Launching
  public launchApp(appOrCommand: string) {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'LAUNCH_APP',
        appName: appOrCommand
      }));
      this.notifyToast(`Launching ${appOrCommand} on Mac...`);
    } else {
      // Fallback local notification
      console.log(`[Simulated] Launching ${appOrCommand}`);
      this.notifyToast(`🚀 Launched ${appOrCommand} on Mac!`);
    }
  }

  // Media Controls (Play, Pause, Skip, Rewind, Seek, Volume)
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
    } else {
      // Simulated next track rotation
      const demoTracks = [
        { name: 'Blinding Lights', artist: 'The Weeknd', art: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80' },
        { name: 'Midnight City', artist: 'M83', art: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80' },
        { name: 'Get Lucky', artist: 'Daft Punk ft. Pharrell', art: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80' }
      ];
      const randomIndex = Math.floor(Math.random() * demoTracks.length);
      const track = demoTracks[randomIndex];
      this.mediaState.trackName = track.name;
      this.mediaState.artist = track.artist;
      this.mediaState.albumArt = track.art;
      this.notifyMedia();
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

  // Listeners
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

  // Smooth local simulation timer when offline
  private startMockSimulation() {
    if (this.mockTimer) clearInterval(this.mockTimer);

    this.mockTimer = setInterval(() => {
      if (!this.isConnected) {
        // Dynamic simulated CPU / GPU / RAM fluctuation
        const newCpu = Math.min(95, Math.max(12, this.systemSpecs.cpuUsage + (Math.random() * 8 - 4)));
        const newGpu = Math.min(90, Math.max(8, this.systemSpecs.gpuUsage + (Math.random() * 6 - 3)));
        const memoryUsedGB = Number((8.2 + Math.random() * 0.8).toFixed(1));
        const memoryPercentage = Math.round((memoryUsedGB / this.systemSpecs.memoryTotalGB) * 100);

        this.systemSpecs = {
          ...this.systemSpecs,
          cpuUsage: Math.round(newCpu),
          gpuUsage: Math.round(newGpu),
          memoryUsedGB,
          memoryPercentage
        };
        this.notifySpecs();

        // Increment track position if playing
        if (this.mediaState.isPlaying) {
          if (this.mediaState.positionSeconds < this.mediaState.durationSeconds) {
            this.mediaState.positionSeconds += 1;
          } else {
            this.mediaState.positionSeconds = 0;
          }
          this.notifyMedia();
        }
      }
    }, 1000);
  }
}

export const macController = new MacControllerService();
