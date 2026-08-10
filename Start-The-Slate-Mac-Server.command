#!/usr/bin/env bash

# ================================================================
#   The Slate — USB Cable & Wi-Fi Mac Server Launcher
# ================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo ""
echo "================================================================"
echo "  STARTING THE SLATE MAC SERVER & LOCAL WEB APP"
echo "================================================================"
echo ""

# Enable USB Cable Port Forwarding via ADB if Samsung Tab is plugged in
if command -v adb &> /dev/null; then
    echo "🔌 Setting up USB Cable port forwarding via ADB..."
    adb reverse tcp:3000 tcp:3000 2>/dev/null
    adb reverse tcp:3001 tcp:3001 2>/dev/null
    if [ $? -eq 0 ]; then
        echo " SUCCESS: USB Cable Connection Active!"
        echo " 📌 USB CABLE TABLET URL:  http://localhost:3000"
    fi
    echo "----------------------------------------------------------------"
fi

# Get primary Wi-Fi IP as fallback
IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "localhost")

echo " 📌 WI-FI TABLET URL:       http://${IP}:3000"
echo " 📌 MAC COMPANION PORT:    http://${IP}:3001"
echo "================================================================"
echo " 💡 USB CABLE CONNECTION INSTRUCTIONS:"
echo " 1. Connect Samsung Tab to Mac using USB Cable."
echo " 2. Open Chrome on Tab & go to: http://localhost:3000"
echo "================================================================"
echo ""

# Kill any previous instance running on port 3000/3001
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Start companion server & web app simultaneously
node "$DIR/companion-server/server.cjs" &
PID_SERVER=$!

npx vite --host 0.0.0.0 --port 3000 &
PID_VITE=$!

trap "kill $PID_SERVER $PID_VITE 2>/dev/null" EXIT

wait
