#!/bin/bash
set -e

echo "Starting PS5 WebKit Server..."

cd /app/www

# Start Python HTTP server on port 80
python3 -m http.server 80
