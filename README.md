# MultiMagicDungeonWeb

Browser-based multiplayer magic dungeon game built with Three.js. Build dungeons, raid others, duel with spell primitives. Vibe Jam 2026 participant.

**Play**: [Coming soon — will be deployed to GitHub Pages]

**Original UE5 version**: [dschonholtz/MultiMagicDungeon](https://github.com/dschonholtz/MultiMagicDungeon)

## How to run locally

```bash
# Option 1: Just open the file
open index.html

# Option 2: Dev server (recommended for multiplayer later)
npx vite
```

## Vision

Same core loop as the UE5 version, but zero-install and browser-native:
- Roam an overworld → find dungeon entrances built by other players
- Raid dungeons using composable spell primitives (Fireball, Frostbolt, Telekinesis)
- Build your own dungeon to defend
- Duel other players in the corridors

## Portal System (Vibe Jam 2026)

This game is part of the Vibe Jam 2026 webring. Walk into the green portal to travel to other games in the jam. If you arrive from another game, a red portal spawns at your start point.

URL params on arrival: `?portal=true&ref=&username=&color=&speed=&hp=`

## Contributing

1. Read `CLAUDE.md` for agent onboarding and code conventions
2. Check `docs/PROGRESS.md` for active tasks
3. Pick a task from `docs/tasks/`
4. Submit a PR

## License

MIT — see LICENSE
