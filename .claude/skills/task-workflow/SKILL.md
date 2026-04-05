# Skill: Task Workflow

Use this checklist for every non-trivial piece of work. Four steps, always in order. Never skip or merge steps.

---

## Step 1 — Plan _(requires user approval before any code is written)_

- [ ] Create `tasks/active/NNN-short-title.md` from `tasks/TEMPLATE.md`
- [ ] Document 2–3 options with pros/cons
- [ ] Pick the best option and explain why, clearly
- [ ] Write numbered, measurable **success criteria** (not "looks better" — testable outcomes)
- [ ] Write a **testing strategy** table mapping each criterion to a verification method
- [ ] Write a step-by-step **plan**
- [ ] Send user: _"Plan ready for [task name] — please review `tasks/active/NNN-short-title.md` and reply 'approved' to proceed."_
- [ ] **STOP. Wait for explicit user approval. Do not write any code yet.**

---

## Step 2 — Execute _(only after user approves Step 1)_

- [ ] Update task status to `executing`
- [ ] Implement the chosen approach
- [ ] Log significant decisions and deviations in the **Execution Log** section
- [ ] Keep changes focused — resist scope creep
- [ ] When implementation is complete, send user: _"Execution complete — moving to Step 3 (code review + testing)."_

---

## Step 3 — Review & Test _(complete before any deploy)_

- [ ] Update task status to `reviewing`
- [ ] **Code review checklist:**
  - No dead code or commented-out blocks
  - No `console.log` in production paths
  - No merge conflict markers (`grep -c "<<<<<<" index.html` returns 0)
  - `node --check index.html` passes (syntax check)
  - Style consistent with surrounding code
  - Non-obvious logic has WHY comments
  - No regressions introduced
- [ ] Run full Playwright suite: `npm test` — **ALL tests must pass**
- [ ] Take a screenshot of the running game to confirm visual state
- [ ] For each success criterion: mark **✅ PASS** or **❌ FAIL** in the task file
- [ ] If any criterion fails: fix, re-test, update task file
- [ ] Only proceed when **every** criterion is ✅ PASS
- [ ] Send user: _"Step 3 complete — all [N] success criteria pass. [Brief summary of any issues found and fixed]."_

---

## Step 4 — Deploy _(only after user sees Step 3 summary)_

- [ ] Update task status to `deployed`
- [ ] Deploy to Hetzner:
  ```bash
  ssh -i ~/.ssh/mmd_deploy root@5.161.208.234 "cd /root/MultiMagicDungeonWeb && git pull origin main && pm2 restart all"
  ```
- [ ] `curl -s -o /dev/null -w "%{http_code}" http://5.161.208.234:3000/` must return 200
- [ ] Take screenshots of the live deploy
- [ ] Fill in **Step 4** section of the task file: deploy commit, issues, screenshots
- [ ] Move task file from `tasks/active/` to `tasks/done/`
- [ ] Send user: _"Deployed. [What's new / what issues came up / anything to watch]. Live at http://5.161.208.234:3000 — please review and let me know."_

---

## Quick reference

| Step | Gate to enter | Gate to exit |
|------|---------------|--------------|
| 1 Plan | (new task) | User says "approved" |
| 2 Execute | User approval received | Implementation complete |
| 3 Review | Implementation done | All criteria ✅ PASS |
| 4 Deploy | Step 3 summary sent | User reviews live deploy |
