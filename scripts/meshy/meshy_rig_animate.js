#!/usr/bin/env node
// Rig and animate a Meshy.ai model: rig → idle animation → walk animation
// Usage: node scripts/meshy/meshy_rig_animate.js <wizard|dragon>

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TASK_IDS_PATH = join(__dirname, 'task_ids.json');
const MODELS_DIR = join(__dirname, '..', '..', 'public', 'models');

const API_KEY = process.env.MESHY_AI_API_KEY;
if (!API_KEY) { console.error('Error: MESHY_AI_API_KEY not set'); process.exit(1); }

const RIG_BASE = 'https://api.meshy.ai/openapi/v1/rigging';
const ANIM_BASE = 'https://api.meshy.ai/openapi/v1/animations';

const CONFIGS = {
  wizard: { height: 1.7 },
  dragon: { height: 2.0 },
};

const name = process.argv[2];
if (!name || !CONFIGS[name]) {
  console.error('Usage: node meshy_rig_animate.js <wizard|dragon>');
  process.exit(1);
}

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

async function poll(baseUrl, taskId, label) {
  console.log(`  Polling ${label} (${taskId})...`);
  while (true) {
    const task = await api('GET', `${baseUrl}/${taskId}`);
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

  const refineId = taskIds[name]?.refine;
  if (!refineId) {
    console.error(`No refine task ID found for "${name}". Run meshy_generate.js first.`);
    process.exit(1);
  }

  // === RIGGING ===
  if (!taskIds[name].rig) {
    console.log(`\n=== Rigging "${name}" (refine: ${refineId}) ===`);
    const rigRes = await api('POST', RIG_BASE, {
      input_task_id: refineId,
      height_meters: CONFIGS[name].height,
    });
    const rigId = rigRes.result || rigRes.id;
    taskIds[name].rig = rigId;
    saveTaskIds(taskIds);
    console.log(`  Rig task ID: ${rigId}`);
  }

  const rigTask = await poll(RIG_BASE, taskIds[name].rig, 'Rigging');
  const rigGlb = rigTask.result?.rigged_character_glb_url;
  if (rigGlb) {
    await downloadGlb(rigGlb, join(MODELS_DIR, `${name}_rigged.glb`));
  }
  // Rigging also provides basic walk animation for free
  const walkFromRig = rigTask.result?.basic_animations?.walking_glb_url;
  if (walkFromRig) {
    await downloadGlb(walkFromRig, join(MODELS_DIR, `${name}_walk.glb`));
  }

  // === IDLE ANIMATION (action_id: 0 = Idle) ===
  if (!taskIds[name].anim_idle) {
    console.log(`\n=== Animating idle for "${name}" ===`);
    const idleRes = await api('POST', ANIM_BASE, {
      rig_task_id: taskIds[name].rig,
      action_id: 0,
    });
    taskIds[name].anim_idle = idleRes.result;
    saveTaskIds(taskIds);
    console.log(`  Idle animation task ID: ${idleRes.result}`);
  }

  const idleTask = await poll(ANIM_BASE, taskIds[name].anim_idle, 'Idle animation');
  const idleGlb = idleTask.result?.animation_glb_url;
  if (idleGlb) {
    await downloadGlb(idleGlb, join(MODELS_DIR, `${name}_idle.glb`));
  }

  // === WALK ANIMATION (action_id: 1 = Walking_Woman) ===
  if (!taskIds[name].anim_walk) {
    console.log(`\n=== Animating walk for "${name}" ===`);
    const walkRes = await api('POST', ANIM_BASE, {
      rig_task_id: taskIds[name].rig,
      action_id: 1,
    });
    taskIds[name].anim_walk = walkRes.result;
    saveTaskIds(taskIds);
    console.log(`  Walk animation task ID: ${walkRes.result}`);
  }

  const walkTask = await poll(ANIM_BASE, taskIds[name].anim_walk, 'Walk animation');
  const walkGlb = walkTask.result?.animation_glb_url;
  if (walkGlb) {
    await downloadGlb(walkGlb, join(MODELS_DIR, `${name}_walk.glb`));
  }

  console.log(`\n=== ${name} rig + animate complete ===`);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
