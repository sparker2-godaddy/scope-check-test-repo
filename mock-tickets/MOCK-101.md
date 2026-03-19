# MOCK-101: Add Password Reset Endpoint

**Type**: Feature
**Priority**: High
**Component**: Auth
**Status**: In Progress

## Description

Users currently have no way to reset their password if they forget it. We need to add a password reset flow to the auth module. This involves:

1. A `POST /auth/forgot-password` endpoint that accepts an email and generates a time-limited reset token
2. A `POST /auth/reset-password` endpoint that accepts the reset token and a new password
3. Token generation/validation logic for reset tokens (separate from session JWTs)

The reset token should expire after 1 hour and be single-use.

## Acceptance Criteria

- [ ] `POST /auth/forgot-password` accepts `{ email }` and returns 200 (always, to prevent email enumeration)
- [ ] `POST /auth/reset-password` accepts `{ token, newPassword }` and returns 200 on success
- [ ] Reset tokens expire after 1 hour
- [ ] Reset tokens are single-use (invalidated after successful reset)
- [ ] Invalid or expired tokens return 400 with appropriate error message
- [ ] Password is hashed before storage (using bcrypt, same as registration)
- [ ] Unit tests cover token generation, validation, expiry, and single-use behavior

## Expected Outcome

Users can reset their password via a two-step flow. The feature is fully contained within the auth module with no impact on other modules.

## Technical Notes

- Reset token generation should reuse patterns from `src/auth/token.ts`
- New endpoints go in `src/auth/routes.ts`
- Tests extend `tests/auth/middleware.test.ts`
