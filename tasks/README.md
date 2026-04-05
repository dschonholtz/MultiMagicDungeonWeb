# Tasks

This folder tracks all feature work, bug fixes, and improvements using a 4-step workflow.

## Folder structure

```
tasks/
  active/          # Tasks currently in flight
  done/            # Completed tasks, archived for reference
  TEMPLATE.md      # Copy this to start a new task
```

## File naming

`NNN-short-description.md` — e.g. `001-add-monsters.md`, `002-fix-portal-rotation.md`

Increment NNN sequentially. Use kebab-case for the description.

## Workflow summary

Each task moves through 4 steps. **NEVER skip a step or run steps out of order.**

1. **Plan** — Document 2-3 options, pick one, write success criteria + testing strategy. Send to user for approval. **STOP and wait** — do not proceed until the user explicitly approves.
2. **Execute** — Implement the plan. Log significant decisions in the task file's Execution Log.
3. **Review & Test** — Code review + full Playwright suite + mark each success criterion PASS/FAIL. Message user with results before deploying.
4. **Deploy** — Deploy to Hetzner, attach screenshots, send user the live link for review.

See `CLAUDE.md § Task Workflow` for the full protocol and `.claude/skills/task-workflow/SKILL.md` for the agent checklist.
