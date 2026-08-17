# Frontend Talking Points

Interview talking points for the FE side of the Book API project. Grounded in the actual code in [frontend/src/BooksPage.tsx](../frontend/src/BooksPage.tsx) and [frontend/src/AuthorsPage.tsx](../frontend/src/AuthorsPage.tsx).

Section order follows a **concrete → abstract** flow (start with code the candidate can read, end with philosophy). The original list from [docs/README_FE_INTERVIEWER.md](README_FE_INTERVIEWER.md) is preserved as a mapping table at the end.

### Order at a glance

1. Warmup — comfort with the stack
2. Code review — `useEffect` + `setState` for server data
3. Code review — `submitBook` and `any` typing
4. Form handling — modern approaches
5. Fetch layer — what's needed around `fetch`
6. API design — UPDATE endpoint + atomic vs per-field
7. TypeScript deep-dive
8. Meta / philosophy — external deps & supply-chain

### Rationale

- **Ramp gradually.** Concrete code → design conversations → abstract discussion. Candidates open up when they can see the code.
- **Group related topics.** Fetching (setState → useFetchQuery → fetch features) and forms sit together. API contract questions (UPDATE) come after client-side is discussed, so the candidate has context for why the shape matters.
- **Front-load code review, back-load philosophy.** If time runs short, you've already assessed hands-on ability; the philosophy questions are optional signal.
- **Difficulty curve.** TypeScript advanced patterns (`satisfies`, template literals) require warmth; put them near the end but before the low-stakes wrap-up.

---

## 1. Warmup — comfort with the stack

> "How comfortable do you feel about React, TypeScript, Tailwind, Nest.js, Vite / Vitest, and Node in general?"

An icebreaker that also calibrates the depth of later questions.

Signals to listen for:

- **React** — hooks, effects, StrictMode, Suspense. Do they say "React 18/19" or still think class components?
- **TypeScript** — hands-on level. Can they name generics, unions, `unknown` vs `any`, `satisfies`? See section 7.
- **Tailwind** — v3 vs v4 awareness (Oxide engine, CSS-first `@theme` config). Composition pattern with `clsx` / `tailwind-merge` / `class-variance-authority`. See also the Styling sub-warmup below.
- **Nest.js** — DI containers, decorators (`@Controller`, `@Injectable`), modules, TypeORM integration.
- **Vite / Vitest** — Vite dev-server / HMR / plugin model; Vitest as a Jest-compatible runner built on Vite. Bonus: `describe` / `it` / `expect`, coverage config, `vi.mock`, snapshot testing.
- **Node** — event loop, ESM vs CJS, streams, `process` vs `globalThis`.

Use their self-rating (1–5) to decide whether later questions should be conceptual or code-level.

### Styling

**Ask:** "How do you style React apps?"

Signals:

- **Tailwind v4** — daily driver on Breccia.
- **Composition pattern** — `clsx` + `tailwind-merge` + `class-variance-authority` (CVA) for variant components. This is the shadcn / Breccia pattern; naming these is a strong signal.
- **styled-components** — legacy but real (fst-pdm). Aware that it's not RSC-friendly and adoption is declining? Bonus.

### Client state management

**Ask:** "Beyond `useState` / `useContext`, what client-state libraries have you used?"

Signals — aligned:

- **Distinguishing server state from client state** is the key signal — server state (fetched, cached) belongs in TanStack Query; client state (UI, form, ephemeral) in Zustand / Jotai / xstate-store.
- **`@xstate/store`** — fst-pdm uses it. Bonus for XState / statechart familiarity generally.
- **Zustand** / **Jotai** — common alternatives; fine if they haven't used our exact choice.
- Redux depth is not particularly valued — we avoid it.

### Testing

**Ask:** "What's your testing stack beyond Vitest?"

Signals — aligned:

- **React Testing Library** — expected. Bonus for "query by role" philosophy, `userEvent` v14 API, `screen` vs destructuring.
- **Playwright** — fst-pdm uses it; Breccia has a dedicated `frontend-e2e` app. Strong signal.
- **jsdom** vs **happy-dom** awareness.
- **MSW** for network mocking — bonus.
- Cypress / Enzyme knowledge is not valued (we don't use them).

---

## 1.5 — Open-ended code review prompt

> "Take a few minutes to read frontend code. What would you improve?"

---

## 2. Code review — `useEffect` + `setState` for server data

Reference code:

```tsx
useEffect(() => {
  axios
    .get('/api/authors')
    .then((res) => setAuthors(res.data))
    .catch((err) => showError('Failed to load authors: ' + (err.response?.status ?? err.message)));
}, []);
```

### 2.a — Why this pattern is problematic

Calling `setState` inside `useEffect` is **not** inherently bad. React's own docs endorse the pattern for imperative side effects (**fetch**, **subscriptions**, etc.). What is bad is the specific pattern used here:

1. **Deriving server state into local state.** The server is the source of truth. Copying it into `useState` means you now own cache invalidation, refetch, dedup, stale-while-revalidate, race conditions on unmount — all things you didn't sign up for.
2. **No cleanup / race condition.** If the component unmounts before the promise resolves, you call `setState` on an unmounted component (React 18 tolerates it, but the request still runs and the response is wasted). If the effect re-runs, an older response can overwrite a newer one.
3. **No loading / error state modeled.** You have to add `useState` for `isLoading`, `error`, `data` separately and keep them in sync manually.
4. **Under `<StrictMode>` in dev the effect runs twice** → double fetch unless you deduplicate.
5. **Not cacheable across components.** Two components mounting `AuthorsPage` fetch twice.

**Framing:**
> "`setState` in `useEffect` is fine for genuine side effects. But **server state should not be stored in `useState` at all** — that's what a data-fetching library (React Query / SWR / RTK Query) is for."

**Follow-up probe** (if the candidate handles the above well):

> "What about *chains* of `useEffect` + `setState` — Effect A sets state B, which triggers Effect C? What's wrong with that?"

Expected answer:

- Cascading render passes — Effect A → render → Effect B → render → Effect C → render. What could be one render becomes several.
- Stale closures / race conditions across the chain.
- Debugging nightmare because the trail runs backwards through invisible render cycles.
- **Fix:** derive during render (a plain `const`), memoize with `useMemo`, use a reducer, or lift state up. React docs: *"You Might Not Need an Effect."*

### 2.b — Target state: `const { data, isLoading } = useFetchQuery(API.authors)`

What's needed to get there:

- **A data-fetching library** — TanStack Query (`@tanstack/react-query`) is the standard. Alternatives: SWR, RTK Query.
- **A `QueryClient` + `<QueryClientProvider>`** mounted at the app root.
- **A typed API layer** (`API.authors = { key: ['authors'], fetch: () => http.get<Author[]>('/api/authors') }`) so query keys and return types are consistent.
- **A thin custom hook** (`useFetchQuery`) wrapping `useQuery` to enforce project conventions (error handling via `ErrorContext`, retry policy, staleTime defaults).
- **Mutations** via `useMutation` + `queryClient.invalidateQueries(['authors'])` to replace the current "POST then GET" pattern.

You get for free: caching, dedup, background refetch, retries, request cancellation on unmount, loading/error states, devtools.

---

## 3. Code review — `submitBook` and `any` typing

Reference code:

```tsx
const submitBook = async (e: any) => { // any should never be used
  e.preventDefault();
  try {
    await axios.post('/api/books', {
      title: title,
      authorId: authorId ? Number(authorId) : undefined,
      isbn: isbn,
    });
    const res = await axios.get('/api/books');
    setBooks(res.data);
  } catch (err: any) {
    showError('Failed to create book: ' + (err.response?.status ?? err.message));
  }
};
```

### Correct event type

For a `<form onSubmit={...}>` handler:

```tsx
const submitBook = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  ...
};
```

### Why `any` is bad in general

- `any` opts *out* of type checking — you lose autocomplete, safe refactors, and the compiler can no longer catch typos or wrong shapes.
- It's contagious: anything derived from `any` becomes `any`.
- Prefer `unknown` when you truly don't know the type — it forces you to narrow before use.

For `catch (err: any)`: modern TS defaults catch variables to `unknown` under `useUnknownInCatchVariables`. Narrow with `axios.isAxiosError(err)` (or, if migrating off axios, `err instanceof Error`).

> **Bridge to section 6:** the `POST` → refetch pattern in this handler is exactly what mutations + cache invalidation replace. And the shape of the update request (all fields at once vs one at a time) is discussed under UPDATE endpoint design.

---

## 4. Form handling — modern approaches

Current form uses ad-hoc `useState` per field + manual `onChange`. Problems: no validation, no dirty/touched tracking, no error display, verbose.

Modern options:

- **React Hook Form** — the de-facto standard. Uncontrolled inputs → minimal re-renders, tiny bundle, first-class TS, integrates with Zod/Yup via resolvers.
- **TanStack Form** — headless, framework-agnostic, fully type-safe field paths. Breccia's choice.
- **Conform** — server-first, works great with React 19 actions / Remix / Next.
- **Native `<form action={...}>` + React 19 Actions + `useActionState`** — for simple forms, no library needed at all.

Pair any of the above with **Zod** (or Valibot) for a single schema that gives you TS types + runtime validation on both client and server.

Concrete rewrite sketch:

```tsx
const schema = z.object({
  title: z.string().min(1),
  authorId: z.coerce.number(),
  isbn: z.string(),
});

const { register, handleSubmit, formState: { errors } } =
  useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
```

---

## 5. Fetch layer — what's needed around native `fetch`?

If you go with native `fetch` (no external deps), you have to build or borrow:

- **Base URL / auth header injection** (interceptor equivalent).
- **JSON serialization + `Content-Type` boilerplate.**
- **HTTP error handling** — `fetch` does *not* reject on 4xx/5xx; you have to check `res.ok` yourself.
- **Timeouts + cancellation** via `AbortController`.
- **Retries with backoff** for transient failures.
- **Response parsing + runtime validation** (e.g. Zod) — otherwise types lie.
- **Caching / dedup / revalidation** (this is why React Query exists).
- **Request/response logging + telemetry.**
- **CSRF / auth refresh** handling.

Trade-off: `fetch` avoids a dep, but you rebuild half of axios anyway. In practice most teams pair native `fetch` **with** React Query — `fetch` for transport, React Query for state.

---

## 6. API design — UPDATE endpoint & atomic vs per-field

> "How would you implement an UPDATE endpoint for books and authors? What are considerations for updating a book's authors or an author's details?"

This is really a design conversation. Good answers touch on all of the following.

### 6.a — HTTP method

- **`PUT /books/:id`** — replace the whole resource. Client must send *every* field. Missing field = null/removed.
- **`PATCH /books/:id`** — partial update. Only the fields present in the payload are changed. Preferred for real-world forms.
- **`PATCH /books/:id/isbn` (sub-resource style)** — per-field endpoint. Fits inline-edit UX (see 6.e).

### 6.b — Payload / DTO

- Separate `CreateBookDto` and `UpdateBookDto` types on the backend.
- `UpdateBookDto = Partial<CreateBookDto>` on the client for type reuse.
- Validate with class-validator (Nest) / Zod (FE) — reject unknown fields.

### 6.c — Relations — the interesting part

- Updating an **author's own fields** (firstName, lastName, country) is trivial — no side effects.
- Updating a **book's `authorId`** requires:
  - Verifying the new author exists (FK constraint or explicit check → 404 if missing).
  - Deciding what happens to the old author reference (nothing — just replaced).
  - Cache invalidation on the client for **both** `['authors', oldId]` and `['authors', newId]`, plus the book detail.
- If the model ever becomes many-to-many (a book has multiple authors), the update endpoint needs a different shape (`authorIds: number[]`) and the DB needs a join table.

### 6.d — Concurrency / lost updates

- Two users editing the same book → the last writer silently wins.
- Mitigations:
  - **Optimistic locking:** server sends `updatedAt` or `version`; client echoes it back on PATCH; server rejects with 409 if it doesn't match.
  - **ETag + `If-Match` header** — same idea, HTTP-native.
- Overkill for an interview project but worth mentioning as a real-world consideration.

### 6.e — Atomic (all fields at once) vs per-field PATCH

The trade-off is really a **UX decision**, not just a technical one.

#### Option A — one `PATCH /books/:id` with a partial payload

- **Pros:** atomic on the server (all-or-nothing), one round trip, single validation pass, simpler optimistic update, one cache invalidation.
- **Cons (UX-focused):**
  - User has to fill / re-touch the whole form and hit **Save** to change a single field → more clicks, more friction.
  - No inline editing — the row/detail view has to switch into an "edit mode" for the whole record.
  - A validation error on *any* field blocks saving the field the user actually wanted to change.
  - Higher risk of accidental edits — a stale value in another field can overwrite a fresh change made by someone else (lost update).

#### Option B — one request per field (inline edit UX)

- **Pros:**
  - **Better UX:** user edits one field at a time, save-on-blur or save-on-change. No modal, no "edit mode", no Save button. The Notion / Linear / Airtable pattern.
  - Smaller payloads, granular retries, granular optimistic updates (only the touched field flips).
  - Concurrency is safer — you only overwrite the one field you actually changed, so two people editing different fields of the same record don't clobber each other.
  - Per-field validation feedback shown next to that field, immediately.
- **Cons:**
  - N round trips if the user changes N fields quickly → mitigate with **debouncing** (wait ~500 ms after last keystroke) and/or **batching** (queue changes, flush together).
  - Not atomic across fields — if two fields are logically linked (e.g. `authorId` change requires `isbn` re-check), partial failure leaves a mixed state. Need server-side cross-field validation on each PATCH.
  - More cache-update work on the client.

#### Rule of thumb

- **Form-style / wizard UX** → single PATCH.
- **Inline / spreadsheet-style UX** → per-field PATCH, debounced.

Both endpoints can coexist: a single `PATCH /books/:id` with a partial DTO supports *both* patterns — the client decides whether to send one field or many.

### 6.f — Client-side considerations

- Cache invalidation strategy (React Query: `invalidateQueries` vs `setQueryData`).
- Optimistic updates — flip the UI immediately, roll back on error.
- Error UX — surface field-level validation errors from the server, not a generic toast.

---

## 7. TypeScript

### 7.a — Typing the API module properly

Layered approach:

```ts
// api/author.types.ts — shared shapes
export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
}
export type CreateAuthorDto = Omit<Author, 'id'>;
export type UpdateAuthorDto = Partial<CreateAuthorDto>;

// api/author.ts — typed calls
export const authorApi = {
  list:   ()                                 => http.get<Author[]>('/api/authors'),
  get:    (id: number)                       => http.get<Author>(`/api/authors/${id}`),
  create: (dto: CreateAuthorDto)             => http.post<Author>('/api/authors', dto),
  update: (id: number, dto: UpdateAuthorDto) => http.patch<Author>(`/api/authors/${id}`, dto),
};

// query keys — literal tuples for React Query
export const authorKeys = {
  all:    ['authors'] as const,
  detail: (id: number) => ['authors', id] as const,
};
```

**Endgame: share types with the backend.** Options:

- Colocate DTOs in a `packages/shared` workspace and import in both apps.
- Generate types from an OpenAPI spec (`openapi-typescript`) or use tRPC / ts-rest for end-to-end type safety without codegen.

Result: renaming a field on the backend is a compile error on the frontend.

### 7.b — Type inference and modern FE

**Type inference = the compiler deducing a type you didn't write explicitly**, from the shape of the value or the return type of a function.

```ts
const x = 42;                  // inferred: number (literal `42` when const)
const authors = useAuthors();  // Author[] — inferred from useAuthors's return type
```

**Why it matters for modern FE:**

- **You annotate boundaries, not internals.** Type the API layer + schemas once; every consumer downstream gets typed for free.
- **Generic libraries carry types end-to-end.** `useQuery<Author[]>(...)` propagates through `data`. `useForm<Schema>()` types every `register('field')`. Zod's `z.infer<typeof schema>` turns a runtime schema into a static type — no duplication.
- **Refactor safety.** Rename a field in one place; TS flags every downstream site. Without inference, you'd have to keep hand-written interfaces in sync.
- **Less noise, more signal.** Explicit types everywhere hide bugs behind ceremony; inference keeps code readable and lets the compiler do the bookkeeping.
- **Enables advanced type-level patterns** (below): `satisfies`, template literal types, discriminated unions — the "type-safe by construction" style that React Query, tRPC, Zod, Remix/Next actions all rely on.

**One-liner:**
> "Modern TS FE is about writing types at the edges — the API schema, the form schema, the query definition — and letting inference carry them everywhere else. You should almost never annotate a component prop that comes from a typed hook."

#### `satisfies` operator

**What it is:** a TS operator that checks a value conforms to a type **without widening/erasing** its more specific inferred type. It's the fix for the classic `const x: SomeType = {...}` trade-off where you get validation but lose literal types.

**Why it matters:** you get the best of both worlds — the compiler verifies the shape, *and* you keep the narrow literal type for downstream inference.

```ts
type Route = { path: string; method: 'GET' | 'POST' };

// Without satisfies — type is Record<string, Route>, keys are lost
const routes: Record<string, Route> = {
  listBooks:  { path: '/books', method: 'GET' },
  createBook: { path: '/books', method: 'POST' },
};
routes.listBookz; // no error! typo goes undetected

// With satisfies — keys stay literal, method stays 'GET'|'POST', still validated
const routes2 = {
  listBooks:  { path: '/books', method: 'GET' },
  createBook: { path: '/books', method: 'POST' },
} satisfies Record<string, Route>;

routes2.listBookz;         // ❌ TS error: property doesn't exist
routes2.listBooks.method;  // type: 'GET' (not 'GET' | 'POST')
```

Common uses: config objects, route tables, theme tokens, query-key registries.

#### Template literal types

**What it is:** types built by concatenating string literals, similar to JS template strings but at the type level. Combined with unions and generics, they let you describe strings by *shape*.

**Why it matters:** typed API paths, event names, CSS units, i18n keys — anywhere a string has structure, TS can enforce it.

```ts
// Every valid REST path in the API
type Resource = 'books' | 'authors';
type Path = `/api/${Resource}` | `/api/${Resource}/${number}`;

const p1: Path = '/api/books';       // ok
const p2: Path = '/api/authors/42';  // ok
const p3: Path = '/api/movies';      // ❌ error

// Extract the resource from a path
type ResourceOf<P> = P extends `/api/${infer R}` ? R : never;
type R = ResourceOf<'/api/books'>;   // 'books'
```

Real-world: Tailwind class autocomplete, tRPC route keys, `Intl` locale codes.

#### Discriminated unions

**What it is:** a union of object types where each variant has a **common literal field** (the "discriminant" / "tag"). TS uses that field to *narrow* the type inside conditionals — you get exhaustive, type-safe branching.

**Why it matters:** perfect for modeling API responses, state machines, Redux/Zustand actions, `useReducer` — anything with a finite set of shapes.

```ts
type QueryState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error';   error: Error };

function render(state: QueryState<Author[]>) {
  switch (state.status) {
    case 'idle':    return null;
    case 'loading': return <Spinner />;
    case 'success': return <List items={state.data} />;           // state.data is Author[]
    case 'error':   return <Err message={state.error.message} />; // state.error is Error
  }
}
```

TS knows `data` only exists on the `success` branch and `error` only on the `error` branch — no optional chaining, no runtime checks, no "cannot read property of undefined". Add a `default: assertNever(state)` to get **exhaustiveness checking** — if you add a new variant, every consumer becomes a compile error until handled.

---

## 8. External deps — supply-chain concern

> "Why external deps are not great these days? Because of the current trend with AI-generated supply chain attacks."

Great "wrap-up" discussion — low-pressure, tests judgment rather than knowledge.

- **Supply-chain attacks are rising**, and AI-generated malicious packages / typosquats accelerate the trend — attackers can now publish lookalike package names in bulk, or seed innocent-looking helpers with delayed payloads.
- Every dep is an implicit trust in dozens of transitive maintainers. `npm ls | wc -l` on a typical React app is sobering.
- Historical incidents worth naming: `event-stream` (2018), `ua-parser-js` (2021), `colors.js` / `faker.js` sabotage (2022), Lottie Player (2024).
- **Mitigations:**
  - Prefer platform primitives (`fetch`, `URL`, `AbortController`, `Intl`, native `<form action>`) when they cover the use case.
  - Pin versions; audit lockfile diffs in PR review.
  - Tooling: `pnpm audit`, [socket.dev](https://socket.dev), `npm-audit-resolver`, Renovate/Dependabot.
  - Lock down `postinstall` scripts — pnpm's `onlyBuiltDependencies` allowlist (already used in this repo, [package.json](../package.json)) is a good example.
- **Rule of thumb:** adopt a dep when it solves a real problem you'd otherwise reinvent poorly (React Query, Zod, React Hook Form). Skip it when the platform already handles it well enough.

---

## Mapping back to the original interviewer list

For reference — the original talking-points order from [docs/README_FE_INTERVIEWER.md](README_FE_INTERVIEWER.md):

| Original # | Topic                                  | New # |
|------------|----------------------------------------|-------|
| 1          | Warmup — stack comfort                 | 1     |
| 2          | UPDATE endpoint & considerations       | 6     |
| 3          | External deps concern                  | 8     |
| 4          | `useEffect` + `setState` improvement   | 2     |
| 5          | `submitBook` + `any` + atomic updates  | 3 + 6.e |
| 6          | Fetch layer                            | 5     |
| 7          | Form handling                          | 4     |
| 8          | TypeScript (API module + inference)    | 7     |
