# book-api

A NestJS CRUD Book API designed for **technical interviews**.

This project uses Node.js, TypeScript, NestJS, SQLite (via TypeORM), and Vitest. It is pre-configured for GitHub Codespaces so that a candidate can start immediately in a browser session.

---

## Interview Instructions

- [Candidate Readme](./docs/README_CANDIDATE.md)
- [Interviewer Readme](./docs/README_INTERVIEWER.md)

---

## Local Development

**Prerequisites:** Node.js ≥ 18, pnpm ≥ 9

```bash
# Install dependencies
pnpm install

# Start the API in development mode
pnpm start:dev

# The API will be available at http://localhost:3000
```

### Docker

```bash
# Build and start the container
docker-compose up --build

# The API will be available at http://localhost:3000
```

---
