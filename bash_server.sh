#!/bin/bash

PORT=3000
HTML_FILE="static_version.html"

# Check if we have the static HTML file
if [ ! -f "$HTML_FILE" ]; then
  echo "Error: $HTML_FILE not found."
  exit 1
fi

echo "Starting bash HTTP server on port $PORT"
echo "Press Ctrl+C to stop"

# Read the static HTML content
HTML_CONTENT=$(cat "$HTML_FILE")
HTML_LENGTH=${#HTML_CONTENT}

# Simple response headers
HTTP_OK="HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: $HTML_LENGTH\r\nConnection: close\r\n\r\n"

# Create a TCP server using bash
# (This is a very basic implementation with limited functionality)
coproc nc -l 0.0.0.0 $PORT

while true; do
  # Read the HTTP request
  read -r line <&"${COPROC[0]}"
  
  # Skip empty requests
  if [ -z "$line" ]; then
    continue
  fi
  
  echo "Received request: $line"
  
  # Read and discard headers
  while read -r header <&"${COPROC[0]}" && [ -n "$header" ] && [ "$header" != $'\r' ]; do
    true
  done
  
  # Send response
  echo -e "$HTTP_OK$HTML_CONTENT" >&"${COPROC[1]}"
  
  # Close this connection and start a new one
  kill $COPROC_PID
  wait $COPROC_PID 2>/dev/null
  coproc nc -l 0.0.0.0 $PORT
done