/**
 * The Slate — Production Mac Companion Agent
 * 
 * High-performance, zero-latency macOS native integration server.
 * - Apple Music & Spotify Real-Time Sync Engine
 * - Interactive Screenshot Selection Menu (screencapture -i -c)
 * - Mute / Unmute Toggle Logic
 * - Native Mac App Launchers
 */

const http = require('http');
const { exec } = require('child_process');
const os = require('os');
const https = require('https');
const url = require('url');

let WebSocketServer = null;
try {
  WebSocketServer = require('ws').Server;
} catch (e) {}

const PORT = 3001;

let lastCpuTimes = getCpuTimes();
let cachedCpuUsage = 15;
let cachedMediaState = null;
let lastMediaFetchTime = 0;
let lastMutedVolume = 75;

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

const localIps = getLocalIPs();
const primaryIp = localIps[0] || 'localhost';

console.log(`\n================================================================`);
console.log(`  THE SLATE — MAC COMPANION AGENT (STABLE VERSION)`);
console.log(`================================================================`);
console.log(` 📌 YOUR MAC IP ADDRESS:  ${primaryIp}`);
console.log(` 📌 LOCAL TABLET WEB APP: http://${primaryIp}:3000`);
console.log(` 📌 COMPANION API PORT:   http://${primaryIp}:${PORT}`);
console.log(`================================================================\n`);

function runCmd(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: 3000 }, (error, stdout) => {
      if (error) resolve('');
      else resolve(stdout ? stdout.trim() : '');
    });
  });
}

function getCpuTimes() {
  const cpus = os.cpus();
  let user = 0, sys = 0, idle = 0, irq = 0;
  cpus.forEach((cpu) => {
    user += cpu.times.user;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  });
  return { user, sys, idle, irq, total: user + sys + idle + irq };
}

function getRealMemoryMetrics() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  const memoryUsedGB = Number((usedMem / (1024 * 1024 * 1024)).toFixed(1));
  const memoryTotalGB = Number((totalMem / (1024 * 1024 * 1024)).toFixed(1));
  const memoryPercentage = Math.round((usedMem / totalMem) * 100);

  return { memoryUsedGB, memoryTotalGB, memoryPercentage };
}

async function updateRealCpuUsage() {
  try {
    const raw = await runCmd("ps -A -o %cpu | awk '{s+=$1} END {print s}'");
    const totalCpuPercent = parseFloat(raw) || 0;
    const cpuCores = os.cpus().length || 8;
    const normalizedCpu = Math.min(100, Math.max(2, Math.round(totalCpuPercent / cpuCores)));
    cachedCpuUsage = normalizedCpu;
  } catch (e) {
    cachedCpuUsage = 18;
  }
}
setInterval(updateRealCpuUsage, 2000);
updateRealCpuUsage();

function fetchiTunesArtwork(trackName, artistName) {
  return new Promise((resolve) => {
    if (!trackName || trackName === 'No Active Playback') {
      return resolve('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80');
    }
    const query = encodeURIComponent(`${trackName} ${artistName}`);
    const reqUrl = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;

    https.get(reqUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0 && json.results[0].artworkUrl100) {
            const highRes = json.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
            return resolve(highRes);
          }
        } catch (e) {}
        resolve('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80');
      });
    }).on('error', () => {
      resolve('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80');
    });
  });
}

// REAL Media Reader (Apple Music & Spotify with Safe AppleScript Property Wrapping)
async function getRealMediaState() {
  const now = Date.now();
  if (cachedMediaState && (now - lastMediaFetchTime < 800)) {
    return cachedMediaState;
  }

  // 1. Apple Music Priority Check
  const musicRunning = await runCmd(`osascript -e 'if application "Music" is running then return "running"'`);
  if (musicRunning === 'running') {
    const script = `
      tell application "Music"
        try
          set tName to name of current track
          set tArtist to artist of current track
          set tAlbum to album of current track
          set pState to (player state as text)
          set pPos to player position
          set tDur to duration of current track
          set sysVol to sound volume
          return tName & "|||" & tArtist & "|||" & tAlbum & "|||" & pState & "|||" & pPos & "|||" & tDur & "|||" & sysVol
        on error
          return "NO_TRACK"
        end try
      end tell
    `;
    const res = await runCmd(script);
    if (res && res.includes('|||')) {
      const [trackName, artist, album, pState, pPos, tDur, sysVol] = res.split('|||');
      const artworkUrl = await fetchiTunesArtwork(trackName, artist);

      cachedMediaState = {
        trackName: trackName || 'Apple Music Track',
        artist: artist || 'Apple Music Artist',
        album: album || 'Apple Music Album',
        albumArt: artworkUrl,
        isPlaying: pState.toLowerCase().includes('play'),
        durationSeconds: Math.round(parseFloat(tDur) || 180),
        positionSeconds: Math.round(parseFloat(pPos) || 0),
        volume: parseInt(sysVol) || 75,
        sourceApp: 'Apple Music'
      };
      lastMediaFetchTime = now;
      return cachedMediaState;
    }
  }

  // 2. Spotify Priority Check
  const spotifyRunning = await runCmd(`osascript -e 'if application "Spotify" is running then return "running"'`);
  if (spotifyRunning === 'running') {
    const script = `
      tell application "Spotify"
        try
          set tName to name of current track
          set tArtist to artist of current track
          set tAlbum to album of current track
          set tArt to artwork url of current track
          set pState to (player state as text)
          set pPos to player position
          set tDur to (duration of current track) / 1000
          set sysVol to sound volume
          return tName & "|||" & tArtist & "|||" & tAlbum & "|||" & tArt & "|||" & pState & "|||" & pPos & "|||" & tDur & "|||" & sysVol
        on error
          return "NO_TRACK"
        end try
      end tell
    `;
    const res = await runCmd(script);
    if (res && res.includes('|||')) {
      const [trackName, artist, album, albumArt, pState, pPos, tDur, sysVol] = res.split('|||');
      let artworkUrl = albumArt;
      if (!artworkUrl || !artworkUrl.startsWith('http')) {
        artworkUrl = await fetchiTunesArtwork(trackName, artist);
      }

      cachedMediaState = {
        trackName: trackName || 'Spotify Track',
        artist: artist || 'Spotify Artist',
        album: album || 'Spotify Album',
        albumArt: artworkUrl,
        isPlaying: pState.toLowerCase().includes('play'),
        durationSeconds: Math.round(parseFloat(tDur) || 180),
        positionSeconds: Math.round(parseFloat(pPos) || 0),
        volume: parseInt(sysVol) || 75,
        sourceApp: 'Spotify'
      };
      lastMediaFetchTime = now;
      return cachedMediaState;
    }
  }

  // 3. Fallback when no active music player is playing
  cachedMediaState = {
    trackName: 'No Active Playback',
    artist: 'Open Apple Music or Spotify on Mac',
    album: os.hostname(),
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    isPlaying: false,
    durationSeconds: 180,
    positionSeconds: 0,
    volume: 75,
    sourceApp: 'System'
  };
  lastMediaFetchTime = now;
  return cachedMediaState;
}

async function getFullSpecs() {
  const mem = getRealMemoryMetrics();
  return {
    cpuUsage: cachedCpuUsage,
    gpuUsage: Math.min(100, Math.max(4, Math.round(cachedCpuUsage * 0.7))),
    memoryUsedGB: mem.memoryUsedGB,
    memoryTotalGB: mem.memoryTotalGB,
    memoryPercentage: mem.memoryPercentage,
    macName: os.hostname() || 'MacBook',
    isConnected: true
  };
}

// Native macOS Application Launching & Macro Engine
async function handleAction(data) {
  console.log('[MacCompanion] Executing Action:', data);
  if (!data || !data.action) return;

  if (data.action === 'LAUNCH_APP') {
    const target = (data.appName || '').trim();

    if (target === 'Music' || target === 'Apple Music') {
      runCmd(`open "/System/Applications/Music.app" || open -a "Music"`);
    } else if (target === 'Antigravity') {
      runCmd(`open "/Applications/Antigravity.app" || open -a "Antigravity" || open -a "Google Antigravity"`);
    } else if (target === 'WhatsApp') {
      runCmd(`open -a "WhatsApp" || open "/Applications/WhatsApp.app" || open "/Applications/‎WhatsApp.app"`);
    } else if (target === 'Visual Studio Code' || target === 'VS Code') {
      runCmd(`open "/Applications/Visual Studio Code.app" || open -a "Visual Studio Code" || open -a "Code"`);
    } else if (target === 'GitHub' || target === 'GitHub Desktop') {
      runCmd(`open -a "GitHub Desktop" || open "/Applications/GitHub Desktop.app" || open "https://github.com"`);
    } else if (target === 'Gemini') {
      runCmd(`open "https://gemini.google.com"`);
    } else if (target === 'LockMac') {
      runCmd(`pmset displaysleepnow`);
    } else if (target === 'MuteMac' || target === 'Mute') {
      // Toggle Mute / Unmute
      const currentVolRaw = await runCmd(`osascript -e 'output volume of (get volume settings)'`);
      const currentVol = parseInt(currentVolRaw) || 0;
      if (currentVol > 0) {
        lastMutedVolume = currentVol;
        runCmd(`osascript -e "set volume output volume 0"`);
      } else {
        const restoreVol = lastMutedVolume > 0 ? lastMutedVolume : 75;
        runCmd(`osascript -e "set volume output volume ${restoreVol}"`);
      }
    } else if (target === 'UnmuteMac' || target === 'Unmute') {
      const restoreVol = lastMutedVolume > 0 ? lastMutedVolume : 75;
      runCmd(`osascript -e "set volume output volume ${restoreVol}"`);
    } else if (target === 'Screenshot') {
      // Open Interactive Screenshot Selection Marquee Menu
      runCmd(`screencapture -i -c || open -a "Screenshot"`);
    } else {
      runCmd(`open -a "${target}"`);
    }
  } else if (data.action === 'MEDIA_PLAY_PAUSE') {
    runCmd(`osascript -e 'tell application "Music" to playpause' || osascript -e 'tell application "Spotify" to playpause'`);
  } else if (data.action === 'MEDIA_NEXT') {
    runCmd(`osascript -e 'tell application "Music" to next track' || osascript -e 'tell application "Spotify" to next track'`);
  } else if (data.action === 'MEDIA_PREV') {
    runCmd(`osascript -e 'tell application "Music" to previous track' || osascript -e 'tell application "Spotify" to previous track'`);
  } else if (data.action === 'SET_VOLUME') {
    const vol = Math.max(0, Math.min(100, data.volume || 50));
    runCmd(`osascript -e 'set volume output volume ${vol}'`);
  } else if (data.action === 'SEEK_MEDIA') {
    const pos = data.position || 0;
    runCmd(`osascript -e 'tell application "Music" to set player position to ${pos}' || osascript -e 'tell application "Spotify" to set player position to ${pos}'`);
  }
}

// Built-in HTTP REST API Server
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === '/api/state' || parsedUrl.pathname === '/ping' || parsedUrl.pathname === '/') {
    const specs = await getFullSpecs();
    const media = await getRealMediaState();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      systemSpecs: specs,
      mediaState: media
    }));
  } else if (parsedUrl.pathname === '/api/action') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          await handleAction(data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'success' }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'error' }));
        }
      });
    } else if (req.method === 'GET') {
      try {
        const query = parsedUrl.query;
        if (query.action) {
          await handleAction({
            action: query.action,
            appName: query.appName,
            volume: query.volume ? Number(query.volume) : undefined,
            position: query.position ? Number(query.position) : undefined
          });
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error' }));
      }
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'not_found' }));
  }
});

if (WebSocketServer) {
  try {
    const wss = new WebSocketServer({ server });
    wss.on('connection', (ws) => {
      console.log('[MacCompanion] WebSocket Connected');
    });
  } catch (err) {}
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Companion Server listening on 0.0.0.0:${PORT}`);
});
