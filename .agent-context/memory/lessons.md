# Lessons Learned

<!-- Format: - **[scope]** Lesson (YYYY-MM-DD) ttl:VALUE source:SOURCE conf:LEVEL -->
<!-- TTL: infinite (architecture/security) | 90d (gotchas/quirks) | 30d (sprint/temp) -->
<!-- Source: user (user-confirmed) | discovered (agent-found) | external (from docs/code) -->
<!-- Conf: high | med | low — used for contradiction resolution (higher conf wins) -->

- **[browser-test]** Before any browser test on localhost:8934, re-check `localStorage['urlaubskasse:room']` in the SAME step and abort if set — the user can join a live room between turns; test inputs then sync straight to Firebase/friends. Happened 2026-09-24 (room CW7BPW, restored manually). (2026-09-24) ttl:infinite source:discovered conf:high
