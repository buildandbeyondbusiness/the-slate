#!/usr/bin/env bash

# ================================================================
#   The Slate — macOS Executable Helper Server Launcher
# ================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo ""
echo "================================================================"
echo "    STARTING THE SLATE MAC COMPANION SERVER..."
echo "================================================================"
echo ""

# Ensure node is available
if ! command -v node &> /dev/null
then
    echo "ERROR: Node.js is not found on your Mac. Please install Node.js."
    read -p "Press enter to exit..."
    exit 1
fi

# Run companion server
node "$DIR/companion-server/server.js"
