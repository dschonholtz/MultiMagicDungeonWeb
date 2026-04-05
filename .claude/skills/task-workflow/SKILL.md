# Skill: Task Workflow

Agent checklist for the 4-step task lifecycle. Follow these steps in order. Never skip or merge steps without explicit user approval.

---

## Step 1 — Plan (STOP after this step)

1. Copy `tasks/TEMPLATE.md` → `tasks/active/TASK-NNN-slug.md`
2. Fill in **Options Considered** (2–3 realistic options with trade-offs)
3. Pick one; fill in **Chosen Approach** with rationale
4. Write **Success Criteria** (observable, testable, unambiguous)
5. Write **Testing Strategy** (which Playwright specs, any manual steps)
6. Write **Plan** (ordered checklist of implementation steps)
7. Message the user: present the task file summary and ask for approval
8. **STOP. Do not write any implementation code until the user approves.**

---

## Step 2 — Execute

1. Implement each step from the Plan in order
2. After each meaningful decision or surprise, append a timestamped entry to **Execution Log**
3. Run quick checks after every edit:
   - `node --check index.html` — must pass
   - `grep -c "<<<<<<" index.html` — must return 0
4. When all plan steps are done, message the user: "Implementation complete — moving to Step 3 (Review)."

---

## Step 3 — Review

1. Run `node --check index.html` — record result
2. Run `grep -c "<<<<<<" index.html` — record result
3. Run `npm test` (full Playwright suite) — record pass/fail counts
4. Take a screenshot via preview tools
5. Mark each success criterion PASS or FAIL in the task file
6. Message the user with a summary table of criteria results and any failures

---

## Step 4 — Deploy

1. Run the `/hetzner-deploy` skill to push to production
2. Smoke-check the live URL
3. Take a screenshot of the live site
4. Fill in **Deploy & Screenshots** in the task file
5. Move task file from `tasks/active/` → `tasks/done/`
6. Update `docs/PROGRESS.md` to reflect completion
7. Message the user: share the live URL, screenshot, and any issues found
