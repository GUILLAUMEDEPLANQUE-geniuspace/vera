#!/bin/sh
set -eu
cd /workspace
if ! curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  npm run dev >>/tmp/app-startup.log 2>&1 &
  i=0
  while [ "$i" -lt 40 ]; do
    if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
      break
    fi
    i=$((i + 1))
    sleep 0.4
  done
fi
# Attach the live-preview proxy to this app (survives hibernate/revive).
curl -sf -o /dev/null --max-time 2 -X POST http://127.0.0.1:6015/__control/target \
  -H 'content-type: application/json' \
  -d '{"port":8080}' || true
