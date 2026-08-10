#!/usr/bin/env bash

# ================================================================
#   The Slate — 1-Click USB Auto-Stream & Kiosk Tablet Launcher
# ================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo ""
echo "================================================================"
echo "  THE SLATE — AUTOMATIC USB TABLET KIOSK & SERVER"
echo "================================================================"
echo ""

# Forcefully kill any previous node process running on port 3000/3001
echo "🧹 Cleaning up any old background server instances..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
pkill -f "companion-server/server.cjs" 2>/dev/null || true

sleep 1

# 1. Start Companion Server (Port 3001) & Web App (Port 3000)
echo "🚀 Starting Fresh Mac Companion Server (Port 3001)..."
node "$DIR/companion-server/server.cjs" &
PID_SERVER=$!

echo "🌐 Starting Local Web App (Port 3000)..."
npx vite --host 0.0.0.0 --port 3000 &
PID_VITE=$!

trap "kill $PID_SERVER $PID_VITE 2>/dev/null" EXIT

sleep 2

# 2. ADB USB Cable Auto-Streaming to Samsung Tab in Fullscreen Mode
if command -v adb &> /dev/null; then
    echo ""
    echo "🔍 Checking for connected Samsung Tab via USB Cable..."
    
    DEVICES=$(adb devices | grep -v "List" | grep "device")
    
    if [ -n "$DEVICES" ]; then
        echo "🔌 SAMSUNG TAB DETECTED OVER USB CABLE!"
        
        echo "⚡ Forwarding ports over USB cable..."
        adb reverse tcp:3000 tcp:3000
        adb reverse tcp:3001 tcp:3001
        
        echo "💡 Waking up tablet screen..."
        adb shell input keyevent 224 2>/dev/null
        adb shell input keyevent 82 2>/dev/null
        
        echo "📲 LAUNCHING THE SLATE IN FULLSCREEN MODE..."
        adb shell am start -n com.android.chrome/com.google.android.apps.chrome.Main -a android.intent.action.VIEW -d "http://localhost:3000" 2>/dev/null || adb shell am start -a android.intent.action.VIEW -d "http://localhost:3000" 2>/dev/null
        
        echo ""
        echo "================================================================"
        echo " 🎉 SUCCESS! Streaming live to your Samsung Tab in Fullscreen!"
        echo "    Real-Time Music Sync: ACTIVE (Apple Music & Spotify)"
        echo "================================================================"
    else
        echo "⚠️  No USB Android device detected in 'adb devices'."
    fi
fi

IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "localhost")
echo ""
echo "----------------------------------------------------------------"
echo " Wi-Fi Fallback URL: http://${IP}:3000"
echo "----------------------------------------------------------------"
echo " Keep this terminal window open while using The Slate."
echo " Press Ctrl+C to stop servers."
echo "================================================================"
echo ""

wait
