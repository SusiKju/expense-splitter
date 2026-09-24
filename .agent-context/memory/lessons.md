# Lessons Learned

<!-- Format: - **[scope]** Lesson (YYYY-MM-DD) ttl:VALUE source:SOURCE conf:LEVEL -->
<!-- TTL: infinite (architecture/security) | 90d (gotchas/quirks) | 30d (sprint/temp) -->
<!-- Source: user (user-confirmed) | discovered (agent-found) | external (from docs/code) -->
<!-- Conf: high | med | low — used for contradiction resolution (higher conf wins) -->

- **[browser-test]** Before any browser test on localhost:8934, re-check `localStorage['urlaubskasse:room']` in the SAME step and abort if set — the user can join a live room between turns; test inputs then sync straight to Firebase/friends. Happened 2026-09-24 (room CW7BPW, restored manually). (2026-09-24) ttl:infinite source:discovered conf:high
- **[browser-test]** Room-gated UI safely testable via `http://127.0.0.1:8934` instead of `localhost` — separate origin = separate localStorage, so a fake room code (e.g. `ZZZZZ9`, join fails read-only) never touches the user's live room. Clear localStorage there afterwards. (2026-09-24) ttl:90d source:discovered conf:high
- **[service-worker]** `render()` runs `renderEvent` last; any earlier render throw (e.g. `Settlement.paymentAction is not a function`) silently hides the header event line on devices whose SW cached an old `settlement.js` (SW served scripts stale-while-revalidate, HTML network-first → mismatch). Fixed ES-24: scripts network-first, `settlement.js` precached, CACHE v3. Bump `CACHE` in `sw.js` whenever settlement.js API changes. Check the browser console first for "X is not a function". (2026-09-24) ttl:infinite source:discovered conf:high
