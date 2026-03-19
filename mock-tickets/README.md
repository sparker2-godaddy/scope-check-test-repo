# Mock Tickets — Scope-Review Test Scenarios

These files simulate Jira tickets for testing the `/scope-review` skill.
Each file is named `MOCK-NNN.md` and mirrors Jira ticket structure.

## Quick Start (Test Harness)

The automated test harness handles branch checkout, context gathering, and expected results:

```bash
# From scope-check-test-repo root:
./test-harness.sh setup              # Validate repo + show test matrix
./test-harness.sh run-all            # Run all 7 tests sequentially
./test-harness.sh run <branch>       # Run single branch test

# Cache test (MOCK-107):
./test-harness.sh cache-setup        # Create cache fixtures
# Run /scope-review MOCK-101 in Claude Code
./test-harness.sh cache-verify       # Check cache state
./test-harness.sh teardown           # Clean up
```

## Manual Testing

From this repo, check out a branch and run `/scope-review --no-ticket`:

```bash
git checkout feat/MOCK-101-password-reset
# In Claude Code:
/scope-review --no-ticket
```

Compare output against expected results below.

---

## Scenario Matrix

| Branch | Ticket | Clarity | Expected Verdict | Key Test |
|--------|--------|---------|-----------------|----------|
| `feat/MOCK-101-password-reset` | MOCK-101 | CLEAR | IN SCOPE | Baseline — all files in-scope |
| `fix/MOCK-102-login-redirect` | MOCK-102 | CLEAR | SCOPE ISSUES DETECTED | 2 in-scope, 2 out-of-scope (CLEAN split) |
| `feat/MOCK-103-user-profile` | MOCK-103 | CLEAR | SCOPE ISSUES DETECTED | 2 in-scope, 2 supporting, 1 tangential |
| `feat/MOCK-104-improve-ux` | MOCK-104 | AMBIGUOUS | IN SCOPE (v5.0: synthesized) | Synthesizer resolves from API formatting |
| `fix/MOCK-105-fix-bug` | MOCK-105 | INSUFFICIENT | IN SCOPE (v5.0: synthesized) | Synthesizer resolves from db config |
| `feat/MOCK-106-task-archival` | MOCK-106 | CLEAR | SCOPE ISSUES DETECTED | MIXED file, COUPLED type, complex split |
| (MOCK-107: cache) | MOCK-101 | CLEAR | IN SCOPE | Cache hit/stale/refresh behavior |

> **v5.0.0 Note**: MOCK-104 and MOCK-105 changed from BLOCKED/UNKNOWN to IN SCOPE.
> The v5.0 scope synthesizer resolves scope from branch name + commit messages when
> ticket clarity is insufficient, rather than blocking.

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

### MOCK-104: Improve UX (v5.0: Synthesizer Resolves)
- **v4.4.0**: Ticket clarity AMBIGUOUS → scope UNKNOWN, blocked
- **v5.0.0**: Synthesizer infers scope as "API response formatting" from branch + commits
- `src/shared/types.ts` → **in-scope** (response format types)
- `src/users/routes.ts` → **in-scope** (API response changes)
- **Verdict**: IN SCOPE

### MOCK-105: Fix Bug (v5.0: Synthesizer Resolves)
- **v4.4.0**: Ticket clarity INSUFFICIENT → scope UNKNOWN, blocked
- **v5.0.0**: Synthesizer infers scope as "database connection/config" from branch + commits
- `src/shared/database.ts` → **in-scope** (connection config fix)
- **Verdict**: IN SCOPE

### MOCK-106: Task Archival (Complex Split)
- `src/tasks/routes.ts` → **in-scope** BUT contains unrelated refactor → **MIXED**
- `src/tasks/model.ts` → **in-scope** (new ArchivedTask type)
- `src/shared/types.ts` → **supporting** (type used by archive endpoint) → **COUPLED**
- `src/shared/database.ts` → **out-of-scope** (unrelated config change) → CLEAN split
- `tests/tasks/routes.test.ts` → **in-scope** (archive endpoint tests)
- **Verdict**: SCOPE ISSUES DETECTED

### MOCK-107: Cache Behavior (No Branch — Reuses MOCK-101)
- Tests cache hit/stale detection/refresh for ticket analysis caching
- **Setup**: `./test-harness.sh cache-setup` writes synthetic cache to `$TMPDIR/scope-review-cache/MOCK-101.md`
- **Test 1**: Run `/scope-review MOCK-101` — should detect cached analysis
- **Test 2**: Run `/scope-review MOCK-101 --refresh` — should ignore cache and re-analyze
- **Verify**: `./test-harness.sh cache-verify` checks cache file state
