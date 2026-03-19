# Mock Tickets — Scope-Check Test Scenarios

These files simulate Jira tickets for testing the `/scope-check` skill.
Each file is named `MOCK-NNN.md` and mirrors Jira ticket structure.

## How to Test

From this repo, check out a branch and run `/scope-check --no-ticket`:

```bash
git checkout feat/MOCK-101-password-reset
# In Claude Code:
/scope-check --no-ticket
```

Compare output against expected results below.

---

## Scenario Matrix

| Branch | Ticket | Clarity | Expected Verdict | Key Test |
|--------|--------|---------|-----------------|----------|
| `feat/MOCK-101-password-reset` | MOCK-101 | CLEAR | IN SCOPE | Baseline — all files in-scope |
| `fix/MOCK-102-login-redirect` | MOCK-102 | CLEAR | SCOPE ISSUES DETECTED | 2 in-scope, 2 out-of-scope (CLEAN split) |
| `feat/MOCK-103-user-profile` | MOCK-103 | CLEAR | SCOPE ISSUES DETECTED | 2 in-scope, 2 supporting, 1 tangential |
| `feat/MOCK-104-improve-ux` | MOCK-104 | AMBIGUOUS | N/A (stops at ticket analysis) | Ticket clarity gate |
| `fix/MOCK-105-fix-bug` | MOCK-105 | INSUFFICIENT | N/A (stops at ticket analysis) | Ticket clarity gate |
| `feat/MOCK-106-task-archival` | MOCK-106 | CLEAR | SCOPE ISSUES DETECTED | MIXED file, COUPLED type, complex split |

---

## Detailed Expected Results

### MOCK-101: Password Reset (All In-Scope)
- `src/auth/routes.ts` → **in-scope** (new endpoint added)
- `src/auth/token.ts` → **in-scope** (password reset token logic)
- `tests/auth/middleware.test.ts` → **in-scope** (test coverage for auth changes)
- **Verdict**: IN SCOPE

### MOCK-102: Login Redirect Fix (Scope Creep)
- `src/auth/routes.ts` → **in-scope** (login redirect fix)
- `src/auth/middleware.ts` → **in-scope** (related auth fix)
- `README.md` → **out-of-scope** (unrelated documentation update) → CLEAN split
- `.eslintrc.js` → **out-of-scope** (unrelated config change) → CLEAN split
- **Verdict**: SCOPE ISSUES DETECTED

### MOCK-103: User Profile Update (Supporting + Tangential)
- `src/users/routes.ts` → **in-scope** (new profile update endpoint)
- `src/users/validation.ts` → **in-scope** (validation for new fields)
- `src/shared/types.ts` → **supporting** (shared types used by new endpoint)
- `package.json` → **supporting** (new dependency for feature)
- `src/tasks/routes.ts` → **tangential** (opportunistic typo fix) → CLEAN split
- **Verdict**: SCOPE ISSUES DETECTED

### MOCK-104: Improve UX (Ambiguous)
- Ticket clarity: **AMBIGUOUS** — vague objective, no measurable AC
- Scope review should NOT proceed
- Expected output: recommendation to clarify ticket before proceeding

### MOCK-105: Fix Bug (Insufficient)
- Ticket clarity: **INSUFFICIENT** — no description, no AC, no context
- Scope review should NOT proceed
- Expected output: recommendation to add detail before proceeding

### MOCK-106: Task Archival (Complex Split)
- `src/tasks/routes.ts` → **in-scope** BUT contains unrelated refactor → **MIXED**
- `src/tasks/model.ts` → **in-scope** (new ArchivedTask type)
- `src/shared/types.ts` → **supporting** (type used by archive endpoint) → **COUPLED**
- `src/shared/database.ts` → **out-of-scope** (unrelated config change) → CLEAN split
- `tests/tasks/routes.test.ts` → **in-scope** (archive endpoint tests)
- **Verdict**: SCOPE ISSUES DETECTED
