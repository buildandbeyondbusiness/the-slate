#!/usr/bin/env bash

# ================================================================
#   The Slate — One-Click Mac Server & Web App Launcher
# ================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo ""
echo "================================================================"
echo "  STARTING THE SLATE MAC SERVER & LOCAL WEB APP"
echo "================================================================"
echo ""

# Get primary local IP
IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "localhost")

echo " 📌 YOUR TABLET URL:       http://${IP}:3000"
echo " 📌 MAC COMPANION PORT:    http://${IP}:3001"
echo "----------------------------------------------------------------"
echo " Open http://${IP}:3000 on your Samsung Tab for 100% instant"
echo " WebSocket connection with ZERO browser security blocks!"
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
