# TASK-002 — Vibe Jam Portal System

**Status:** DONE
**Phase:** 0 — Vibe Jam Skeleton
**Owner:** (unassigned)

## Goal

Implement the Vibe Jam 2026 portal webring system. Players arriving from other Vibe Jam games enter with their state intact. Players can exit to the next game in the webring.

## Acceptance Criteria

### Entry
- [x] `?portal=true` in URL skips the start/name-entry screen
- [x] `?username=alice` sets player display name (no name entry needed)
- [x] `?hp=80` sets player HP to 80
- [x] `?ref=othergame.com` spawns a RED torus portal at spawn point
- [x] Red portal has 5-second collision delay (prevents instant bounce-back)
- [x] "Arrived from: othergame.com" shown in HUD when ref present
- [x] `?rotation_y=1.57` sets player initial camera rotation

### Exit portal
- [x] GREEN torus portal (0x00ff00) exists at a fixed world position
- [x] Portal is labeled "VIBE JAM 2026"
- [x] Within 50 units: hidden iframe preloads `https://jam.pieter.com/portal/2026`
- [x] Within 15 units: "VIBE JAM 2026 PORTAL — WALK IN" indicator shown in HUD
- [x] Within 2 units: redirect to `https://jam.pieter.com/portal/2026` with params

### Start portal (return)
- [x] Walking into red start portal returns to `ref` URL
- [x] Params forwarded: `portal=true`, `username`, `color`, `speed`, `hp`
- [x] `ref` param is NOT forwarded (prevents infinite loop)
- [x] Only active after 5-second delay

## Related

- Depends on: TASK-001 (needs player + scene)
- Vibe Jam docs: https://jam.pieter.com