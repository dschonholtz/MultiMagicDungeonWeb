# Task 015: Meshy.ai 3D Models (Player Wizard + Dragon)

**Status:** planning
**Created:** 2026-04-05
**Updated:** 2026-04-05 — rewritten: JS only, full pipeline, check existing models first

**Read first:** `.claude/skills/meshy-3d/SKILL.md`

Use the Meshy.ai API to generate proper textured, rigged, animated GLB models for the wizard player and the dragon. Display both in the `/assets` viewer alongside the existing voxel versions.

The voxel dragon and voxel wizard remain in the game — these Meshy models are for the asset viewer first. Later tasks decide whether to swap them into gameplay.

---

## Constraints

- **JavaScript only** — all scripts in `scripts/meshy/`, run with `node`
- **Check existing models before generating** — list tasks first, reuse if available
- **Credits cost money** — use meshy-4 preview first; only upgrade if result is unusable
- **Full pipeline** — preview → refine → rig → animate (idle + walk) → download
- **Size check** — note file sizes; anything > 15 MB needs a comment

---

## Options Considered

### Option A — Preview only, no rigging
Fast, cheap. Just get a static GLB for the viewer.
**Cons:** No animations; not useful for gameplay integration later.

### Option B — Full pipeline: preview → refine → rig → animate (CHOSEN)
Preview establishes the shape. Refine adds textures. Rig creates the skeleton. Animate applies idle + walk actions. Downloads all GLBs.
**Pros:** Immediately useful in gameplay later; demonstrates full pipeline working.
**Cons:** More credits; 3-5 API polling rounds per model.

### Option C — Image-to-3D using fal-ai-image concept art first
Generate concept art via fal-ai-image skill, then feed image to Meshy image-to-3D.
**Pros:** More visual control over the result.
**Cons:** Two API systems; more complexity for first run.

**Chosen: Option B** for wizard and dragon. Option C deferred — can revisit if meshy-4 results are poor.

---

## Success Criteria

1. `scripts/meshy/meshy_list.js` runs and shows existing tasks — checked before any generation
2. `scripts/meshy/meshy_generate.js wizard` produces `public/models/wizard_preview.glb` and `public/models/wizard_refined.glb`
3. `scripts/meshy/meshy_generate.js dragon` produces `public/models/dragon_preview.glb` and `public/models/dragon_refined.glb`
4. `scripts/meshy/meshy_rig_animate.js` produces `public/models/wizard_rigged.glb`, `public/models/wizard_idle.glb`, `public/models/wizard_walk.glb` (same for dragon)
5. `/assets` viewer has entries: "Meshy Wizard (Rigged)", "Meshy Dragon (Rigged)" — loads with animations playing
6. No Three.js console errors when loading models
7. Model sizes noted in task log; anything > 15 MB has a comment
8. All 28 Playwright tests still pass

---

## Testing Strategy

| Criterion | How to verify |
|-----------|---------------|
| 1 | Run `meshy_list.js`, verify output is JSON with task list |
| 2-4 | Check that GLB files exist at `public/models/*.glb` after scripts run |
| 5-6 | Open `/assets` in browser, select each Meshy model, verify it loads with no errors |
| 7 | `ls -lh public/models/` — note sizes |
| 8 | `npm test` — 28/28 |

---

## Plan

### Phase 1: Scripts

1. Read `.claude/skills/meshy-3d/SKILL.md` for full API reference
2. Read `~/.zshrc` to confirm env var name (expected: `MESHY_API_KEY`)
3. Write `scripts/meshy/meshy_list.js`:
   - Accepts arg: `text-to-3d` | `image-to-3d` | `rigging` | `animations`
   - Lists all tasks with id, status, prompt, created_at
   - Prints as formatted JSON
4. Write `scripts/meshy/meshy_generate.js <model_name>`:
   - Reads prompts from a config object at top of file (wizard / dragon prompts)
   - Step 1: List existing tasks — if SUCCEEDED task with matching prompt exists, skip generation, log the existing task ID
   - Step 2: POST preview (meshy-4, should_remesh: true)
   - Step 3: Poll until SUCCEEDED, download `preview.glb`
   - Step 4: POST refine (texture prompt more specific than preview)
   - Step 5: Poll until SUCCEEDED, download `refined.glb`
   - Saves task IDs to `scripts/meshy/task_ids.json` for next step
5. Write `scripts/meshy/meshy_rig_animate.js <model_name>`:
   - Reads refine task ID from `task_ids.json`
   - POST rig (rigging_height_meters: 1.7 for wizard, 2.0 for dragon)
   - Poll until SUCCEEDED, download `rigged.glb`
   - POST animate idle (action_id: 1001), poll, download `idle.glb`
   - POST animate walk (action_id: 1002), poll, download `walk.glb`

### Phase 2: Asset Viewer

6. Add `GLTFLoader` to `assets/index.html`:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
   ```
7. Write `loadMeshyModel(path, scene, mixer)` helper using skill's pattern
8. Add asset entries for "Meshy Wizard (Rigged)" and "Meshy Dragon (Rigged)"
9. Wire `AnimationMixer.update(delta)` into the existing animation loop

### Phase 3: Verify & Ship

10. Run scripts: `node scripts/meshy/meshy_list.js text-to-3d` (check existing first)
11. `node scripts/meshy/meshy_generate.js wizard` — wait for completion
12. `node scripts/meshy/meshy_generate.js dragon` — wait for completion
13. `node scripts/meshy/meshy_rig_animate.js wizard` — wait for completion
14. `node scripts/meshy/meshy_rig_animate.js dragon` — wait for completion
15. Open `/assets` in browser, verify both models load with animations
16. Check file sizes (`ls -lh public/models/`)
17. `npm test` — 28/28
18. Commit: `git add scripts/meshy/ public/models/ assets/index.html && git commit -m "feat: Meshy.ai wizard + dragon — full pipeline preview/refine/rig/animate"`

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
