# Task 017: Project-Wide Code Review + Hardening Plan

**Status:** planning  
**Created:** 2026-04-05  
**Scope:** Client (`index.html`), WebSocket server (`server/`), test suite (`tests/`), and tooling configs.

---

## Skill Check (from AGENTS instructions)

Available skills in this session:
- `skill-creator` (for authoring skills)
- `skill-installer` (for installing skills)

Neither skill is directly relevant to a code-quality audit and remediation plan. This task proceeds with direct engineering review and issue tracking.

---

## Senior Review Summary

This repo is in a strong prototype state for a game jam (clear comments, deterministic generation helpers, reusable spell geometry/material caches, and a practical test seam). The main risk profile is **scale readiness** rather than correctness-at-small-scale.

Top themes:
1. **Single-file client architecture is becoming a bottleneck** for maintainability and change safety.
2. **Multiplayer server trusts client payloads too much** and has O(n) lookup patterns that won’t scale.
3. **Tests are useful but include brittle constants and rely on external infra** for multiplayer coverage.
4. **Security hardening gaps** exist around hidden iframe preload and permissive CORS behavior.

---

## Project Issue Tracker

| ID | Severity | Area | Issue | Evidence | Recommended Fix |
|---|---|---|---|---|---|
| ARC-001 | High | Architecture | `index.html` contains all runtime systems in one script block, raising regression risk and review friction. | Single-file game/client architecture. | Split into ES modules (`rendering`, `player`, `spells`, `network`, `ui`, `test-seam`) with thin bootstrap entrypoint. |
| GAME-001 | High | Gameplay | Local movement has no wall collision checks; players can clip through dungeon walls. | `updateLocal` adds movement directly to position. | Introduce collision queries against layout AABBs or wall planes before applying movement. |
| GAME-002 | Medium | Gameplay | Spike trap damage uses broad radius check and can feel unfair during hold state. | Damage continues while in radius, not by spike contact volume. | Tighten radius during hold and/or add per-trap hit cooldown or hitbox checks. |
| GAME-003 | Medium | Input/UX | `#interact-hint` inherits `pointer-events: none` from HUD, undermining touch interaction. | HUD disables pointer events globally. | Add `pointer-events: all` on `#interact-hint`. |
| PERF-001 | High | Rendering | Dungeon rendering clones textures/materials repeatedly per surface, increasing GPU memory churn. | Wall/floor/ceiling clone patterns in renderer. | Cache materials by repeat tuple and reuse; avoid per-surface texture clone where possible. |
| PERF-002 | Medium | Rendering | Spell/impact dynamic light usage can spike quickly under multiplayer combat. | Every spell adds light; every wall impact adds temporary point light. | Cap concurrent transient lights or pool/reuse lights. |
| PERF-003 | Medium | Rendering | Full minimap redraw every third frame does repeated static work. | Static rooms/corridors re-rendered each cycle. | Render static layer once to offscreen canvas; overlay dynamic markers each tick. |
| PERF-004 | Low | Rendering | `renderer.shadowMap.enabled = true` while scene appears to not use active cast/receive shadows. | Shadow map enabled globally. | Disable shadows or explicitly enable only where needed. |
| NET-001 | High | Client Networking | WebSocket client lacks reconnection strategy after runtime disconnect. | `onclose` transitions offline only. | Add reconnect with capped exponential backoff and session rejoin/identity strategy. |
| NET-002 | Medium | Client Networking | Message parse catch swallows errors silently. | Empty catch in `onmessage` parsing path. | Log parse/handler errors with rate limiting. |
| NET-003 | Medium | Server Networking | `_playerForWs` is O(n) lookup over all players for each message/disconnect. | Iterates `this.players.values()` each call. | Store `Map<WebSocket, playerId>` for O(1) routing. |
| NET-004 | High | Server Authority | Server accepts move payloads with minimal validation (`y`, `yaw`, `pitch` unconstrained). | `applyMove` only clamps x/z delta. | Validate finite numeric ranges and clamp all movement/rotation axes. |
| NET-005 | Medium | Server Robustness | Message size/rate limits are absent; spammers can send large or very frequent payloads. | No transport-level or app-level throttling. | Add max payload size at WS server and per-client token bucket rate limiting. |
| SEC-001 | Critical | Security | Hidden portal preload iframe is injected without sandbox and can load external content. | Creates hidden `iframe` with external URL. | Remove preload or add strict `sandbox` + allowlist and fallback handling. |
| SEC-002 | Medium | Security | CORS in custom HTTP server is always `*`, unnecessary for same-origin app serving static assets. | `Access-Control-Allow-Origin: *` on every response. | Restrict CORS or remove header unless explicitly needed. |
| SEC-003 | Medium | Security | Production WS URL is hardcoded in client and not environment-switchable. | Constant URL in source. | Resolve WS endpoint from host/env config and keep prod URL as deployment config. |
| TEST-001 | Medium | Test Reliability | Spell test constants (`maxLifeMs`) diverge from runtime spell definitions. | Tests define 1333/2000/1667 while runtime uses 6000 fallback + distance caps. | Derive expectations from exposed runtime spell defs or assert behaviorally (created/expired within envelope). |
| TEST-002 | Medium | Test Reliability | Multiplayer tests depend on live remote WS server, reducing determinism. | Tests skip when server unreachable. | Add local WS fixture in CI/test workflow and point tests to local server. |
| TEST-003 | Low | Test Coverage | No automated assertions for reconnection behavior or server authority constraints. | Missing scenarios in suite. | Add tests for reconnect, move validation, malformed payload handling, and rename sanitization. |
| OPS-001 | Low | Tooling | No lint/type check pipeline configured for client and server code. | Scripts cover tests only. | Add ESLint (client + server) and optional JSDoc typings/TypeScript migration path. |
| OPS-002 | Low | Docs | Multiple task files exist with mixed states; review findings are spread across active/done notes. | Task history fragmentation. | Consolidate review backlog into single canonical tracker doc and link from `docs/PROGRESS.md`. |

---

## Remediation Plan (Phased)

### Phase 0 — Safety & Security First (1 day)
- Fix SEC-001 (iframe hardening/removal).
- Fix NET-002 (non-silent parse errors).
- Fix GAME-003 (touch interaction pointer-events).
- Add quick regression tests for these fixes.

### Phase 1 — Multiplayer Trust & Resilience (2–3 days)
- Implement NET-001 reconnection/backoff on client.
- Implement NET-003 O(1) websocket-to-player routing.
- Implement NET-004/NET-005 server input validation + rate limits.
- Add TEST-003 cases for malformed payloads/reconnect.

### Phase 2 — Performance Baseline (2 days)
- Implement PERF-001 material/texture reuse.
- Implement PERF-003 minimap static layer caching.
- Add PERF-002 light cap/pool.
- Re-profile frame time and GC pressure before/after.

### Phase 3 — Test Determinism & Tooling (1–2 days)
- Fix TEST-001 drift-prone constants.
- Fix TEST-002 by introducing local multiplayer server in test workflow.
- Add OPS-001 lint checks to CI/local scripts.

### Phase 4 — Architecture Refactor (incremental)
- Execute ARC-001 module split with parity-first approach (no gameplay changes).
- Move systems in slices: constants/config → player/network → spells → UI/HUD → test seam.
- Keep Playwright green after each slice.


## Recommended Starting Order (Execution Queue)

### Start first (P0)
1. **Task 031 — SEC-001:** Remove/sandbox portal iframe preload (critical security).
2. **Task 026 — NET-001:** Client reconnect/backoff for session resilience.
3. **Task 029 — NET-004:** Server move validation hardening (authority/safety).
4. **Task 019 — GAME-001:** Wall collision to prevent clipping through geometry.
5. **Task 022 — PERF-001:** Material/texture reuse to reduce GPU churn.

### Next wave (P1)
- Tasks 028, 030, 035, 034, 021, 024, 033.

### Follow-up (P2)
- Tasks 020, 023, 025, 027, 032, 036, 037, 038, 018.

---

---

## Tracking Board (for follow-up execution)

| Status | IDs |
|---|---|
| Todo | ARC-001, GAME-001, GAME-002, GAME-003, PERF-001, PERF-002, PERF-003, PERF-004, NET-001, NET-002, NET-003, NET-004, NET-005, SEC-001, SEC-002, SEC-003, TEST-001, TEST-002, TEST-003, OPS-001, OPS-002 |
| In Progress | — |
| Blocked | — |
| Done | — |

---

## Definition of Done for this planning task

1. Project-wide issues are enumerated with severity and actionable fixes.
2. A phased delivery plan sequences work by risk and impact.
3. A single tracking board exists so follow-up tasks can close items by ID.
4. No gameplay/runtime code is modified in this planning task.
