#!/usr/bin/env node
// List Meshy.ai tasks by endpoint type
// Usage: node scripts/meshy/meshy_list.js <text-to-3d|image-to-3d|rigging|animations>

const API_KEY = process.env.MESHY_AI_API_KEY;
if (!API_KEY) { console.error('Error: MESHY_AI_API_KEY not set'); process.exit(1); }

const ENDPOINTS = {
  'text-to-3d': 'https://api.meshy.ai/openapi/v2/text-to-3d',
  'image-to-3d': 'https://api.meshy.ai/openapi/v1/image-to-3d',
  'rigging': 'https://api.meshy.ai/openapi/v1/rigging',
  'animations': 'https://api.meshy.ai/openapi/v1/animations',
};

const type = process.argv[2];
if (!type || !ENDPOINTS[type]) {
  console.error(`Usage: node meshy_list.js <${Object.keys(ENDPOINTS).join('|')}>`);
  process.exit(1);
}

async function main() {
  const url = ENDPOINTS[type];
  console.log(`Fetching ${type} tasks from ${url} ...`);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  if (!res.ok) {
    console.error(`HTTP ${res.status}: ${await res.text()}`);
    process.exit(1);
  }

  const body = await res.json();
  const tasks = Array.isArray(body) ? body : body.result || body.results || [body];

  if (tasks.length === 0) {
    console.log('No tasks found.');
    return;
  }

  console.log(`\nFound ${tasks.length} task(s):\n`);
  for (const t of tasks) {
    console.log(`  ID:      ${t.id}`);
    console.log(`  Status:  ${t.status}`);
    console.log(`  Created: ${t.created_at || t.created || 'N/A'}`);
    if (t.prompt) console.log(`  Prompt:  ${t.prompt.substring(0, 80)}${t.prompt.length > 80 ? '...' : ''}`);
    if (t.model_urls) console.log(`  Models:  ${JSON.stringify(Object.keys(t.model_urls))}`);
    console.log('');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
