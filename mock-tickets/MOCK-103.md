# MOCK-103: Add User Profile Update Endpoint

**Type**: Feature
**Priority**: Medium
**Component**: Users
**Status**: In Progress

## Description

Users need the ability to update their profile information beyond just name and email. We need to extend the user profile update endpoint to support additional fields:

- Display name
- Avatar URL
- Bio (max 500 characters)
- Timezone preference

This requires adding new validation rules and extending the shared type definitions.

## Acceptance Criteria

- [ ] `PUT /users/me` accepts new fields: `displayName`, `avatarUrl`, `bio`, `timezone`
- [ ] `bio` field is limited to 500 characters
- [ ] `avatarUrl` must be a valid URL if provided
- [ ] `timezone` must be a valid IANA timezone string
- [ ] New Zod validation schema covers all new fields
- [ ] Shared types are updated with new `UserProfile` interface
- [ ] Existing fields (name, email) continue to work as before

## Expected Outcome

Users can update a richer set of profile fields. The API validates all inputs and returns the updated profile.

## Technical Notes

- Update `src/users/routes.ts` with extended endpoint logic
- Update `src/users/validation.ts` with new schema fields
- Add `UserProfile` type to `src/shared/types.ts`
- May need `validator` package for timezone validation (add to `package.json`)
