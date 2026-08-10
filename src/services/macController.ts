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
  private httpPollTimer: any = null;

  private onSystemSpecsListeners: Set<SystemSpecsCallback> = new Set();
  private onMediaStateListeners: Set<MediaStateCallback> = new Set();
  private onToastListeners: Set<ToastCallback> = new Set();

  private mediaState: MediaTrackState = {
    trackName: 'Waiting for Mac Connection...',
    artist: 'Plug USB Cable or Connect Wi-Fi',
    album: 'Mac Integration',
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
    macName: 'Mac Disconnected',
    isConnected: false
  };

  constructor() {
    const savedIp = localStorage.getItem('slate_mac_ip');
    if (savedIp) {
      this.macIp = savedIp;
    } else if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      this.macIp = window.location.hostname;
    } else {
      this.macIp = 'localhost';
    }

    this.connect();
  }

  public setMacAddress(ip: string, port: number = 3001) {
    this.macIp = ip.trim() || 'localhost';
    this.port = port;
    localStorage.setItem('slate_mac_ip', this.macIp);
    this.connect();
  }

  public getMacIp() {
    return this.macIp;
  }

  public connect() {
    this.connectWebSocket();
    this.startHttpPolling();
  }

  private connectWebSocket() {
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }

    const wsUrl = `ws://${this.macIp}:${this.port}`;
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[MacController] Connected via WebSocket');
        const connType = (this.macIp === 'localhost' || this.macIp === '127.0.0.1') ? 'USB Cable' : 'Wi-Fi Network';
        this.setConnectedState(true, `Connected to Mac via ${connType}!`);
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
        } catch (err) {}
      };

      this.ws.onerror = () => {
        this.handleWsFailure();
      };

      this.ws.onclose = () => {
        this.handleWsFailure();
      };
    } catch (err) {
      this.handleWsFailure();
    }
  }

  private handleWsFailure() {
    if (!this.isConnected) {
      this.fetchHttpState();
    }
  }

  private async fetchHttpState() {
    try {
      const res = await fetch(`http://${this.macIp}:${this.port}/api/state`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.systemSpecs && data.mediaState) {
          this.systemSpecs = { ...data.systemSpecs, isConnected: true };
          this.mediaState = { ...data.mediaState };
          const connType = (this.macIp === 'localhost' || this.macIp === '127.0.0.1') ? 'USB Cable' : 'Wi-Fi Network';
          this.setConnectedState(true, `Connected to Mac via ${connType}!`);
          this.notifySpecs();
          this.notifyMedia();
          return;
        }
      }
    } catch (err) {}

    if (window.location.protocol === 'https:') {
      this.notifyToast(`💡 Plug USB Cable & open http://localhost:3000 on tablet!`);
    } else if (this.isConnected) {
      this.notifyToast(`Disconnected from Mac (${this.macIp}). Retrying...`);
    }

    this.isConnected = false;
    this.systemSpecs = {
      ...this.systemSpecs,
      isConnected: false,
      macName: `Mac Server Disconnected (${this.macIp})`
    };
    this.notifySpecs();
  }

  private startHttpPolling() {
    if (this.httpPollTimer) clearInterval(this.httpPollTimer);
    this.httpPollTimer = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.fetchHttpState();
      }
    }, 1500);
  }

  private setConnectedState(connected: boolean, msg: string) {
    if (!this.isConnected && connected) {
      this.notifyToast(msg);
    }
    this.isConnected = connected;
    this.systemSpecs.isConnected = connected;
    this.notifySpecs();
  }

  public async sendAction(payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
      return;
    }

    try {
      await fetch(`http://${this.macIp}:${this.port}/api/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      this.notifyToast(`Failed to send action. Open http://localhost:3000 on tablet over USB.`);
    }
  }

  public launchApp(appOrCommand: string) {
    this.notifyToast(`Launching ${appOrCommand} on Mac...`);
    this.sendAction({ action: 'LAUNCH_APP', appName: appOrCommand });
  }

  public togglePlayPause() {
    this.mediaState.isPlaying = !this.mediaState.isPlaying;
    this.notifyMedia();
    this.sendAction({ action: 'MEDIA_PLAY_PAUSE' });
  }

  public nextTrack() {
    this.mediaState.positionSeconds = 0;
    this.notifyMedia();
    this.sendAction({ action: 'MEDIA_NEXT' });
  }

  public previousTrack() {
    this.mediaState.positionSeconds = 0;
    this.notifyMedia();
    this.sendAction({ action: 'MEDIA_PREV' });
  }

  public setVolume(vol: number) {
    this.mediaState.volume = Math.max(0, Math.min(100, vol));
    this.notifyMedia();
    this.sendAction({ action: 'SET_VOLUME', volume: vol });
  }

  public seekPosition(seconds: number) {
    this.mediaState.positionSeconds = seconds;
    this.notifyMedia();
    this.sendAction({ action: 'SEEK_MEDIA', position: seconds });
  }

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
