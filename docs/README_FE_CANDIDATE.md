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

1. Install dependencies, run the web server, and visit http://localhost:5173/:

   ```bash
   pnpm install
   pnpm dev
   ```
   
2. Go to the author page and create an author
3. Go to the book page and create a book
4. Based on what you have seen so far, what could be improved or added?
5. Now go into the codebase, and take a moment to look at it. Where would you implement the improvements you mentioned before and how?
6. The frontend code is full of "bad" code and practices, identify as many problems as you can see. How would you fix them?

**Notes:**

- Writing code is optional, but comments and pseudocode are encouraged to explain your solution.
- For this assessment, we encourage you to not use AI. However, we would love to hear how you develop with it.
