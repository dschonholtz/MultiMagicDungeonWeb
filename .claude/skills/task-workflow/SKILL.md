# Skill: Task Workflow

Use this checklist whenever starting or resuming structured work.

---

## Step 1 — Plan

- [ ] Create `tasks/active/NNN-task-name.md` from `tasks/TEMPLATE.md`
- [ ] Document 2-3 options with pros/cons
- [ ] Pick approach and explain why
- [ ] Write numbered, measurable success criteria
- [ ] Write testing strategy per criterion
- [ ] Tell user: "Plan ready — review `tasks/active/NNN-task-name.md` and approve to proceed"
- [ ] **STOP. Do not proceed until user approves.**

## Step 2 — Execute

- [ ] Implement chosen approach
- [ ] Log significant decisions under "Execution Log" in task file
- [ ] Tell user: "Execution complete, moving to Step 3"

## Step 3 — Review & Test

- [ ] Code review: no dead code, no regressions, no hacks, consistent style
- [ ] `node --check index.html` — passes
- [ ] `grep -c "<<<<<<" index.html` — returns 0
- [ ] `npm test` — all pass
- [ ] Screenshot the game
- [ ] Mark each success criterion PASS/FAIL in task file
- [ ] All criteria PASS before continuing
- [ ] Tell user: "Step 3 complete — all [N] criteria pass. [brief notes]"

## Step 4 — Deploy & Report

- [ ] Deploy to Hetzner
- [ ] Attach screenshots in task file
- [ ] List issues encountered and resolutions
- [ ] Move task file: `tasks/active/` → `tasks/done/`
- [ ] Tell user: "Deployed. [screenshots + notes]" + link to http://5.161.208.234:3000
