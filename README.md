# TaskFlow API

A minimal Express/TypeScript task management API.

## Features

- JWT-based authentication (login, register, logout)
- Task CRUD operations with validation
- User profile management
- Input validation via Zod schemas

## Quick Start

```bash
npm install
npm run dev
```

## API Endpoints

### Auth
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login and receive JWT
- `POST /auth/logout` — Invalidate token

### Tasks
- `GET /tasks` — List tasks for authenticated user
- `POST /tasks` — Create task
- `PUT /tasks/:id` — Update task
- `DELETE /tasks/:id` — Delete task

### Users
- `GET /users/me` — Get current user profile
- `PUT /users/me` — Update profile

## Testing

```bash
npm test
```

## Contributing

Please read our contribution guidelines before submitting PRs.
All code must pass linting and tests before merge.

## License

MIT
