# MOCK-102: Fix Login Redirect After Password Reset

**Type**: Bug Fix
**Priority**: Medium
**Component**: Auth
**Status**: In Progress

## Description

After a user completes a password reset, the login endpoint does not properly redirect them back to their original destination. The `returnTo` query parameter is being ignored in the login response.

Additionally, the auth middleware is not preserving the original URL when redirecting unauthenticated users to login.

## Acceptance Criteria

- [ ] `POST /auth/login` respects `returnTo` query parameter and includes it in the response
- [ ] Auth middleware stores the original requested URL before redirecting to login
- [ ] Login response includes `redirectUrl` field when `returnTo` is present
- [ ] Existing login behavior (without `returnTo`) is unchanged

## Expected Outcome

After password reset, users are seamlessly redirected to their original destination upon login. The fix is contained to auth routes and middleware.

## Technical Notes

- Fix in `src/auth/routes.ts` (login endpoint)
- Fix in `src/auth/middleware.ts` (URL preservation)
