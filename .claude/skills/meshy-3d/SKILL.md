---
name: meshy-3d
description: "Use Meshy.ai for the full text-to-3D pipeline: list existing models, generate previews, refine with textures, auto-rig, animate, and download GLB files. Always check existing models before generating new ones."
metadata:
  short-description: "Meshy.ai text-to-3D, image-to-3D, rigging, and animation pipeline."
---

# Meshy 3D Skill

Use this skill any time you need to generate, rig, animate, or retrieve 3D models via the Meshy.ai API. All scripts are JavaScript (`node`), using only `fetch` (Node 18+, built-in).

---

## Key Rule: Check Existing Models First

**Never generate a new model without first listing existing ones.**
Meshy credits are real money. A previously generated model may already exist.

```bash
node scripts/meshy_list.js text-to-3d    # list all text-to-3d tasks
node scripts/meshy_list.js image-to-3d  # list all image-to-3d tasks
```

If a model matching your prompt already exists and is SUCCEEDED, reuse it. Record its task ID. Skip generation.

---

## API Overview

**Base URL:** `https://api.meshy.ai`  
**Auth:** `Authorization: Bearer $MESHY_API_KEY` (set in `~/.zshrc`)  
**All operations are async:** POST returns a task ID; poll GET until `status === 'SUCCEEDED'` or `'FAILED'`

---

## Full Pipeline

```
1. List existing models (check before generating anything)
         ↓
2. Text-to-3D Preview (fast, low-poly) — 5-20 credits
         ↓
3. Poll until SUCCEEDED
         ↓
4. Text-to-3D Refine (adds textures) — 10 credits
         ↓
5. Poll until SUCCEEDED
         ↓
6. Auto-Rig (creates skeleton for humanoid/quadruped) — variable credits
         ↓
7. Poll until SUCCEEDED
         ↓
8. Animate (apply actions from 500+ animation library) — variable credits
         ↓
9. Poll until SUCCEEDED
         ↓
10. Download GLB → public/models/{name}.glb
         ↓
11. Verify: load in assets viewer, check Three.js console, no errors
```

For non-character models (props, environment pieces), stop after step 5 (no rigging needed).

---

## Step-by-Step API Reference

### 1. List Existing Models

```js
// GET https://api.meshy.ai/openapi/v2/text-to-3d?page=1&page_size=50
const res = await fetch('https://api.meshy.ai/openapi/v2/text-to-3d?page=1&page_size=50', {
  headers: { Authorization: `Bearer ${process.env.MESHY_API_KEY}` }
});
const { data } = await res.json();
// data[].id, data[].status, data[].prompt, data[].model_urls.glb
```

Same pattern for `/openapi/v2/image-to-3d`.

### 2. Text-to-3D Preview

```js
const res = await fetch('https://api.meshy.ai/openapi/v2/text-to-3d', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.MESHY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    mode: 'preview',
    prompt: 'YOUR PROMPT HERE',
    negative_prompt: 'low quality, low resolution, ugly',
    ai_model: 'meshy-4',   // meshy-4: 5 credits. meshy-6: 20 credits — prefer meshy-4 first
    should_remesh: true,
    art_style: 'realistic'
  })
});
const { result: taskId } = await res.json();
```

### 3. Poll Until Done

```js
async function pollTask(endpoint, taskId, intervalMs = 5000) {
  while (true) {
    const res = await fetch(`https://api.meshy.ai${endpoint}/${taskId}`, {
      headers: { Authorization: `Bearer ${process.env.MESHY_API_KEY}` }
    });
    const task = await res.json();
    console.log(`[${taskId}] ${task.status} ${task.progress ?? ''}%`);
    if (task.status === 'SUCCEEDED') return task;
    if (task.status === 'FAILED') throw new Error(`Task failed: ${JSON.stringify(task)}`);
    await new Promise(r => setTimeout(r, intervalMs));
  }
}
```

### 4. Text-to-3D Refine (Textures)

```js
const res = await fetch('https://api.meshy.ai/openapi/v2/text-to-3d', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.MESHY_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'refine',
    preview_task_id: previewTaskId,
    should_texture: true,
    texture_prompt: 'YOUR TEXTURE DESCRIPTION'  // more specific than the preview prompt
  })
});
const { result: refineTaskId } = await res.json();
```

### 5. Auto-Rig

Only for humanoid/quadruped characters. Fails on abstract shapes.

```js
const res = await fetch('https://api.meshy.ai/openapi/v1/rigging', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.MESHY_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input_task_id: refineTaskId,
    rigging_height_meters: 1.7    // adjust for creature scale
  })
});
const { result: riggingTaskId } = await res.json();
// Poll: GET /openapi/v1/rigging/{riggingTaskId}
// Success: task.rigged_character_glb_url
```

### 6. Animate

Apply from 500+ animation actions. Key IDs for game characters:
- `1001` — idle
- `1002` — walk  
- `1003` — run
- `1010` — attack
- `1015` — death/dying
- `1020` — cast spell
See full list at https://docs.meshy.ai/en/api/animation-library

```js
const res = await fetch('https://api.meshy.ai/openapi/v1/animations', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.MESHY_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rigging_task_id: riggingTaskId,
    action_id: 1001,  // one animation per request
    loop: true
  })
});
const { result: animTaskId } = await res.json();
// Poll: GET /openapi/v1/animations/{animTaskId}
// Success: task.animation_glb_url
```

Run multiple animation tasks in sequence to build a library: idle, walk, attack, death.

### 7. Download GLB

```js
const https = require('https');
const fs = require('fs');

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
  const sizeMB = (buffer.byteLength / 1024 / 1024).toFixed(1);
  console.log(`Downloaded ${destPath} (${sizeMB} MB)`);
  return sizeMB;
}
```

**Size check:** If GLB > 15 MB, consider using the Remesh API to reduce polygon count before committing.

### 8. Image-to-3D (Alternative Entry Point)

Use when you have concept art or a reference image (e.g., from fal-ai-image skill).

```js
const res = await fetch('https://api.meshy.ai/openapi/v2/image-to-3d', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.MESHY_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image_url: 'https://...',     // publicly accessible URL
    should_texture: true,
    should_remesh: true,
    ai_model: 'meshy-4',
    enable_rigging: true          // can rig in same request for humanoids
  })
});
```

---

## Scripts

All scripts in `scripts/meshy/`:

- `meshy_list.js <type>` — list existing tasks by type (`text-to-3d`, `image-to-3d`, `rigging`, `animations`)
- `meshy_generate.js <prompt> <name>` — full pipeline: preview → refine → download preview GLB
- `meshy_rig_animate.js <refine_task_id> <name>` — rig + animate (idle, walk, attack) → download all GLBs
- `meshy_download.js <url> <dest>` — download a single model URL

Run with: `MESHY_API_KEY=$(grep MESHY_API_KEY ~/.zshrc | cut -d'=' -f2) node scripts/meshy/meshy_list.js text-to-3d`

---

## Three.js r128 Integration

After downloading, add to `assets/index.html` using the GLTFLoader:

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
```

```js
function loadMeshyModel(path, scene, onLoaded) {
  const loader = new THREE.GLTFLoader();
  loader.load(
    path,
    (gltf) => {
      const model = gltf.scene;
      model.scale.setScalar(1);  // adjust if model is too large/small
      scene.add(model);

      // Play animation if present
      if (gltf.animations.length) {
        const mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
        // Add mixer.update(delta) to your animation loop
      }

      if (onLoaded) onLoaded(model, gltf);
    },
    (xhr) => console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`),
    (err) => console.error('GLTFLoader error:', err)
  );
}
```

---

## Verification Checklist

After loading a Meshy model in the assets viewer:

- [ ] Model visible (not 0,0,0 and inside a wall — check scale)
- [ ] No `THREE.GLTFLoader` errors in console
- [ ] Animations play if rigged (check `gltf.animations.length > 0`)
- [ ] Frame rate stays above 30fps (InstancedMesh still preferred for many copies)
- [ ] GLB size < 15 MB committed (note in task if larger)
- [ ] Model textures render correctly (not pink/missing material)

---

## Credit Cost Reference

| Step | Cost | Notes |
|------|------|-------|
| Text-to-3D preview (meshy-4) | 5 credits | Use this first |
| Text-to-3D preview (meshy-6) | 20 credits | Higher quality |
| Text-to-3D refine + texture | 10 credits | Required for good look |
| Image-to-3D | 5–15 credits | Depends on options |
| Auto-rig | Variable | ~5-10 credits |
| Animation (per action) | Variable | ~2-5 credits each |

**Start with meshy-4 preview.** Only upgrade to meshy-6 if the preview result is unusable.

---

## Anti-Patterns

❌ **Generating without checking existing models first**
Why bad: wastes credits on duplicates.  
Better: always run `meshy_list.js` before any POST.

❌ **Skipping preview, going straight to refine**
Why bad: can't refine unless preview succeeds first. Preview is required.  
Better: preview → poll → refine.

❌ **Using meshy-6 for first attempts**
Why bad: 20 credits vs 5 for meshy-4. Preview quality is often sufficient.  
Better: meshy-4 for first pass, meshy-6 only if result is genuinely bad.

❌ **Rigging non-humanoid/non-quadruped models**
Why bad: auto-rig will fail or produce garbage on props, structures, or abstract shapes.  
Better: only rig character models. Props stop at step 5.

❌ **Committing GLBs > 15 MB without noting it**
Why bad: bloats the repo for everyone.  
Better: check size, use Remesh API if needed, or use Git LFS and note it.

❌ **Hardcoding the Meshy API key in scripts**
Why bad: key ends up in git history.  
Better: always read from `$MESHY_API_KEY` env var sourced from `~/.zshrc`.

---

## References

- API docs: https://docs.meshy.ai/en/api/
- Animation library IDs: https://docs.meshy.ai/en/api/animation-library
- Pricing: https://docs.meshy.ai/en/api/pricing
- fal-ai-image skill: `.claude/skills/fal-ai-image/SKILL.md` (use to generate concept images before image-to-3D)
