# User Dashboard

A Next.js 16 user dashboard that displays a list of users with search, filter, sort, and pagination — plus a detailed profile page per user showing their posts and todos.

Data is fetched from [JSONPlaceholder](https://jsonplaceholder.typicode.com), a free public REST API for testing and prototyping.

---

## Tech Stack

| Layer         | Library / Tool                  |
| ------------- | ------------------------------- |
| Framework     | Next.js 16 (App Router)         |
| Language      | TypeScript                      |
| Styling       | Tailwind CSS v4                 |
| UI Components | shadcn/ui (on `@base-ui/react`) |
| Data Fetching | TanStack React Query v5         |
| Icons         | Lucide React                    |
| Testing       | Jest + Testing Library          |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with QueryProvider
│   ├── page.tsx                # Redirects to /users
│   └── users/
│       ├── page.tsx            # User list page (client component)
│       └── [id]/
│           ├── page.tsx        # User detail page (async server component)
│           └── _components/
│               ├── PostsList.tsx   # Expandable posts list (client)
│               └── TodosList.tsx   # Pending/completed todos (client)
├── components/
│   └── ui/                     # shadcn/ui components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── separator.tsx
│       ├── skeleton.tsx
│       └── table.tsx
├── lib/
│   ├── api.ts                  # Fetch functions (JSONPlaceholder)
│   ├── types.ts                # User, Post, Todo interfaces
│   └── __test__/
│       ├── UserList.test.tsx   # Tests for /users page
│       └── UserDetail.test.tsx # Tests for /users/[id] page
├── providers/
│   └── QueryProvider.tsx       # TanStack Query client provider
└── test-utils/
    ├── mocks.ts                # Shared mock data (users, posts, todos)
    └── wrapper.tsx             # React Query wrapper for tests
```

---

## Features

### `/users` — User List

- Search users by name or email (URL-synced via `?q=`)
- Filter by activity: All / Has pending todos / No completed todos (`?filter=`)
- Sort by name A–Z, Z–A, or most pending todos (`?sort=`)
- Pagination (5 users per page, `?page=`)
- Responsive: table layout on desktop, card layout on mobile
- Per-user activity badges: **Posts**, **Done**, **Pending**
- URL state is fully persistent — shareable and browser-back safe

### `/users/[id]` — User Detail

- Async server component with parallel data fetching (`Promise.allSettled`)
- Shows: Contact, Company, Address sections
- Posts section: first 3 visible, rest behind "Show more" toggle
- Todos section: pending todos open by default; completed collapsible
- Graceful error handling: shows inline alert if posts or todos fail to load
- Calls `notFound()` for invalid or non-existent user IDs

---

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io) (recommended)

### Installation

```bash
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — the root redirects to `/users`.

### Build for Production

```bash
pnpm build
pnpm start
```

---

## Running Tests

### Unit Tests

```bash
pnpm test
```

To run in watch mode:

```bash
pnpm test:watch
```

#### Unit Test Setup

| Tool                        | Purpose                                  |
| --------------------------- | ---------------------------------------- |
| Jest                        | Test runner                              |
| `@testing-library/react`    | Render and query components              |
| `@testing-library/jest-dom` | DOM matchers (`toBeInTheDocument`, etc.) |
| `jest-fetch-mock`           | Intercept and mock `fetch` calls         |
| `ts-jest`                   | TypeScript compilation inside Jest       |

The test environment is `jsdom`. Mocks for `next/navigation` and `next/link` are applied per test file.

#### Unit Test Results

```
Test Suites: 2 passed, 2 total
Tests:       17 passed, 17 total
Snapshots:   0 total
Time:        ~1.5 s
```

#### Unit Test Coverage

**`UserList.test.tsx`** (9 tests)

- Shows skeletons while data is loading
- Renders all users with name and email
- Shows error alert when the users fetch fails
- Filters users by name search (URL state)
- Filters users by email search (URL state)
- Shows empty state when no users match
- Shows all users when search is cleared
- Sorts users by name ascending then descending (URL state)
- Shows activity badges (posts count, pending count) per user

**`UserDetail.test.tsx`** (8 tests)

- Renders the user card with correct name
- Renders all user detail fields (email, phone, company, city)
- Renders the "Back to list" navigation link
- Shows an error alert when the posts fetch fails
- Calls `notFound()` for a non-numeric user ID
- Calls `notFound()` for a user ID that returns 404
- Renders the posts section with post titles
- Renders the todos section with pending items and collapsed completed toggle

---

### E2E Tests

End-to-end tests run against the real dev server using [Playwright](https://playwright.dev). They make live network requests to JSONPlaceholder, so an internet connection is required.

```bash
pnpm test:e2e
```

Playwright starts the dev server automatically (`pnpm dev`) before running tests and reuses an existing server if one is already running on port 3000.

To run with the Playwright UI (interactive trace viewer):

```bash
pnpm test:e2e --ui
```

To run a specific test file:

```bash
pnpm test:e2e tests/e2e/users.spec.ts
```

#### E2E Test Setup

| Tool            | Purpose                                          |
| --------------- | ------------------------------------------------ |
| Playwright      | Browser automation & test runner                 |
| Chromium        | Browser used for tests (bundled with Playwright) |
| JSONPlaceholder | Live API — real network calls during E2E         |

Configuration is in `playwright.config.ts`. Key settings:

- `baseURL`: `http://localhost:3000`
- `timeout`: 15 000 ms per test
- `webServer`: auto-starts `pnpm dev`, reuses existing server

#### E2E Test Results

```
Running 5 tests using 5 workers

✓  Users happy path › list → detail → back to list      (~2 s)
✓  Users happy path › invalid user id shows not found   (~2 s)
✓  Users happy path › filter by pending todos works     (~1 s)
✓  example › has title                                  (~1 s)
✓  example › get started link                           (~2 s)

5 passed (~5 s)
```

#### E2E Test Coverage

**`users.spec.ts`** — `Users happy path` (3 tests)

| Test                              | Steps covered                                                                                                                                                                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list → detail → back to list`    | Navigate to `/users`; wait for user list to load from API; search filters list to matching users; clear search restores full list; click a user row navigates to `/users/1`; detail page shows name, username, company; "Back to list" link returns to `/users` |
| `invalid user id shows not found` | Navigate to `/users/999`; custom not-found page renders with "User not found" message                                                                                                                                                                           |
| `filter by pending todos works`   | Navigate to `/users`; wait for list to load; select "Has pending todos" from activity filter; URL updates to include `filter=has-pending`                                                                                                                       |
