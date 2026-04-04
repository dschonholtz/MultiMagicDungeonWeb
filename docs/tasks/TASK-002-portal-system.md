# TASK-002 — Vibe Jam 2026 Portal System

**Status**: IN_PROGRESS  
**Phase**: 0 — Vibe Jam Skeleton

## Goal

Full implementation of the Vibe Jam 2026 portal system. Players can travel to other games in the jam via the green exit portal, and arrive from other games via a red start portal.

## Acceptance Criteria

- [ ] `?portal=true` in the URL skips the name entry screen
- [ ] `?username=X` sets the player name on arrival
- [ ] `?ref=hostname` causes a red "return" portal to spawn near the player start
- [ ] Red portal is not enterable for the first 5 seconds (prevents instant return)
- [ ] Green exit portal is always visible in the dungeon
- [ ] Walking into the green portal navigates to `https://jam.pieter.com/portal/2026` with correct outgoing params
- [ ] Walking into the red return portal navigates back to the `ref` hostname with correct params
- [ ] Outgoing params include: `portal=true`, `ref`, `username`, `color`, `speed`, `hp`
- [ ] Portal has a glowing torus ring + translucent inner circle + label
- [ ] Portal animates (slow rotation)
- [ ] An iframe preload fires when the player gets within 50 units of the exit portal

## URL Param Spec

### Incoming
| Param | Type | Meaning |
|---|---|---|
| `portal` | `"true"` | Arrived from another game; skip name screen |
| `ref` | string | Hostname of the origin game |
| `username` | string | Player name |
| `color` | string | Player cosmetic color |
| `speed` | float | Movement speed modifier |
| `hp` | int | Current HP (carry-over) |

### Outgoing
Same params, with `ref` set to `window.location.hostname`.

## Test Plan

1. Open `index.html` — name screen appears. Enter name, proceed. Green portal visible in distance.
2. Open `index.html?portal=true&username=Tester&ref=example.com` — name screen is skipped, red portal spawns near start.
3. Walk to green portal — verify redirect to `jam.pieter.com/portal/2026` with correct params in URL.
4. Try entering red portal immediately after spawn — should not work (5s delay).
5. Wait 5s, walk into red portal — verify redirect to `http://example.com/?portal=true&...`.

## Dependencies

- TASK-001 (player movement must work to walk into portals)

## Blocked By

Nothing.
