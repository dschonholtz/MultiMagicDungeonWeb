# Task NNN: [Short Title]

**Status:** planning | executing | reviewing | deployed
**Created:** YYYY-MM-DD

---

## Options Considered

### Option A — [Name]
**Approach:** [Brief description]
**Pros:** [List]
**Cons:** [List]

### Option B — [Name]
**Approach:** [Brief description]
**Pros:** [List]
**Cons:** [List]

### Option C — [Name] _(optional)_
**Approach:** [Brief description]
**Pros:** [List]
**Cons:** [List]

---

## Chosen Approach

**Choosing Option [A/B/C]** because [reason — focus on why this is better for this project specifically].

---

## Success Criteria

1. [Specific, measurable, testable outcome]
2. [Specific, measurable, testable outcome]
3. [Specific, measurable, testable outcome]
_(Add more as needed. Each must be verifiable — not "looks good", but "portal ring is vertical within ±5°".)_

---

## Testing Strategy

| Criterion | How to verify |
|-----------|---------------|
| 1. [criterion] | [playwright test / visual screenshot / curl check / manual step] |
| 2. [criterion] | [playwright test / visual screenshot / curl check / manual step] |
| 3. [criterion] | [playwright test / visual screenshot / curl check / manual step] |

Full Playwright suite (`npm test`) must pass before Step 4.

---

## Plan

Step-by-step implementation plan. Be specific enough that another agent could pick this up.

1. [Step]
2. [Step]
3. [Step]

---
---

## Step 2: Execution Log

_Filled in during execution. Note significant decisions, deviations from plan, and why._

- [Date] [What was done, any surprises]

---

## Step 3: Code Review & Test Results

### Code Review Notes
_Things found, fixed, or intentionally left as-is with rationale._

- [ ] No dead code or commented-out blocks
- [ ] No console.log in production paths
- [ ] No merge conflict markers
- [ ] Style consistent with surrounding code
- [ ] Non-obvious logic has comments explaining WHY
- [ ] No regressions introduced

### Playwright Results
```
npm test output here
```

### Success Criteria Results

| # | Criterion | Result | Notes |
|---|-----------|--------|-------|
| 1 | [criterion] | ✅ PASS / ❌ FAIL | |
| 2 | [criterion] | ✅ PASS / ❌ FAIL | |
| 3 | [criterion] | ✅ PASS / ❌ FAIL | |

**All criteria pass: YES / NO**

---

## Step 4: Deploy & Screenshots

**Deploy commit:** [hash]
**Live URL:** http://5.161.208.234:3000
**Deployed at:** [timestamp]

### Issues encountered
- [Issue] → [How it was resolved]

### Screenshots
_Attach screenshots here or reference filenames._

### User sign-off
_Space for user feedback after review._
