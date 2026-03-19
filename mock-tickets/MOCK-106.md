# MOCK-106: Add Task Archival Endpoint

**Type**: Feature
**Priority**: Medium
**Component**: Tasks
**Status**: In Progress

## Description

Users need the ability to archive completed tasks instead of deleting them. Archived tasks should be hidden from the default task list but retrievable via a separate endpoint.

This involves:

1. A `POST /tasks/:id/archive` endpoint that marks a task as archived
2. A `GET /tasks/archived` endpoint that lists archived tasks
3. An `ArchivedTask` type that extends `Task` with archival metadata (archivedAt, archivedBy)
4. Updating shared types to include the new archival status

## Acceptance Criteria

- [ ] `POST /tasks/:id/archive` sets task status to `archived` and records timestamp
- [ ] `GET /tasks/archived` returns only archived tasks for the authenticated user
- [ ] Archived tasks are excluded from `GET /tasks` (default list)
- [ ] `POST /tasks/:id/unarchive` restores a task to its previous status
- [ ] `ArchivedTask` type extends `Task` with `archivedAt: Date` and `archivedBy: string`
- [ ] Unit tests cover archive, unarchive, and filtered listing
- [ ] Shared types updated for archival status

## Expected Outcome

Users can archive and unarchive tasks. Archived tasks are hidden from default views but accessible through dedicated endpoints.

## Technical Notes

- New endpoints in `src/tasks/routes.ts`
- New type in `src/tasks/model.ts`
- Shared type update in `src/shared/types.ts` for archival status enum
- Tests in `tests/tasks/routes.test.ts`
