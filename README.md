# book-api

A NestJS CRUD Book API designed for **technical interviews**. The project uses Node.js, TypeScript, NestJS, SQLite (via TypeORM), and Vitest. It is pre-configured for GitHub Codespaces so that a candidate can start immediately in a browser session.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
  - [GitHub Codespaces (recommended)](#github-codespaces-recommended)
  - [Local Development](#local-development)
  - [Docker](#docker)
- [Running Tests](#running-tests)
- [Interview Guide](#interview-guide)
  - [For the Interviewer](#for-the-interviewer)
  - [For the Candidate](#for-the-candidate)

---

## Overview

This repository contains a simple REST API for managing **Books** and **Authors**. It is deliberately incomplete in two areas so that a candidate can demonstrate their ability to:

1. Identify a missing deduplication constraint.
2. Identify a missing relationship between entities and implement it.

---

## Project Structure

```
book-api/
├── src/
│   ├── author/
│   │   ├── author.entity.ts          # TypeORM Author entity
│   │   ├── author.service.ts         # Business logic
│   │   ├── author.controller.ts      # REST endpoints
│   │   ├── author.module.ts          # NestJS module
│   │   ├── create-author.dto.ts      # Request DTO
│   │   └── author.service.spec.ts    # Unit tests
│   ├── book/
│   │   ├── book.entity.ts            # TypeORM Book entity
│   │   ├── book.service.ts           # Business logic
│   │   ├── book.controller.ts        # REST endpoints
│   │   ├── book.module.ts            # NestJS module
│   │   ├── create-book.dto.ts        # Request DTO
│   │   └── book.service.spec.ts      # Unit tests (2 intentionally failing)
│   ├── app.module.ts                 # Root NestJS module
│   └── main.ts                       # Entry point
├── .devcontainer/
│   └── devcontainer.json             # GitHub Codespaces config
├── Dockerfile
├── docker-compose.yml
├── vitest.config.mts
├── tsconfig.json
└── package.json
```

---

## Database Schema

### `author`

| Column      | Type    | Notes              |
|-------------|---------|--------------------|
| id          | INTEGER | Primary key (auto) |
| firstName   | TEXT    | Author's first name |
| lastName    | TEXT    | Author's last name  |
| country     | TEXT    | Author's country    |

### `book`

| Column   | Type    | Notes              |
|----------|---------|--------------------|
| id       | INTEGER | Primary key (auto) |
| title    | TEXT    | Book title          |
| authorId | INTEGER | Author reference (no FK constraint) |
| isbn     | TEXT    | ISBN number         |

> **Note:** There is intentionally **no foreign-key constraint** between `book.authorId` and `author.id`. This is one of the things a candidate may be asked to identify and fix.

---

## API Endpoints

### Authors

| Method | Endpoint        | Description           |
|--------|-----------------|-----------------------|
| GET    | `/authors`      | Get all authors        |
| GET    | `/authors/:id`  | Get author by ID       |
| POST   | `/authors`      | Create a new author    |

**POST `/authors` body:**
```json
{
  "firstName": "Jane",
  "lastName": "Austen",
  "country": "England"
}
```

### Books

| Method | Endpoint     | Description       |
|--------|--------------|-------------------|
| GET    | `/books`     | Get all books      |
| GET    | `/books/:id` | Get book by ID     |
| POST   | `/books`     | Create a new book  |

**POST `/books` body:**
```json
{
  "title": "Pride and Prejudice",
  "authorId": 1,
  "isbn": "978-0-14-143951-8"
}
```

> **Note:** `POST` **always** creates a new record, even if the same title already exists. This is intentional and is one of the things a candidate may be asked to fix.

---

## Getting Started

### GitHub Codespaces (recommended)

1. Click the green **Code** button on the repository page.
2. Select the **Codespaces** tab.
3. Click **Create codespace on main**.
4. Wait for the environment to initialize (dependencies are installed automatically via `postCreateCommand`).
5. Run the tests from the integrated terminal:

```bash
pnpm test
```

### Local Development

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

## Running Tests

```bash
# Run all unit tests (12 pass, 2 intentionally fail)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

---

## Interview Guide

### For the Interviewer

This repository contains **14 unit tests**:

- **12 tests pass** — they validate the existing, working functionality of the `BookService` and `AuthorService`.
- **2 tests intentionally fail** — they describe features that are **not yet implemented**. The candidate should:
  1. Run the tests, observe which ones fail and why.
  2. Investigate the codebase to understand the current design.
  3. Propose and implement fixes to make the failing tests pass.

The two failing tests are located at the bottom of `src/book/book.service.spec.ts` under the describe block:
> `BookService - Candidate Challenges (Intentionally Failing)`

**Suggested talking points:**
- Why does the API create a duplicate book instead of returning an existing one?
- Why can't a book have more than one author right now?
- How would you add a foreign-key relationship between `book` and `author`?
- What is idempotency and how does it apply to the POST endpoint?

---

### For the Candidate

Welcome! This project is a NestJS REST API for managing Books and Authors backed by a SQLite database.

**Your task:**

1. **Install dependencies and run the tests:**

   ```bash
   pnpm install
   pnpm test
   ```

2. **You will see that 2 tests fail.** Read the failure messages and the comments in the test file carefully — they explain what behavior is expected.

3. **Fix the code so that all tests pass.**

**Hints (only read if you're stuck):**

<details>
<summary>Hint for Test 1 – "Creating a record with the same book title returns the same id"</summary>

The `BookService.create()` method always calls `repository.save()` unconditionally. Consider checking whether a book with the same title already exists before inserting. If it does, return the existing record instead of creating a new one.

</details>

<details>
<summary>Hint for Test 2 – "A book can have two authors"</summary>

The `Book` entity currently has a single `authorId` integer column — there is no relationship to the `Author` entity and no foreign-key constraint. Consider:
- Adding a many-to-many relationship (or a join table) between `Book` and `Author`.
- Updating `BookService.findOne()` to eagerly load the related authors and return their full names.

</details>
