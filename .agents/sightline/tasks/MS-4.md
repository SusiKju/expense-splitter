---
title: Bug: "Raum konnte nicht erstellt werden"
task: MS-4
created: 2026-05-27T16:03
---

## Root Cause

JSONBlob hat das ID-Format von numerisch (z.B. `1234567890`) auf UUID (z.B. `019e69c0-545c-7c0b-9543-31e541d567eb`) umgestellt.

Die Regex `/^\d{10,}$/` in `syncCreate()` und `syncJoin()` schlägt bei UUID-IDs fehl → Exception → catch → Toast "Raum konnte nicht erstellt werden".

CORS ist sauber: JSONBlob exponiert `Location` und `x-jsonblob-id` via `Access-Control-Expose-Headers`.

## Betroffene Stellen

- `syncCreate()` Zeile ~1686: `if (!id || !/^\d{10,}$/.test(id)) throw ...`
- `syncJoin()` Zeile ~1751: `id.match(/jsonBlob\/(\d+)/)` + gleiche Regex

## Fix

Regex auf `/^[\w-]{10,}$/` erweitern (matcht sowohl alte numerische IDs als auch UUIDs).
URL-Extraktions-Regex in `syncJoin` entsprechend anpassen.
