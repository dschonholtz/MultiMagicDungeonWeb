# Task 005: OpenAI-Generated Wizard Asset

**Status:** planning
**Created:** 2026-04-05

Use the OpenAI API key (in `~/.zshrc` as `OPENAI_API_KEY`) to produce a professional-looking animated wizard character for the game, replacing or supplementing the current procedural chibi wizard.

---

## What the OpenAI API Can Actually Do Here

**What works (confirmed available via the key):**
- `DALL-E 3` — generate high-resolution reference art / texture maps
- `GPT-4o` — multimodal code generation; can analyze images and write matching Three.js geometry

**What doesn't work via OpenAI API:**
- Direct GLTF export — OpenAI has no text-to-3D endpoint (Point-E/Shap-E are research-only, deprecated)
- Animated rigged models — no API for this

---

## Options Considered

### Option A — DALL-E 3 generates texture sheet → Three.js applies as material
Use DALL-E 3 to generate a wizard character sprite (front-facing, transparent-ish background), load it as a `THREE.TextureLoader` texture on the wizard's body geometry. The procedural chibi mesh shape stays; the surface becomes a rich painted texture rather than flat `MeshToonMaterial`.

**Pros:**
- Actually works with the OpenAI API key today
- Significant visual upgrade — AI-painted texture vs flat purple geometry
- Can regenerate textures easily to try different styles
- ~20 lines of extra Three.js code

**Cons:**
- Flat texture on 3D geometry can look weird at side/back angles
- Still procedural geometry underneath, just better-looking
- No new animation rig — existing idle bob/hat sway/arm swing stays

### Option B — GPT-4o generates more sophisticated procedural geometry
Write a Python script that calls GPT-4o with the current wizard code as context, asks it to produce improved Three.js procedural geometry: better proportions, face detail, clothing folds, proper finger geometry.

**Pros:**
- Still pure Three.js, no texture loading latency
- GPT-4o is very good at code generation with sufficient context

**Cons:**
- No guarantee the output will be better — r128 procedural geometry is limited regardless
- Still no external model file, just improved primitives

### Option C — DALL-E 3 generates 4-angle sprite sheet → billboard sprite character
Generate front/back/left/right views of the wizard as separate DALL-E images, then use a canvas-based `CanvasTexture` that switches face based on camera angle. Classic 2.5D "sprite billboard" technique.

**Pros:**
- Unique aesthetic that sets the game apart visually (Paper Mario / old RPG look)
- Full 360° coverage

**Cons:**
- 4 API calls; consistency across renders is hard to guarantee
- More complex switching logic in Three.js

### Option D — Meshy.ai or Tripo3D (text-to-GLTF APIs)
These services take a text prompt and return a proper rigged `.glb` file with animation tracks.

**Pros:**
- Actual animated 3D model, not a procedural hack
- Can be rigged with walk/idle/attack animations
- Drops directly into existing GLTFLoader + AnimationMixer code

**Cons:**
- Requires a Meshy/Tripo3D API key (not the OpenAI key)
- Free tier is limited

---

## Chosen Approach: Option A (Phase 1) + Option D as stretch goal

**Phase 1 — uses existing OpenAI key (~1 hour):** DALL-E 3 texture on the wizard
- Call DALL-E 3 with a precise art-direction prompt: *"chibi wizard, front view, royal purple robe with gold trim, large pointed hat with gold star, cel-shaded anime style, plain white background, full body, cute proportions"*
- Load the result as a Three.js texture on the wizard's body/robe mesh
- Separately generate a face texture with DALL-E 3

**Phase 2 (optional, requires Meshy API key):** Real GLTF wizard
- If you want to sign up for Meshy (free tier exists), I can automate the API call and drop the returned `.glb` into `public/models/`
- This gives a proper animated wizard with real walk/idle/cast animations

---

## Success Criteria (Phase 1)

1. A Python script at `scripts/generate_wizard_textures.py` calls DALL-E 3 and saves output to `public/textures/wizard_body.png`
2. Script is runnable: `OPENAI_API_KEY=... python scripts/generate_wizard_textures.py`
3. The Three.js wizard model uses the generated texture on at least the robe/body mesh
4. The wizard still animates (existing idle bob / hat sway continue to work)
5. Visual comparison screenshot showing old vs new wizard

---

## Testing Strategy

| Criterion | How to verify |
|-----------|---------------|
| 1-2 | Run the script, check `public/textures/wizard_body.png` exists and looks right |
| 3-4 | Screenshot in-game — wizard visible with texture, animation still plays |
| 5 | Side-by-side screenshot |

---

## Plan

1. Read current wizard construction code in `index.html` (the chibi mesh section)
2. Write `scripts/generate_wizard_textures.py`:
   - `POST https://api.openai.com/v1/images/generations` with `model: "dall-e-3"`, `size: "1024x1024"`, precise wizard prompt
   - Downloads result to `public/textures/wizard_body.png`
3. Update wizard's robe `MeshToonMaterial` to use `map: new THREE.TextureLoader().load('textures/wizard_body.png')`
4. Adjust material: `color: 0xffffff` (let texture provide color), keep `gradientMap` for toon effect
5. Generate and apply a face/head texture separately
6. Run script, verify texture, adjust prompt if needed
7. Screenshot old vs new, commit

---

## Script Template

```python
# scripts/generate_wizard_textures.py
import os, requests, base64, pathlib

api_key = os.environ['OPENAI_API_KEY']

prompt = """
Chibi wizard character, front view, full body,
royal purple robe with gold star embroidery,
tall pointed wizard hat with gold star on tip,
white gloves, cute large eyes, soft cel-shaded anime style,
clean white background, no shadows, no gradients,
character sheet illustration, high quality
"""

resp = requests.post(
    'https://api.openai.com/v1/images/generations',
    headers={'Authorization': f'Bearer {api_key}'},
    json={'model': 'dall-e-3', 'prompt': prompt, 'n': 1,
          'size': '1024x1024', 'response_format': 'b64_json'}
)
img_data = resp.json()['data'][0]['b64_json']
out = pathlib.Path('public/textures/wizard_body.png')
out.parent.mkdir(parents=True, exist_ok=True)
out.write_bytes(base64.b64decode(img_data))
print(f'Saved {out}')
```

---

## Execution Log

*(empty — not yet started)*

---

## Code Review & Test Results

*(empty — not yet started)*

---

## Deploy & Screenshots

*(empty — not yet started)*
