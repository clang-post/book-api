# Overview

Welcome! This project is a NestJS REST API for creating and fetching Authors and Books backed by a SQLite database.

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

| Method | Endpoint          | Description           |
|--------|-------------------|-----------------------|
| GET    | `/books`          | Get all books         |
| GET    | `/books/:id`      | Get book by ID        |
| POST   | `/books`          | Create a new book     |
| POST   | `/books/multiple` | Create multiple books |

**POST `/books` body:**
```json
{
  "title": "Pride and Prejudice",
  "authorId": 1,
  "isbn": "978-0-14-143951-8"
}
```

---

**Your task:**

1. Install dependencies and run the tests:

   ```bash
   pnpm install
   pnpm test
   ```

2. Two tests should fail - identify which tests do not pass and why.
3. Propose a solution to fix the **"expected 1 to deeply equal 2"** error
4. If time permits, propose a solution to fix the other test

**Notes:**

- Writing code is optional, but comments and pseudocode are encouraged to explain your solution.
- For the beginning of this assessment, do not use AI. After the interviewer asks you to, you may use AI to assist.
