# Task 017: Mesh2Motion Animation Pipeline (Wizard + Dragon)

**Status:** planning
**Created:** 2026-04-05

**Read first:** `.claude/skills/meshy-3d/SKILL.md`, `.claude/skills/mesh2motion/SKILL.md` (created by this task), `.claude/skills/threejs-builder/SKILL.md`

Integrate [Mesh2Motion](https://app.mesh2motion.org) into the asset pipeline to rig and animate the existing Meshy-generated GLB models. The wizard gets idle + walk animations; the dragon gets idle (wing flap) + attack animations. Both are then wired into the `/assets` viewer using `THREE.AnimationMixer`. The Mesh2Motion rigging/export step is a **manual browser task** — this task documents it precisely and automates everything that can be automated (viewer code, skill docs).

---

## Background

Meshy.ai (task 015) produces high-quality textured GLBs but its built-in animation results can be inconsistent. Mesh2Motion is a free, open-source browser tool (effectively a free Mixamo) that accepts any GLB, lets you pick a skeleton type (human biped, dragon, etc.), choose from 150+ CC0 animation clips, and exports a single GLB containing all selected `AnimationClip`s baked in. That exported GLB loads directly with `THREE.GLTFLoader` + `THREE.AnimationMixer` — no extra tooling required.

Pipeline:
```
Meshy (API) → export GLB → Mesh2Motion (browser, manual) → rig + pick animations → export GLB → public/models/ → Three.js viewer
```

---

## Constraints

- **Three.js r128 only** — use `THREE.GLTFLoader` from the r128 CDN; do not introduce a build step
- **No Mixamo dependency** — Mesh2Motion is the chosen tool; it is free and CC0-licensed
- **Manual browser steps are clearly marked** — every step requiring the developer to open a browser is labeled `[MANUAL]`
- **Automated steps are code only** — viewer wiring, skill docs, and asset registration are automated
- **Existing voxel models are untouched** — these animations are additive; the voxel wizard/dragon remain in the game
- **Exported GLBs go in `public/models/`** — follow the naming convention: `wizard_idle_walk.glb`, `dragon_idle_attack.glb`
- **AnimationMixer plays idle by default on load** — walk/attack can be triggered later; this task only wires idle

---

## Options Considered

### Option A — Use Meshy's built-in animation endpoint
Meshy has a `/v2/text-to-3d/{id}/animate` endpoint used in task 015.
**Cons:** Requires credits; animation quality is often stiff; no control over clip selection; limited skeleton types.

### Option B — Mixamo
Upload FBX/GLB to Mixamo, download with skeleton, re-export as GLB.
**Cons:** Requires an Adobe account; FBX conversion step adds friction; not CC0.

### Option C — Mesh2Motion (CHOSEN)
Free browser tool, no account required. Supports human (biped) and dragon skeleton types. 150+ CC0 clips. Exports a single GLB with `AnimationClip`s ready for `THREE.AnimationMixer`. Directly replaces Mixamo with zero cost.
**Pros:** Free, open-source, CC0 animations, dragon skeleton support, direct GLB export, works with existing `GLTFLoader`.
**Cons:** Browser-only — the rig/export step cannot be scripted; must be done manually.

**Chosen: Option C.** The manual step is small (5–10 min per model) and well-documented. Everything downstream is automated.

---

## Success Criteria

1. `public/models/wizard_idle_walk.glb` exists and contains at least two `AnimationClip`s (idle, walk)
2. `public/models/dragon_idle_attack.glb` exists and contains at least two `AnimationClip`s (idle/wing-flap, attack)
3. `assets/index.html` loads both GLBs via `THREE.GLTFLoader`, creates an `AnimationMixer` for each, and plays the idle clip by default on load
4. No Three.js console errors when loading either animated GLB in the `/assets` viewer
5. `.claude/skills/meshy-3d/SKILL.md` has a new **"Step 5: Rigging & Animation with Mesh2Motion"** section documenting the full handoff
6. `.claude/skills/mesh2motion/SKILL.md` exists with full workflow documentation (skeleton types, animation picker, export settings, Three.js integration pattern)
7. All existing Playwright tests still pass (`npm test` → same count as before this task)

---

## Testing Strategy

| Criterion | How to verify |
|-----------|---------------|
| 1–2 | `ls -lh public/models/wizard_idle_walk.glb public/models/dragon_idle_attack.glb` — files exist; open each in [gltf-viewer.donmccurdy.com](https://gltf-viewer.donmccurdy.com) to confirm clips |
| 3 | Open `/assets` in browser, select "Meshy Wizard (Animated)" and "Meshy Dragon (Animated)" — both should animate on load |
| 4 | Check browser console for Three.js errors after loading each model |
| 5 | Read `.claude/skills/meshy-3d/SKILL.md` — confirm Step 5 section present and accurate |
| 6 | Read `.claude/skills/mesh2motion/SKILL.md` — confirm it covers skeleton selection, animation picker, export, and Three.js loading pattern |
| 7 | `npm test` — same pass count as before |

---

## Plan

### Phase 1: Manual Browser Work — Wizard [MANUAL]

> ⚠️ **These steps must be performed by the developer in a browser. They cannot be scripted.**

1. **[MANUAL]** Open `https://app.mesh2motion.org` in your browser
2. **[MANUAL]** Click **"Upload GLB"** and select `public/models/wizard_idle.glb` (or `wizard_refined.glb` from task 015)
3. **[MANUAL]** In the skeleton picker, choose **"Human (Biped)"** — use **"Head-Body Separation"** variant if the wizard has a large hat/head
4. **[MANUAL]** Click **"Auto-Rig"** and wait for the skeleton to bind (typically 5–15 seconds)
5. **[MANUAL]** Inspect the rig in the preview — confirm the spine, arms, and legs are correctly bound; adjust bone weights if the tool offers manual correction
6. **[MANUAL]** Open the **Animation Library** panel and select:
   - An **Idle** clip (search "idle" — pick the standing breathe/sway variant)
   - A **Walk** clip (search "walk" — pick the standard forward walk)
7. **[MANUAL]** Click **"Export GLB"** — this produces a single GLB with both `AnimationClip`s baked in
8. **[MANUAL]** Save the file as `public/models/wizard_idle_walk.glb` in the project

### Phase 2: Manual Browser Work — Dragon [MANUAL]

> ⚠️ **These steps must be performed by the developer in a browser. They cannot be scripted.**

9. **[MANUAL]** In Mesh2Motion, click **"Upload GLB"** and select `public/models/dragon_refined.glb`
10. **[MANUAL]** In the skeleton picker, choose **"Dragon"** — this skeleton includes wings, stomach, and mouth bones
11. **[MANUAL]** Click **"Auto-Rig"** and wait; inspect that the wing bones extend correctly into the wing geometry
12. **[MANUAL]** Open the **Animation Library** and select:
    - An **Idle / Wing Flap** clip (search "dragon idle" or "wing flap")
    - An **Attack** clip (search "dragon attack" or "bite")
13. **[MANUAL]** Click **"Export GLB"** and save as `public/models/dragon_idle_attack.glb`

### Phase 3: Asset Viewer Wiring (Automated)

14. Read `assets/index.html` — locate the existing `GLTFLoader` import and the model registry array
15. Confirm `GLTFLoader` is already imported (task 015 added it); if not, add:
    ```html
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
    ```
16. Add a `loadAnimatedGLB(path, scene, camera, clock)` helper function that:
    - Uses `THREE.GLTFLoader` to load the GLB
    - Creates a `THREE.AnimationMixer` bound to `gltf.scene`
    - Calls `mixer.clipAction(gltf.animations[0]).play()` to start the first clip (idle) automatically
    - Returns `{ scene: gltf.scene, mixer }` so the caller can switch clips later
    - Adds the model to the scene with appropriate scale and position
17. Wire `mixer.update(clock.getDelta())` into the existing `animate()` loop — store all active mixers in a `const mixers = []` array and call `mixers.forEach(m => m.update(delta))` each frame
18. Register two new entries in the model/asset list:
    - `"Meshy Wizard (Animated)"` → loads `public/models/wizard_idle_walk.glb`
    - `"Meshy Dragon (Animated)"` → loads `public/models/dragon_idle_attack.glb`
19. Each entry should display the clip names (from `gltf.animations.map(a => a.name)`) in the asset viewer UI as a read-only info panel

### Phase 4: Skill Documentation (Automated)

20. Read `.claude/skills/meshy-3d/SKILL.md` in full
21. Append a **"Step 5: Rigging & Animation with Mesh2Motion"** section that:
    - Explains that Meshy produces the static/textured GLB and Mesh2Motion adds the skeleton + animations
    - Links to `https://app.mesh2motion.org`
    - Summarizes the manual steps (upload → skeleton type → auto-rig → animation picker → export)
    - Notes the output file naming convention (`*_idle_walk.glb`, `*_idle_attack.glb`)
    - References `.claude/skills/mesh2motion/SKILL.md` for the full workflow
22. Create `.claude/skills/mesh2motion/SKILL.md` with the following sections:
    - **What is Mesh2Motion** — free browser tool for rigging and animating GLBs; CC0 animations; no account required
    - **Supported Skeleton Types** — Human (Biped, Chibi, Head-Body separation), Dragon (wings/stomach/mouth), and others
    - **Animation Library** — 150+ CC0 clips; searchable by action (idle, walk, run, attack, jump, wave, etc.)
    - **Upload & Auto-Rig Workflow** — step-by-step (upload GLB → pick skeleton → auto-rig → inspect → pick animations → export)
    - **Export Settings** — always export as GLB; the file includes all selected `AnimationClip`s baked in
    - **Three.js r128 Integration Pattern** — full code snippet showing `GLTFLoader` + `AnimationMixer` + clock loop
    - **Troubleshooting** — common issues: wrong skeleton type, bone weights binding to wrong mesh parts, clips missing from export, scale mismatch on load
    - **Naming Conventions for this project** — `{model}_idle_walk.glb` for humanoids, `{model}_idle_attack.glb` for creatures

### Phase 5: Verify & Ship

23. Confirm both GLB files exist: `ls -lh public/models/wizard_idle_walk.glb public/models/dragon_idle_attack.glb`
24. Open `/assets` in browser — select each animated model, confirm it loads and animates with no console errors
25. Read back both skill files to confirm they are accurate and complete
26. `npm test` — confirm same pass count as before
27. Commit:
    ```
    git add public/models/wizard_idle_walk.glb public/models/dragon_idle_attack.glb \
            assets/index.html \
            .claude/skills/meshy-3d/SKILL.md \
            .claude/skills/mesh2motion/SKILL.md
    git commit -m "feat: Mesh2Motion animation pipeline — wizard idle/walk, dragon idle/attack, AnimationMixer wiring"
    ```

---

## Key Code Pattern

```js
// In assets/index.html — AnimationMixer integration (Three.js r128)
const mixers = [];
const clock = new THREE.Clock();

function loadAnimatedGLB(path, scene) {
  const loader = new THREE.GLTFLoader();
  loader.load(path, (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(model);
      mixers.push(mixer);
      // Play the first clip (idle) automatically
      const idleAction = mixer.clipAction(gltf.animations[0]);
      idleAction.play();
      console.log('Loaded clips:', gltf.animations.map(a => a.name));
    }
  });
}

// In the render/animate loop:
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  mixers.forEach(m => m.update(delta));
  renderer.render(scene, camera);
}
```

---

## Notes on Manual vs Automated Steps

| Step | Type | Who does it |
|------|------|-------------|
| Upload GLB to Mesh2Motion | Manual | Developer, in browser |
| Select skeleton type | Manual | Developer, in browser |
| Auto-rig + inspect | Manual | Developer, in browser |
| Pick animation clips | Manual | Developer, in browser |
| Export GLB | Manual | Developer, in browser |
| Save GLB to `public/models/` | Manual | Developer |
| Wire `GLTFLoader` + `AnimationMixer` in viewer | Automated | Claude |
| Register model entries in asset viewer | Automated | Claude |
| Update `meshy-3d` SKILL.md | Automated | Claude |
| Create `mesh2motion` SKILL.md | Automated | Claude |
| Run tests | Automated | Claude |

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
