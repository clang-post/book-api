# book-api

A NestJS CRUD Book API designed for **technical interviews**.

This project uses Node.js, TypeScript, NestJS, SQLite (via TypeORM), and Vitest. It is pre-configured for GitHub Codespaces so that a candidate can start immediately in a browser session.

---

## Interview Instructions

- [Candidate Backend Readme](docs/README_BE_CANDIDATE.md)
- [Candidate Frontend Readme](docs/README_FE_CANDIDATE.md)
- [Interviewer Backend Readme](docs/README_BE_INTERVIEWER.md)
- [Interviewer Frontend Readme](docs/README_FE_INTERVIEWER.md)

---

## Monorepo Structure

This repository is a [Turborepo](https://turborepo.com) monorepo managed with pnpm workspaces:

```
book-api/
├── backend/   # NestJS + TypeORM API (port 3000)
├── frontend/  # React + Vite app     (port 5173)
├── turbo.json
└── pnpm-workspace.yaml
```

## Local Development

**Prerequisites:** Node.js ≥ 20, pnpm ≥ 10

```bash
# Install dependencies for both workspaces
pnpm install

# Start backend and frontend together
pnpm dev

# Backend: http://localhost:3000
# Frontend: http://localhost:5173 (proxies /api/* to the backend)
```

Other root scripts (all fan out via Turborepo):

```bash
pnpm build   # build both packages
pnpm start   # run production builds
pnpm test    # run all tests
```
