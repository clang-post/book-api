# Overview

Welcome! This project is a React SPA for creating and fetching Authors and Books.

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
   pnpm dev
   ```
   
### TODO: Create a task list similar to BE readme

**Notes:**

- Writing code is optional, but comments and pseudocode are encouraged to explain your solution.
- For this assessment, we encourage you to not use AI. However, we would love to hear how you develop with it.
