/**
 * The Slate — High-Performance Mac Companion Agent
 * 
 * Multi-protocol Local Mac Integration (CommonJS .cjs):
 * - WebSocket Server (port 3001)
 * - HTTP REST API Server (with CORS enabled for browser apps)
 * - Zero-CPU Idle Polling
 */

const http = require('http');
const { exec } = require('child_process');
const os = require('os');
const WebSocket = require('ws');
const https = require('https');

const PORT = 3001;

let lastCpuTimes = getCpuTimes();
let cachedMediaState = null;
let lastMediaFetchTime = 0;

// Helper to get local Wi-Fi / Ethernet IP
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
console.log(`  THE SLATE — MAC COMPANION SERVER IS READY!`);
console.log(`----------------------------------------------------------------`);
console.log(` 📌 YOUR TABLET APP URL:  http://${primaryIp}:3000`);
console.log(` 📌 MAC COMPANION PORT:   http://${primaryIp}:${PORT}`);
console.log(`----------------------------------------------------------------`);
console.log(` Open http://${primaryIp}:3000 on your Samsung Tab for 100%`);
console.log(` instant WebSocket connection with ZERO browser security blocks!`);
console.log(`================================================================\n`);

// HTTP Server handling REST API + CORS + WebSockets
const server = http.createServer(async (req, res) => {
  // CORS Headers for browser cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/state' || req.url === '/ping' || req.url === '/') {
    const specs = await getFullSpecs();
    const media = await getRealMediaState();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      systemSpecs: specs,
      mediaState: media
    }));
  } else if (req.url === '/api/action' && req.method === 'POST') {
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
        res.end(JSON.stringify({ status: 'error', error: err.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'not_found' }));
  }
});

const wss = new WebSocket.Server({ server });

function runCmd(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: 2000 }, (error, stdout) => {
      if (error) resolve('');
      else resolve(stdout.trim());
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

function calculateCpuUsage() {
  const current = getCpuTimes();
  const idleDiff = current.idle - lastCpuTimes.idle;
  const totalDiff = current.total - lastCpuTimes.total;
  lastCpuTimes = current;

  if (totalDiff === 0) return 0;
  const usage = Math.round(((totalDiff - idleDiff) / totalDiff) * 100);
  return Math.max(0, Math.min(100, usage));
}

function getMemoryMetrics() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const memoryUsedGB = Number((used / (1024 * 1024 * 1024)).toFixed(1));
  const memoryTotalGB = Number((total / (1024 * 1024 * 1024)).toFixed(1));
  const memoryPercentage = Math.round((used / total) * 100);

  return { memoryUsedGB, memoryTotalGB, memoryPercentage };
}

async function getFullSpecs() {
  const cpuUsage = calculateCpuUsage();
  const mem = getMemoryMetrics();
  return {
    cpuUsage,
    gpuUsage: Math.round(cpuUsage * 0.65),
    memoryUsedGB: mem.memoryUsedGB,
    memoryTotalGB: mem.memoryTotalGB,
    memoryPercentage: mem.memoryPercentage,
    macName: os.hostname() || 'MacBook Pro',
    isConnected: true
  };
}

function fetchiTunesArtwork(trackName, artistName) {
  return new Promise((resolve) => {
    if (!trackName || trackName === 'No Active Playback') {
      return resolve('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80');
    }
    const query = encodeURIComponent(`${trackName} ${artistName}`);
    const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;

    https.get(url, (res) => {
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

async function getRealMediaState() {
  const now = Date.now();
  if (cachedMediaState && (now - lastMediaFetchTime < 800)) {
    return cachedMediaState;
  }

  // 1. Check Spotify
  const checkSpotify = await runCmd(`osascript -e 'if application "Spotify" is running then return "running"'`);
  if (checkSpotify === 'running') {
    const script = `
      tell application "Spotify"
        set tName to name of current track
        set tArtist to artist of current track
        set tAlbum to album of current track
        set tArt to artwork url of current track
        set pState to player state
        set pPos to player position
        set tDur to (duration of current track) / 1000
        set sysVol to sound volume
        return tName & "|||" & tArtist & "|||" & tAlbum & "|||" & tArt & "|||" & pState & "|||" & pPos & "|||" & tDur & "|||" & sysVol
      end tell
    `;
    const result = await runCmd(script);
    if (result && result.includes('|||')) {
      const [trackName, artist, album, albumArt, pState, pPos, tDur, sysVol] = result.split('|||');
      let artworkUrl = albumArt;
      if (!artworkUrl || !artworkUrl.startsWith('http')) {
        artworkUrl = await fetchiTunesArtwork(trackName, artist);
      }

      cachedMediaState = {
        trackName: trackName || 'Spotify Track',
        artist: artist || 'Spotify Artist',
        album: album || 'Spotify Album',
        albumArt: artworkUrl,
        isPlaying: pState === 'playing',
        durationSeconds: Math.round(parseFloat(tDur) || 180),
        positionSeconds: Math.round(parseFloat(pPos) || 0),
        volume: parseInt(sysVol) || 75,
        sourceApp: 'Spotify'
      };
      lastMediaFetchTime = now;
      return cachedMediaState;
    }
  }

  // 2. Check Apple Music
  const checkMusic = await runCmd(`osascript -e 'if application "Music" is running then return "running"'`);
  if (checkMusic === 'running') {
    const script = `
      tell application "Music"
        set tName to name of current track
        set tArtist to artist of current track
        set tAlbum to album of current track
        set pState to player state
        set pPos to player position
        set tDur to duration of current track
        set sysVol to sound volume
        return tName & "|||" & tArtist & "|||" & tAlbum & "|||" & pState & "|||" & pPos & "|||" & tDur & "|||" & sysVol
      end tell
    `;
    const result = await runCmd(script);
    if (result && result.includes('|||')) {
      const [trackName, artist, album, pState, pPos, tDur, sysVol] = result.split('|||');
      const artworkUrl = await fetchiTunesArtwork(trackName, artist);

      cachedMediaState = {
        trackName: trackName || 'Apple Music Track',
        artist: artist || 'Apple Music Artist',
        album: album || 'Apple Music Album',
        albumArt: artworkUrl,
        isPlaying: pState === 'playing',
        durationSeconds: Math.round(parseFloat(tDur) || 180),
        positionSeconds: Math.round(parseFloat(pPos) || 0),
        volume: parseInt(sysVol) || 75,
        sourceApp: 'Apple Music'
      };
      lastMediaFetchTime = now;
      return cachedMediaState;
    }
  }

  // 3. Fallback
  cachedMediaState = {
    trackName: 'No Active Playback',
    artist: 'Open Spotify or Apple Music on Mac',
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

async function handleAction(data) {
  console.log('[MacCompanion] Action:', data);
  if (data.action === 'LAUNCH_APP') {
    const appName = data.appName;
    if (appName === 'LockMac') {
      runCmd(`pmset displaysleepnow`);
    } else if (appName === 'MuteMic') {
      runCmd(`osascript -e "set volume input volume 0"`);
    } else if (appName === 'LaunchDev') {
      runCmd(`open -a "Visual Studio Code" && open -a "Terminal"`);
    } else {
      runCmd(`open -a "${appName}"`);
    }
  } else if (data.action === 'MEDIA_PLAY_PAUSE') {
    runCmd(`osascript -e 'tell application "Spotify" to playpause' || osascript -e 'tell application "Music" to playpause'`);
  } else if (data.action === 'MEDIA_NEXT') {
    runCmd(`osascript -e 'tell application "Spotify" to next track' || osascript -e 'tell application "Music" to next track'`);
  } else if (data.action === 'MEDIA_PREV') {
    runCmd(`osascript -e 'tell application "Spotify" to previous track' || osascript -e 'tell application "Music" to previous track'`);
  } else if (data.action === 'SET_VOLUME') {
    const vol = Math.max(0, Math.min(100, data.volume || 50));
    runCmd(`osascript -e 'set volume output volume ${vol}'`);
  } else if (data.action === 'SEEK_MEDIA') {
    const pos = data.position || 0;
    runCmd(`osascript -e 'tell application "Spotify" to set player position to ${pos}' || osascript -e 'tell application "Music" to set player position to ${pos}'`);
  }
}

wss.on('connection', (ws) => {
  console.log('[MacCompanion] WebSocket Client Connected!');
  sendMetrics(ws);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      await handleAction(data);
    } catch (err) {
      console.error('[MacCompanion] WS Message Error:', err);
    }
  });
});

async function sendMetrics(wsClient) {
  const specs = await getFullSpecs();
  const media = await getRealMediaState();

  const specsPayload = { type: 'SYSTEM_SPECS', payload: specs };
  const mediaPayload = { type: 'MEDIA_STATE', payload: media };

  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send(JSON.stringify(specsPayload));
    wsClient.send(JSON.stringify(mediaPayload));
  } else {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(specsPayload));
        client.send(JSON.stringify(mediaPayload));
      }
    });
  }
}

setInterval(() => {
  if (wss.clients.size > 0) {
    sendMetrics();
  }
}, 1200);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on all interfaces on port ${PORT}`);
});
