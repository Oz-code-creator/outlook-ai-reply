#!/usr/bin/env bash
# מריץ את כל הבדיקות: לוגיקה, Worker, service worker, וממשק (Playwright).
# דרישות: node 20+, python3, playwright גלובלי (NODE_PATH). פורטים 8766 (האתר) ו-8767 (שרת סנכרון מדומה).
cd "$(dirname "$0")" || exit 1
ROOT="$(cd .. && pwd)"
cp "$ROOT/cyprus-worker/sync-worker.js" sync-worker.mjs
export NODE_PATH="$(npm root -g)"
(cd "$ROOT/docs" && python3 -m http.server 8766 >/dev/null 2>&1 & echo $! > /tmp/cyprus-http.pid)
node mock-sync-server.mjs >/dev/null 2>&1 & echo $! > /tmp/cyprus-sync.pid
sleep 1.5
fail=0
for f in logic.test.js worker-*.test.mjs service-worker.test.mjs; do
  if node "$f" >/tmp/cyprus-test.out 2>&1; then echo "PASS $f"; else echo "FAIL $f"; tail -5 /tmp/cyprus-test.out; fail=1; fi
done
for f in ui-*.js; do
  timeout 180 node "$f" >/tmp/cyprus-test.out 2>&1
  if grep -q "^errors: \[\]" /tmp/cyprus-test.out && ! grep -qE "Error|TimeoutError" /tmp/cyprus-test.out; then echo "PASS $f"; else echo "FAIL $f"; tail -8 /tmp/cyprus-test.out; fail=1; fi
done
kill "$(cat /tmp/cyprus-http.pid)" "$(cat /tmp/cyprus-sync.pid)" 2>/dev/null
exit $fail
