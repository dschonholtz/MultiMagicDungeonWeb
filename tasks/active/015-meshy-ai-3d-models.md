# Task 015: Meshy.ai 3D Models (Player Wizard + Dragon)

**Status:** planning
**Created:** 2026-04-05

Use the Meshy.ai API key (in `~/.zshrc` as `MESHY_API_KEY`) to generate proper textured 3D GLB models for the wizard player and the dragon, and display them in the `/assets` viewer alongside the existing voxel versions.

---

## Background

Meshy.ai has a text-to-3D API that returns a rigged `.glb` with UV-mapped textures. The `/assets` viewer already has OrbitControls + Three.js, so dropping in a GLBLoader is straightforward.

The voxel dragon and voxel wizard stay in the game — these Meshy models are first added to the asset viewer for inspection. Later tasks can decide whether to swap them into gameplay.

---

## API Flow (Meshy text-to-3D)

```
POST https://api.meshy.ai/openapi/v2/text-to-3d
{ "mode": "preview", "prompt": "...", "art_style": "realistic" }
→ { "result": "task_id" }

GET https://api.meshy.ai/openapi/v2/text-to-3d/{task_id}
→ { "status": "SUCCEEDED", "model_urls": { "glb": "https://..." } }
```

Two-phase: preview (fast, low-res) then optionally refine. We run preview first, inspect result, then refine if it looks good.

---

## Options Considered

### Option A — Python script, models committed to repo
Write `scripts/generate_meshy_models.py`. Script polls until done, downloads GLBs to `public/models/`. Asset viewer loads them with `GLTFLoader`.
**Pros:** Reproducible, auditable. GLBs committed so server doesn't need to call Meshy at runtime.
**Cons:** GLB files can be large (1-20 MB each) — check size before committing.

### Option B — Node script embedded in build
Same idea but in JS, runs via `node scripts/generate_meshy_models.js`.
**Pros:** Consistent toolchain.
**Cons:** More boilerplate (fetch vs requests).

**Chosen: Option A** — Python is simpler for API polling loops; files committed to repo.

---

## Success Criteria

1. `scripts/generate_meshy_models.py` runs end-to-end and produces:
   - `public/models/wizard.glb`
   - `public/models/dragon.glb`
2. `/assets` viewer has two new entries: "Meshy Wizard" and "Meshy Dragon"
3. Models load in the viewer with OrbitControls; no console errors
4. Models are under 15 MB each (if larger, use draco compression or refine prompt)
5. All 28 Playwright tests still pass

---

## Plan

1. Read `~/.zshrc` to find the exact env var name for the Meshy key
2. Write `scripts/generate_meshy_models.py`:
   - `POST /v2/text-to-3d` for wizard: `"A cute chibi fantasy wizard in purple robe and tall pointed hat, game character, clean geometry"`
   - `POST /v2/text-to-3d` for dragon: `"A fearsome fantasy dragon, deep blue-black scales, cyan accents, wings spread, game character"`
   - Poll `GET /v2/text-to-3d/{task_id}` every 5s until `SUCCEEDED`
   - Download `model_urls.glb` → `public/models/wizard.glb` and `public/models/dragon.glb`
3. Add `GLTFLoader` import to `assets/index.html` (r128 CDN):
   `https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js`
4. Add "Meshy Wizard" and "Meshy Dragon" asset entries in the viewer's asset list
5. Each entry: load GLB, center on stage, start OrbitControls
6. Verify file sizes — if > 15 MB, add a note to refine or compress
7. `npm test` — 28/28
8. Commit including GLB files (or add LFS note if too large)

---

## Execution Log

*(empty — not yet started)*

---

## Code Review & Test Results

*(empty — not yet started)*

### Process Friction Notes

*(filled in after execution)*

---

## Deploy & Screenshots

*(empty — not yet started)*
