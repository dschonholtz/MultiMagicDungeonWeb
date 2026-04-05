# Tasks

This directory tracks all work using a 4-step workflow: Plan → Execute → Review → Deploy.

## Directory structure

```
tasks/
  active/   — tasks currently in flight
  done/     — completed tasks, archived for reference
  TEMPLATE.md — copy this to start a new task
```

## Naming convention

`NNN-short-description.md` — e.g. `001-add-monsters.md`

Numbers are sequential. Pad to 3 digits.

## Lifecycle

1. Task file created in `tasks/active/` during planning
2. File updated in-place throughout execution and review
3. On deploy, file moved to `tasks/done/`

See `CLAUDE.md` → **Task Workflow** for the full process.
