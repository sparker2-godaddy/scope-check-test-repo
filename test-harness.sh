#!/usr/bin/env bash
# test-harness.sh — Semi-automated test harness for /scope-review skill
#
# Since /scope-review is a Claude Code skill (not a CLI), this harness
# automates environment setup + validation framework:
#   - Branch checkout + git context gathering
#   - Expected results definition per branch
#   - Cache file setup/teardown for cache tests
#   - Structured output comparing expected vs actual (filled in by tester)
#
# Usage:
#   ./test-harness.sh setup            # Validate repo state, show test matrix
#   ./test-harness.sh run <branch>     # Checkout branch, gather context, print expected
#   ./test-harness.sh run-all          # Sequential run through all 7 test cases
#   ./test-harness.sh cache-setup      # Create cache fixtures for MOCK-107
#   ./test-harness.sh cache-verify     # Check cache state after test
#   ./test-harness.sh teardown         # Clean up cache fixtures, return to main

set -euo pipefail

# --- Configuration ---
GATHER_SCRIPT="$HOME/.claude/skills/scope-review/scripts/gather-context.sh"
CACHE_DIR="${TMPDIR:-/tmp}/scope-review-cache"
CACHE_TICKET="MOCK-101"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

# --- Branch list ---
BRANCHES=(
  "feat/MOCK-101-password-reset"
  "fix/MOCK-102-login-redirect"
  "feat/MOCK-103-user-profile"
  "feat/MOCK-104-improve-ux"
  "fix/MOCK-105-fix-bug"
  "feat/MOCK-106-task-archival"
)

# --- Expected results lookup (bash 3.2 compatible) ---
# Returns: verdict|detail|scope|files
get_expectations() {
  local branch="$1"
  case "$branch" in
    "feat/MOCK-101-password-reset")
      echo "IN SCOPE"
      echo "3 files, all in-scope (baseline)"
      echo ""
      echo "src/auth/routes.ts:in-scope"
      echo "src/auth/token.ts:in-scope"
      echo "tests/auth/middleware.test.ts:in-scope/supporting"
      ;;
    "fix/MOCK-102-login-redirect")
      echo "SCOPE ISSUES"
      echo "2 in-scope + 2 out-of-scope (CLEAN split)"
      echo ""
      echo "src/auth/middleware.ts:in-scope"
      echo "src/auth/routes.ts:in-scope"
      echo ".eslintrc.js:out-of-scope(CLEAN)"
      echo "README.md:out-of-scope(CLEAN)"
      ;;
    "feat/MOCK-103-user-profile")
      echo "SCOPE ISSUES"
      echo "2 in-scope + 2 supporting + 1 tangential (CLEAN split)"
      echo ""
      echo "src/users/routes.ts:in-scope"
      echo "src/users/validation.ts:in-scope"
      echo "src/shared/types.ts:supporting"
      echo "package.json:supporting"
      echo "src/tasks/routes.ts:tangential(CLEAN)"
      ;;
    "feat/MOCK-104-improve-ux")
      echo "IN SCOPE"
      echo "v5.0: synthesizer resolves scope from API formatting changes"
      echo "Synthesized scope: API response formatting"
      echo "src/shared/types.ts:in-scope"
      echo "src/users/routes.ts:in-scope"
      ;;
    "fix/MOCK-105-fix-bug")
      echo "IN SCOPE"
      echo "v5.0: synthesizer resolves scope from database config changes"
      echo "Synthesized scope: database connection/config"
      echo "src/shared/database.ts:in-scope"
      ;;
    "feat/MOCK-106-task-archival")
      echo "SCOPE ISSUES"
      echo "3 in-scope + 1 supporting + 1 MIXED + 1 out-of-scope (CLEAN)"
      echo ""
      echo "src/tasks/model.ts:in-scope"
      echo "src/tasks/validation.ts:in-scope"
      echo "tests/tasks/routes.test.ts:in-scope"
      echo "src/shared/types.ts:supporting"
      echo "src/tasks/routes.ts:MIXED"
      echo "src/shared/database.ts:out-of-scope(CLEAN)"
      ;;
    *)
      echo "UNKNOWN"
      echo "No expectations defined for $branch"
      echo ""
      ;;
  esac
}

get_verdict() {
  get_expectations "$1" | head -1
}

get_detail() {
  get_expectations "$1" | sed -n '2p'
}

# --- Helper Functions ---

print_header() {
  echo ""
  echo -e "${BOLD}═══════════════════════════════════════════════════${RESET}"
  echo -e "${BOLD}  $1${RESET}"
  echo -e "${BOLD}═══════════════════════════════════════════════════${RESET}"
  echo ""
}

print_section() {
  echo -e "${CYAN}--- $1 ---${RESET}"
}

print_ok() {
  echo -e "  ${GREEN}✓${RESET} $1"
}

print_warn() {
  echo -e "  ${YELLOW}⚠${RESET} $1"
}

print_fail() {
  echo -e "  ${RED}✗${RESET} $1"
}

ensure_main() {
  local current
  current=$(git rev-parse --abbrev-ref HEAD)
  if [ "$current" != "main" ]; then
    echo -e "${DIM}Returning to main...${RESET}"
    git checkout main --quiet
  fi
}

# --- Commands ---

cmd_setup() {
  print_header "Scope-Review Test Harness — Setup"

  # Validate we're in the test repo
  print_section "Repo Validation"
  if [ ! -d "mock-tickets" ]; then
    print_fail "Not in scope-check-test-repo (missing mock-tickets/)"
    echo "  Run this script from the scope-check-test-repo root."
    exit 1
  fi
  print_ok "In scope-check-test-repo"

  # Check gather-context.sh exists
  if [ -f "$GATHER_SCRIPT" ]; then
    print_ok "gather-context.sh found at $GATHER_SCRIPT"
  else
    print_fail "gather-context.sh not found at $GATHER_SCRIPT"
    exit 1
  fi

  # Validate branches exist
  print_section "Branch Validation"
  local missing=0
  for branch in "${BRANCHES[@]}"; do
    if git rev-parse --verify "$branch" >/dev/null 2>&1; then
      print_ok "$branch"
    else
      print_fail "$branch (MISSING)"
      missing=$((missing + 1))
    fi
  done

  if [ "$missing" -gt 0 ]; then
    print_fail "$missing branch(es) missing"
    exit 1
  fi

  # Ensure clean working tree
  print_section "Working Tree"
  if [ -z "$(git status --porcelain)" ]; then
    print_ok "Clean working tree"
  else
    print_warn "Uncommitted changes detected — may affect test results"
  fi

  ensure_main

  # Print test matrix
  print_section "Test Matrix"
  echo ""
  printf "  ${BOLD}%-38s %-18s %s${RESET}\n" "Branch" "Expected Verdict" "Key Test"
  printf "  %-38s %-18s %s\n" "------" "----------------" "--------"
  for branch in "${BRANCHES[@]}"; do
    printf "  %-38s %-18s %s\n" "$branch" "$(get_verdict "$branch")" "$(get_detail "$branch")"
  done
  printf "  %-38s %-18s %s\n" "(MOCK-107: cache test)" "IN SCOPE" "Cache hit/stale/refresh on MOCK-101"
  echo ""

  print_ok "Setup complete — ${#BRANCHES[@]} branches + 1 cache test ready"
  echo ""
  echo "  Next steps:"
  echo "    ./test-harness.sh run-all          # Run all tests sequentially"
  echo "    ./test-harness.sh run <branch>     # Run single branch"
  echo "    ./test-harness.sh cache-setup      # Prepare cache test"
}

cmd_run() {
  local branch="$1"

  # Validate branch exists
  if ! git rev-parse --verify "$branch" >/dev/null 2>&1; then
    print_fail "Branch '$branch' does not exist"
    echo "  Available branches:"
    for b in "${BRANCHES[@]}"; do
      echo "    $b"
    done
    exit 1
  fi

  print_header "Test: $branch"

  # Checkout branch
  print_section "Checkout"
  git checkout "$branch" --quiet
  print_ok "Checked out $branch"
  echo ""

  # Run gather-context.sh
  print_section "Git Context (gather-context.sh)"
  echo -e "${DIM}"
  bash "$GATHER_SCRIPT" 2>&1 | sed 's/^/  /'
  echo -e "${RESET}"

  # Print expected results
  print_section "Expected Results"
  echo ""

  local expectations
  expectations=$(get_expectations "$branch")
  local verdict
  verdict=$(echo "$expectations" | head -1)
  local detail
  detail=$(echo "$expectations" | sed -n '2p')
  local scope_note
  scope_note=$(echo "$expectations" | sed -n '3p')

  echo -e "  ${BOLD}Verdict:${RESET} $verdict"
  echo -e "  ${BOLD}Detail:${RESET}  $detail"

  if [ -n "$scope_note" ]; then
    echo -e "  ${BOLD}Note:${RESET}    $scope_note"
  fi

  echo ""
  echo -e "  ${BOLD}File Classifications:${RESET}"
  echo "$expectations" | tail -n +4 | while IFS= read -r line; do
    if [ -n "$line" ]; then
      local file="${line%%:*}"
      local classification="${line#*:}"
      printf "    %-40s → %s\n" "$file" "$classification"
    fi
  done

  # Instruction for tester
  echo ""
  print_section "Action Required"
  echo ""
  echo -e "  Run ${BOLD}/scope-review --no-ticket${RESET} now in Claude Code."
  echo "  Compare the output against expected results above."
  echo ""
  read -rp "  Press Enter when done (or 'skip' to skip)... " response

  if [ "${response:-}" = "skip" ]; then
    print_warn "Skipped"
  fi

  # Return to main
  ensure_main
  echo ""
}

cmd_run_all() {
  print_header "Scope-Review Test Harness — Full Run"
  echo "  Running ${#BRANCHES[@]} branch tests + cache test"
  echo "  You will be prompted to run /scope-review after each checkout."
  echo ""
  read -rp "  Press Enter to begin... "

  local count=1
  local total=$(( ${#BRANCHES[@]} + 1 ))

  for branch in "${BRANCHES[@]}"; do
    echo ""
    echo -e "${BOLD}[$count/$total]${RESET}"
    cmd_run "$branch"
    count=$((count + 1))
  done

  # Cache test
  echo ""
  echo -e "${BOLD}[$count/$total] MOCK-107: Cache Behavior${RESET}"
  echo ""
  echo "  Run these commands in sequence:"
  echo "    1. ./test-harness.sh cache-setup"
  echo "    2. In Claude Code: /scope-review MOCK-101"
  echo "       (verify 'Using cached ticket analysis' appears)"
  echo "    3. In Claude Code: /scope-review MOCK-101 --refresh"
  echo "       (verify cache is refreshed)"
  echo "    4. ./test-harness.sh cache-verify"
  echo "    5. ./test-harness.sh teardown"
  echo ""
  read -rp "  Press Enter when cache tests are complete... "

  print_header "Test Run Complete"
  echo "  All $total test cases executed."
  echo "  Record results in SCOPE_CHECK_TEST_RESULTS.md"
}

cmd_cache_setup() {
  print_header "MOCK-107: Cache Setup"

  # Create cache directory
  mkdir -p "$CACHE_DIR"
  print_ok "Cache directory: $CACHE_DIR"

  # Write synthetic cache file
  local cache_file="$CACHE_DIR/${CACHE_TICKET}.md"
  local timestamp
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  cat > "$cache_file" << CACHEEOF
---
ticket_id: ${CACHE_TICKET}
cached_at: ${timestamp}
ttl_hours: 24
source: test-harness
---

## Ticket Analysis

**Clarity**: CLEAR
**Scope**: Password reset functionality — add forgot-password endpoint, token generation, and email trigger
**Acceptance Criteria**:
- POST /auth/forgot-password endpoint
- Token generation with expiry
- Email trigger integration

## Classification Hints

- auth/ changes: in-scope
- token management: in-scope
- test coverage: supporting
CACHEEOF

  print_ok "Cache file written: $cache_file"
  echo ""
  echo -e "  ${BOLD}Cache contents:${RESET}"
  cat "$cache_file" | sed 's/^/    /'
  echo ""
  echo -e "  Next: Run ${BOLD}/scope-review MOCK-101${RESET} in Claude Code"
  echo "  Expected: Should detect cached analysis and use it"
  echo ""
  echo -e "  Then test refresh: ${BOLD}/scope-review MOCK-101 --refresh${RESET}"
  echo "  Expected: Should ignore cache and re-analyze"
}

cmd_cache_verify() {
  print_header "MOCK-107: Cache Verification"

  local cache_file="$CACHE_DIR/${CACHE_TICKET}.md"

  print_section "Cache State"

  if [ -d "$CACHE_DIR" ]; then
    print_ok "Cache directory exists: $CACHE_DIR"
  else
    print_fail "Cache directory missing: $CACHE_DIR"
    return
  fi

  if [ -f "$cache_file" ]; then
    print_ok "Cache file exists: $cache_file"

    # Show file details
    local mod_time
    mod_time=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$cache_file" 2>/dev/null || stat -c "%y" "$cache_file" 2>/dev/null || echo "unknown")
    local file_size
    file_size=$(wc -c < "$cache_file" | tr -d ' ')

    echo ""
    echo "  Modified: $mod_time"
    echo "  Size:     $file_size bytes"

    # Check if the cached_at timestamp matches our synthetic one or was updated
    local cached_at
    cached_at=$(grep "^cached_at:" "$cache_file" | head -1 | awk '{print $2}')
    echo "  cached_at: $cached_at"

    # Check for source field — if still "test-harness", cache was read not replaced
    local source
    source=$(grep "^source:" "$cache_file" | head -1 | awk '{print $2}')
    if [ "$source" = "test-harness" ]; then
      print_ok "Cache file unchanged (source: test-harness) — cache was READ"
    else
      print_warn "Cache file updated (source: $source) — cache was REPLACED"
    fi
  else
    print_warn "Cache file removed or not found"
    echo "  This may indicate --refresh created a new file, or skill doesn't use this path"
  fi

  # List all cache files
  echo ""
  print_section "All Cache Files"
  if [ -d "$CACHE_DIR" ]; then
    ls -la "$CACHE_DIR/" 2>/dev/null | sed 's/^/  /' || echo "  (empty)"
  fi
  echo ""
}

cmd_teardown() {
  print_header "Teardown"

  # Return to main
  ensure_main
  print_ok "On main branch"

  # Clean up cache fixtures
  local cache_file="$CACHE_DIR/${CACHE_TICKET}.md"
  if [ -f "$cache_file" ]; then
    rm "$cache_file"
    print_ok "Removed cache fixture: $cache_file"
  else
    print_ok "No cache fixture to clean"
  fi

  # Remove cache dir if empty
  if [ -d "$CACHE_DIR" ] && [ -z "$(ls -A "$CACHE_DIR" 2>/dev/null)" ]; then
    rmdir "$CACHE_DIR"
    print_ok "Removed empty cache directory"
  fi

  print_ok "Teardown complete"
  echo ""
}

# --- Main ---

usage() {
  echo "Usage: ./test-harness.sh <command> [args]"
  echo ""
  echo "Commands:"
  echo "  setup          Validate repo state and show test matrix"
  echo "  run <branch>   Checkout branch, gather context, print expected results"
  echo "  run-all        Sequential run through all test cases"
  echo "  cache-setup    Create cache fixtures for MOCK-107 test"
  echo "  cache-verify   Check cache state after MOCK-107 test"
  echo "  teardown       Clean up cache fixtures, return to main"
  echo ""
  echo "Example:"
  echo "  ./test-harness.sh setup"
  echo "  ./test-harness.sh run feat/MOCK-101-password-reset"
  echo "  ./test-harness.sh run-all"
}

COMMAND="${1:-}"
case "$COMMAND" in
  setup)        cmd_setup ;;
  run)
    if [ -z "${2:-}" ]; then
      print_fail "Branch name required"
      echo "  Usage: ./test-harness.sh run <branch-name>"
      echo "  Example: ./test-harness.sh run feat/MOCK-101-password-reset"
      exit 1
    fi
    cmd_run "$2"
    ;;
  run-all)      cmd_run_all ;;
  cache-setup)  cmd_cache_setup ;;
  cache-verify) cmd_cache_verify ;;
  teardown)     cmd_teardown ;;
  -h|--help|"")
    usage
    exit 0
    ;;
  *)
    print_fail "Unknown command: $COMMAND"
    usage
    exit 1
    ;;
esac
