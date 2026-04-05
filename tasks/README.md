# Task Workflow

Tasks move through a 4-step lifecycle: Plan → Execute → Review → Deploy.

## Folder structure

```
tasks/
  README.md         # This file
  TEMPLATE.md       # Copy this when starting a new task
  active/           # Tasks currently in progress (one at a time)
  done/             # Completed tasks (moved here after Deploy)
```

## Lifecycle

| Step | Who acts | Output |
|---|---|---|
| **1 Plan** | Agent drafts options, picks one, writes task file | Task file in `active/`, agent messages user to approve — then STOPS |
| **2 Execute** | Agent implements, logs decisions | Execution Log filled in, agent messages user transitioning to Step 3 |
| **3 Review** | Agent runs full test suite, screenshots | Success criteria marked PASS/FAIL, agent messages user with summary |
| **4 Deploy** | Agent deploys to Hetzner, captures proof | Deploy section filled in, task moved to `done/`, agent messages user |

## Naming convention

`TASK-NNN-short-slug.md` — e.g. `TASK-005-ice-wall-spell.md`

One task file per feature. Keep files small — link to PRs and commits rather than pasting diffs.
