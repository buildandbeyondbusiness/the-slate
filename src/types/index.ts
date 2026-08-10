export type ViewPage = 'standby' | 'streamdeck';

export interface MacSystemSpecs {
  cpuUsage: number; // 0 - 100%
  gpuUsage: number; // 0 - 100%
  memoryUsedGB: number;
  memoryTotalGB: number;
  memoryPercentage: number;
  macName: string;
  isConnected: boolean;
}

export interface MediaTrackState {
  trackName: string;
  artist: string;
  album: string;
  albumArt: string; // URL or base64 data image
  isPlaying: boolean;
  durationSeconds: number;
  positionSeconds: number;
  volume: number; // 0 - 100
  sourceApp: 'Spotify' | 'Apple Music' | 'System' | 'Simulated';
}

export type ActionCategory = 'app' | 'macro' | 'system' | 'media';

export interface StreamDeckCard {
  id: string;
  title: string;
  subtitle: string;
  iconName: string; // Lucide fallback icon name
  iconUrl?: string; // Authentic iOS App Icon URL
  category: ActionCategory;
  targetAppOrCommand: string;
  accentColor: string;
  badgeText?: string;
}

export type ClockStyle = 'curvy-apple' | 'pill-blocks' | 'minimal-hero' | 'playful-colors' | 'analog' | 'stacked' | 'world';

export interface SettingsConfig {
  macHostIp: string;
  macPort: number;
  autoConnect: boolean;
  nightMode: boolean;
  standbyTheme: 'glass' | 'midnight' | 'neon' | 'cyber';
  clockStyle?: ClockStyle;
  clockColor?: string;
  enableHaptics: boolean;
}
