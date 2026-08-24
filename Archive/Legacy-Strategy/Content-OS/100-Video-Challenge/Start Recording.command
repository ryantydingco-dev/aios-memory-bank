#!/bin/zsh

set -u

REPO="/Users/ryantydingco/Documents/AIOS/dealthread-landing-live"
LOG="/tmp/ryan-record-now.log"

for PORT in {5182..5192}; do
  URL="http://localhost:${PORT}/record"
  if curl --silent --fail --max-time 2 "$URL" | grep --quiet "Record Now"; then
    open "$URL"
    exit 0
  fi
done

for PORT in {5182..5192}; do
  if ! lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    cd "$REPO" || exit 1
    nohup ./node_modules/.bin/next dev -p "$PORT" --webpack >"$LOG" 2>&1 &

    for ATTEMPT in {1..40}; do
      URL="http://localhost:${PORT}/record"
      if curl --silent --fail --max-time 2 "$URL" | grep --quiet "Record Now"; then
        open "$URL"
        exit 0
      fi
      sleep 1
    done

    open "$LOG"
    exit 1
  fi
done

osascript -e 'display alert "Record Now could not start" message "Ports 5182 through 5192 are already in use."'
exit 1
