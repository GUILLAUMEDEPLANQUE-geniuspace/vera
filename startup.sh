#!/bin/sh
set -eu
cd /workspace
LOG=/tmp/app-startup.log

is_up() {
  curl -sf -o /dev/null --max-time 3 http://127.0.0.1:8080/
}

if is_up; then
  exit 0
fi

npm run dev >>"$LOG" 2>&1 &

# Preview reporter waits ~15s after this script exits. Don't exit until
# the app actually answers, or the UI stays on "Preview stopped".
n=0
while [ "$n" -lt 60 ]; do
  if is_up; then
    exit 0
  fi
  n=$((n + 1))
  sleep 1
done
echo "startup: preview not healthy after 60s" >>"$LOG"
exit 1
