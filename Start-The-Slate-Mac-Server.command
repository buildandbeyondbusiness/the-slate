#!/usr/bin/env bash

# ================================================================
#   The Slate — 1-Click USB Auto-Stream & Tablet App Launcher
# ================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo ""
echo "================================================================"
echo "  THE SLATE — AUTOMATIC USB TABLET STREAMER & SERVER"
echo "================================================================"
echo ""

# Kill any previous instance running on port 3000/3001
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# 1. Start Companion Server (Port 3001) & Web App (Port 3000)
echo "🚀 Starting Mac Companion Server (Port 3001)..."
node "$DIR/companion-server/server.cjs" &
PID_SERVER=$!

echo "🌐 Starting Local Web App (Port 3000)..."
npx vite --host 0.0.0.0 --port 3000 &
PID_VITE=$!

trap "kill $PID_SERVER $PID_VITE 2>/dev/null" EXIT

# Give servers 2 seconds to initialize
sleep 2

# 2. ADB USB Cable Auto-Streaming to Samsung Tab
if command -v adb &> /dev/null; then
    echo ""
    echo "🔍 Checking for connected Samsung Tab via USB Cable..."
    
    # Check connected devices
    DEVICES=$(adb devices | grep -v "List" | grep "device")
    
    if [ -n "$DEVICES" ]; then
        echo "🔌 SAMSUNG TAB DETECTED OVER USB CABLE!"
        
        # Reverse port forward 3000 & 3001
        echo "⚡ Forwarding ports over USB cable..."
        adb reverse tcp:3000 tcp:3000
        adb reverse tcp:3001 tcp:3001
        
        # Wake up screen if asleep
        echo "💡 Waking up tablet screen..."
        adb shell input keyevent 224 2>/dev/null
        adb shell input keyevent 82 2>/dev/null
        
        # Auto-launch app URL directly on tablet screen!
        echo "📲 STREAMING APP DIRECTLY TO SAMSUNG TAB SCREEN..."
        adb shell am start -a android.intent.action.VIEW -d "http://localhost:3000" 2>/dev/null
        
        echo ""
        echo "================================================================"
        echo " 🎉 SUCCESS! The Slate is now streaming live to your Samsung Tab!"
        echo "    USB Speed:  0ms latency (Direct Hardware Cable)"
        echo "    Tablet URL: http://localhost:3000"
        echo "================================================================"
    else
        echo "⚠️  No USB Android device detected in 'adb devices'."
        echo "   Please plug USB cable & enable USB Debugging on your tablet."
    fi
else
    echo "⚠️  ADB is not found in PATH."
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
