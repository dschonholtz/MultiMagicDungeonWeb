# Task 030: Add websocket payload size and message rate limits

**Status:** planning
**Created:** 2026-04-05
**Issue ID:** NET-005
**Severity:** Medium

---

## Problem Statement
Add websocket payload size and message rate limits is tracked in `tasks/active/017-project-wide-code-review-and-hardening-plan.md` and needs a standalone implementation task for execution and ownership.

---

## Scope
- Address only **NET-005** in this task.
- Keep changes minimal and targeted to this issue.
- Update tests/docs impacted by the fix.

---

## Success Criteria
1. The root cause for **NET-005** is fixed in code.
2. Existing behavior outside this issue scope remains unchanged.
3. Relevant automated and/or manual checks pass and are documented in this task when executed.

---

## Testing Strategy
| Criterion | How to verify |
|---|---|
| 1 | Reproduce before/after behavior for NET-005 |
| 2 | Run targeted Playwright/server checks for touched code |
| 3 | Run `npm test` when behavior meaningfully changes gameplay/networking |

---

## Initial Plan
1. Confirm reproduction path and exact acceptance boundaries for NET-005.
2. Implement minimal fix with comments on non-obvious logic.
3. Add/adjust tests to prevent regression.
4. Run checks and document results in Step 3 sections when executing.

---

## Priority Recommendation
- **Tier:** P1 (Next Wave)
- **Why now:** High leverage for reliability and developer velocity once core risks are reduced.
