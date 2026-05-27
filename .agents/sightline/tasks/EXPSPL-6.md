---
title: "Bug: Raum kann nicht erstellt werden – urlaubskasse.html"
task: EXPSPL-6
created: 2026-05-27T16:17
---

## Root Cause

JSONBlob's actual API responses (POST, PUT, GET) do **not** include `Access-Control-Allow-Origin`. Only the OPTIONS preflight returns ACAO, which fools curl/Node — but browsers block the real responses with `TypeError: Failed to fetch`. All three sync operations (`syncCreate`, `syncPush`, `syncPull`) fail silently in the browser.

The note in `MS-4.md` ("CORS ist sauber") was incorrect — it only observed the OPTIONS preflight, not the actual POST response.

## Fix

Replace the JSONBlob backend with a serverless **CompressionStream-based link sharing** approach:

- `stateToCode()` — compress state via `CompressionStream('gzip')`, encode to base64url, prefix with `v1:`
- `codeToState()` — decode base64url, decompress via `DecompressionStream('gzip')`, parse JSON
- `getShareUrl(code)` — appends `#<code>` to the current page URL
- `syncCreate()` — compresses current state, copies shareable URL to clipboard
- `syncJoin(inputVal)` — accepts URL or raw `v1:…` code, loads state
- `syncPull()` / copy button — re-encodes current state and copies updated URL
- On page load: `location.hash` checked; if it starts with `v1:`, state is imported automatically

## Storage Migration

Old key `urlaubskasse:syncId` stored a JSONBlob UUID. New key `urlaubskasse:shareMode` stores `'1'` as a boolean flag. Old key is cleared on load if it contains a server-style ID.

## Trade-off

No real-time server sync — users share updated links manually. Fits the vacation expense-splitter use case (one person tracks, others import the snapshot).
