#!/usr/bin/env node
// Generate 3D model via Meshy.ai text-to-3d pipeline: preview → refine → download
// Usage: node scripts/meshy/meshy_generate.js <wizard|dragon>

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TASK_IDS_PATH = join(__dirname, 'task_ids.json');
const MODELS_DIR = join(__dirname, '..', '..', 'public', 'models');

const API_KEY = process.env.MESHY_AI_API_KEY;
if (!API_KEY) { console.error('Error: MESHY_AI_API_KEY not set'); process.exit(1); }

const BASE = 'https://api.meshy.ai/openapi/v2/text-to-3d';

const PROMPTS = {
  wizard: {
    prompt: 'A cute chibi fantasy wizard, purple robe with gold trim, tall pointed hat with star, large expressive eyes, game character, clean geometry, front-facing pose',
    texture: 'royal purple velvet robe with gold star embroidery, pale skin, bright blue eyes, soft cel-shaded style',
  },
  dragon: {
    prompt: 'A fearsome fantasy dragon, deep blue-black scales with cyan accent markings, large bat wings spread wide, glowing teal eyes, serpentine neck, game character',
    texture: 'iridescent blue-black dragon scales with glowing cyan veins, dark underbelly, metallic claw tips',
  },
};

const name = process.argv[2];
if (!name || !PROMPTS[name]) {
  console.error('Usage: node meshy_generate.js <wizard|dragon>');
  process.exit(1);
}

const config = PROMPTS[name];

function loadTaskIds() {
  if (existsSync(TASK_IDS_PATH)) return JSON.parse(readFileSync(TASK_IDS_PATH, 'utf8'));
  return {};
}

function saveTaskIds(data) {
  writeFileSync(TASK_IDS_PATH, JSON.stringify(data, null, 2));
  console.log(`  Saved task IDs to ${TASK_IDS_PATH}`);
}

async function api(method, url, body) {
  const opts = {
    method,
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function poll(taskId, label) {
  console.log(`  Polling ${label} (${taskId})...`);
  while (true) {
    const task = await api('GET', `${BASE}/${taskId}`);
    const pct = task.progress || 0;
    console.log(`    ${label}: ${task.status} (${pct}%)`);
    if (task.status === 'SUCCEEDED') return task;
    if (task.status === 'FAILED') throw new Error(`${label} FAILED: ${task.task_error?.message || 'unknown error'}`);
    await new Promise(r => setTimeout(r, 5000));
  }
}

async function downloadGlb(url, destPath) {
  console.log(`  Downloading GLB to ${destPath}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(dirname(destPath), { recursive: true });
  writeFileSync(destPath, buf);
  console.log(`  Downloaded ${(buf.length / 1024 / 1024).toFixed(1)} MB`);
}

async function main() {
  const taskIds = loadTaskIds();
  if (!taskIds[name]) taskIds[name] = {};

  // Step 1: Check for existing succeeded task with matching prompt
  console.log(`\n=== Checking existing text-to-3d tasks for "${name}" ===`);
  const listRes = await fetch(BASE, { headers: { Authorization: `Bearer ${API_KEY}` } });
  if (listRes.ok) {
    const body = await listRes.json();
    const tasks = Array.isArray(body) ? body : body.result || body.results || [];
    const match = tasks.find(t => t.prompt === config.prompt && t.status === 'SUCCEEDED');
    if (match) {
      console.log(`  Found existing SUCCEEDED task: ${match.id}`);
      taskIds[name].preview = match.id;

      // Check if it has a refine child
      const refineMatch = tasks.find(t => t.preceding_task_id === match.id && t.status === 'SUCCEEDED' && t.mode === 'refine');
      if (refineMatch) {
        console.log(`  Found existing SUCCEEDED refine task: ${refineMatch.id}`);
        taskIds[name].refine = refineMatch.id;
        saveTaskIds(taskIds);

        // Download refined GLB
        const glbUrl = refineMatch.model_urls?.glb;
        if (glbUrl) {
          const dest = join(MODELS_DIR, `${name}_refined.glb`);
          await downloadGlb(glbUrl, dest);
        }
        console.log(`\n=== ${name} generation complete (from existing tasks) ===`);
        return;
      }

      // Need to refine from existing preview
      saveTaskIds(taskIds);
      // Fall through to refine step
    }
  }

  // Step 2: Create preview if we don't have one
  if (!taskIds[name].preview) {
    console.log(`\n=== Step 2: Creating preview for "${name}" ===`);
    const previewRes = await api('POST', BASE, {
      mode: 'preview',
      model_version: 'meshy-4',
      prompt: config.prompt,
      should_remesh: true,
    });
    taskIds[name].preview = previewRes.result;
    saveTaskIds(taskIds);
    console.log(`  Preview task ID: ${previewRes.result}`);

    // Step 3: Poll preview
    const previewTask = await poll(previewRes.result, 'Preview');
    console.log(`  Preview complete!`);
  }

  // Step 4: Create refine task
  if (!taskIds[name].refine) {
    console.log(`\n=== Step 4: Creating refine for "${name}" ===`);
    const refineRes = await api('POST', BASE, {
      mode: 'refine',
      preview_task_id: taskIds[name].preview,
      texture_prompt: config.texture,
    });
    taskIds[name].refine = refineRes.result;
    saveTaskIds(taskIds);
    console.log(`  Refine task ID: ${refineRes.result}`);
  }

  // Step 5: Poll refine and download
  const refineTask = await poll(taskIds[name].refine, 'Refine');
  const glbUrl = refineTask.model_urls?.glb;
  if (!glbUrl) throw new Error('No GLB URL in refine result');

  const dest = join(MODELS_DIR, `${name}_refined.glb`);
  await downloadGlb(glbUrl, dest);

  console.log(`\n=== ${name} generation complete ===`);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
