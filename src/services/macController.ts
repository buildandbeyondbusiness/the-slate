import { MacSystemSpecs, MediaTrackState, StreamDeckCard } from '../types';

type SystemSpecsCallback = (specs: MacSystemSpecs) => void;
type MediaStateCallback = (media: MediaTrackState) => void;
type ToastCallback = (message: string) => void;

class MacControllerService {
  private ws: WebSocket | null = null;
  private macIp: string = 'localhost';
  private port: number = 3001;
  private isConnected: boolean = false;
  private isScanning: boolean = false;
  private httpPollTimer: any = null;

  private onSystemSpecsListeners: Set<SystemSpecsCallback> = new Set();
  private onMediaStateListeners: Set<MediaStateCallback> = new Set();
  private onToastListeners: Set<ToastCallback> = new Set();

  private mediaState: MediaTrackState = {
    trackName: 'Waiting for Mac Connection...',
    artist: 'Run Start-The-Slate-Mac-Server on Mac',
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
    const hostname = window.location.hostname;
    
    // Valid local IP check (not GitHub Pages or external domain)
    const isLocalHostname = hostname === 'localhost' || 
                           hostname === '127.0.0.1' || 
                           /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);

    if (savedIp) {
      this.macIp = savedIp;
    } else if (isLocalHostname) {
      this.macIp = hostname;
    } else {
      this.macIp = 'localhost';
    }

    this.connect();
    
    // Auto-discover Mac IP on local network if not connected after 1.5 seconds
    setTimeout(() => {
      if (!this.isConnected) {
        this.autoDiscoverMacIp();
      }
    }, 1500);
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

  // Local Wi-Fi Subnet Auto-Discovery Engine
  public async autoDiscoverMacIp() {
    if (this.isConnected || this.isScanning) return;
    this.isScanning = true;
    this.notifyToast("🔍 Auto-scanning local network for Mac companion server...");

    // Try common candidates first
    const candidates = ['localhost', '127.0.0.1', '192.168.0.110', '192.168.0.100', '192.168.1.100', '192.168.1.110'];
    for (const ip of candidates) {
      if (await this.tryHttpIp(ip)) {
        this.macIp = ip;
        localStorage.setItem('slate_mac_ip', ip);
        this.isScanning = false;
        return;
      }
    }

    // Scan subnets 192.168.0.X and 192.168.1.X in parallel batches
    const subnets = ['192.168.0', '192.168.1'];
    for (const subnet of subnets) {
      const pings: Promise<string | null>[] = [];
      for (let i = 2; i < 254; i++) {
        const testIp = `${subnet}.${i}`;
        pings.push(
          fetch(`http://${testIp}:${this.port}/ping`, {
            method: 'GET',
            signal: AbortSignal.timeout(800)
          })
            .then(res => res.ok ? testIp : null)
            .catch(() => null)
        );
      }

      const results = await Promise.all(pings);
      const foundIp = results.find(ip => ip !== null);
      if (foundIp) {
        this.setMacAddress(foundIp, this.port);
        this.isScanning = false;
        return;
      }
    }

    this.isScanning = false;
  }

  private connectWebSocket() {
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }

    const wsUrl = `ws://${this.macIp}:${this.port}`;
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[MacController] WebSocket Connected');
        this.setConnectedState(true, `Connected to Mac (${this.macIp})`);
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
    const success = await this.tryHttpIp(this.macIp);
    if (!success) {
      this.isConnected = false;
      this.systemSpecs = {
        ...this.systemSpecs,
        isConnected: false,
        macName: `Mac Offline (${this.macIp})`
      };
      this.notifySpecs();
    }
  }

  private async tryHttpIp(ip: string): Promise<boolean> {
    try {
      const res = await fetch(`http://${ip}:${this.port}/api/state`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(1200)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.systemSpecs && data.mediaState) {
          this.macIp = ip;
          localStorage.setItem('slate_mac_ip', ip);
          this.systemSpecs = { ...data.systemSpecs, isConnected: true };
          this.mediaState = { ...data.mediaState };
          this.setConnectedState(true, `Connected to Mac (${ip})`);
          this.notifySpecs();
          this.notifyMedia();
          return true;
        }
      }
    } catch (err) {}
    return false;
  }

  private startHttpPolling() {
    if (this.httpPollTimer) clearInterval(this.httpPollTimer);
    this.httpPollTimer = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.fetchHttpState();
      }
    }, 1200);
  }

  private setConnectedState(connected: boolean, msg: string) {
    if (!this.isConnected && connected) {
      this.notifyToast(msg);
    }
    this.isConnected = connected;
    this.systemSpecs.isConnected = connected;
    this.notifySpecs();
  }

  // 3-Tier Guaranteed Action Delivery (WS -> HTTP POST -> GET Image Beacon)
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
      return;
    } catch (e) {}

    try {
      const queryParams = new URLSearchParams();
      if (payload.action) queryParams.set('action', payload.action);
      if (payload.appName) queryParams.set('appName', payload.appName);
      if (payload.volume !== undefined) queryParams.set('volume', String(payload.volume));
      if (payload.position !== undefined) queryParams.set('position', String(payload.position));

      const img = new Image();
      img.src = `http://${this.macIp}:${this.port}/api/action?${queryParams.toString()}&_t=${Date.now()}`;
    } catch (err) {}
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
