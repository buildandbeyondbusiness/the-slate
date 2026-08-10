/**
 * Mac Companion Agent for "The Slate" (StandBy & Stream Deck PWA)
 * 
 * Runs natively on Mac to allow launching Mac applications, controlling music,
 * and streaming CPU/GPU/Memory stats over WebSockets to your Samsung Tab PWA.
 * 
 * Usage:
 *   node companion-server/server.js
 */

const http = require('http');
const { exec, execSync } = require('child_process');
const os = require('os');
const WebSocket = require('ws');

const PORT = 3001;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({ status: 'ok', message: 'Mac Companion Server Running' }));
});

const wss = new WebSocket.Server({ server });

console.log(`\n======================================================`);
console.log(`    The Slate — Mac Companion Server Started!       `);
console.log(`   Running on port: http://localhost:${PORT}`);
console.log(`   Connect your Tablet to your Mac's IP on port ${PORT}`);
console.log(`======================================================\n`);

// Helper to execute shell command safely
function runCmd(cmd) {
  return new Promise((resolve) => {
    exec(cmd, (error, stdout) => {
      if (error) resolve('');
      else resolve(stdout.trim());
    });
  });
}

// AppleScript queries for Spotify / Apple Music
async function getMediaState() {
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
      return {
        trackName: trackName || 'No Track',
        artist: artist || 'Spotify',
        album: album || '',
        albumArt: albumArt || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80',
        isPlaying: pState === 'playing',
        durationSeconds: Math.round(parseFloat(tDur) || 180),
        positionSeconds: Math.round(parseFloat(pPos) || 0),
        volume: parseInt(sysVol) || 75,
        sourceApp: 'Spotify'
      };
    }
  }

  // Fallback / Apple Music check
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
      return {
        trackName: trackName || 'No Track',
        artist: artist || 'Apple Music',
        album: album || '',
        albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
        isPlaying: pState === 'playing',
        durationSeconds: Math.round(parseFloat(tDur) || 180),
        positionSeconds: Math.round(parseFloat(pPos) || 0),
        volume: parseInt(sysVol) || 75,
        sourceApp: 'Apple Music'
      };
    }
  }

  // Default fallback if no player active
  return {
    trackName: 'No Active Playback',
    artist: 'Open Spotify or Apple Music on Mac',
    album: 'Mac Companion Active',
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    isPlaying: false,
    durationSeconds: 180,
    positionSeconds: 0,
    volume: 80,
    sourceApp: 'System'
  };
}

// Calculate CPU Usage %
function getCpuUsage() {
  const cpus = os.cpus();
  let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
  cpus.forEach((cpu) => {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  });
  const total = user + nice + sys + idle + irq;
  return Math.round(((total - idle) / total) * 100);
}

// Get Memory Metrics
function getMemorySpecs() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryUsedGB = Number((usedMem / (1024 * 1024 * 1024)).toFixed(1));
  const memoryTotalGB = Number((totalMem / (1024 * 1024 * 1024)).toFixed(1));
  const memoryPercentage = Math.round((usedMem / totalMem) * 100);

  return {
    memoryUsedGB,
    memoryTotalGB,
    memoryPercentage
  };
}

// Broadcast updates to connected clients
wss.on('connection', (ws) => {
  console.log('[Companion] Client connected (Samsung Tab / Browser)');

  // Send initial data immediately
  sendUpdate(ws);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('[Companion] Received Action:', data);

      if (data.action === 'LAUNCH_APP') {
        const appName = data.appName;
        if (appName === 'LockMac') {
          runCmd(`pmset displaysleepnow`);
        } else if (appName === 'MuteMic') {
          runCmd(`osascript -e "set volume input volume 0"`);
        } else if (appName === 'LaunchDev') {
          runCmd(`open -a "Visual Studio Code" && open -a "iTerm" || open -a "Terminal"`);
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
        runCmd(`osascript -e 'tell application "Spotify" to set player position to ${pos}'`);
      }
    } catch (err) {
      console.error('[Companion] Error handling client message:', err);
    }
  });

  ws.on('close', () => {
    console.log('[Companion] Client disconnected');
  });
});

async function sendUpdate(wsClient) {
  const mem = getMemorySpecs();
  const cpu = getCpuUsage();
  const media = await getMediaState();

  const specsPayload = {
    type: 'SYSTEM_SPECS',
    payload: {
      cpuUsage: cpu,
      gpuUsage: Math.round(cpu * 0.7), // Estimated GPU activity
      memoryUsedGB: mem.memoryUsedGB,
      memoryTotalGB: mem.memoryTotalGB,
      memoryPercentage: mem.memoryPercentage,
      macName: os.hostname() || "Sidhh's Mac",
      isConnected: true
    }
  };

  const mediaPayload = {
    type: 'MEDIA_STATE',
    payload: media
  };

  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send(JSON.stringify(specsPayload));
    wsClient.send(JSON.stringify(mediaPayload));
  } else {
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(specsPayload));
        client.send(JSON.stringify(mediaPayload));
      }
    });
  }
}

// Broadcast loop every 1.5s
setInterval(() => {
  if (wss.clients.size > 0) {
    sendUpdate();
  }
}, 1500);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on all network interfaces on port ${PORT}`);
});
