# Reading Break

A personal book tracking app.

## Stack

| Layer     | Technology                                                                               |
| --------- | ---------------------------------------------------------------------------------------- |
| Framework | **Next.js 16** (App Router) + **TypeScript**                                             |
| Styling   | **Tailwind CSS v4**                                                                      |
| Database  | **better-sqlite3** — local SQLite, auto-created as `data.db` on first run, no migrations |
| Book data | **Open Library API** — free, no API key required                                         |

## Getting Started

```bash
npm install
npm run dev   # http://localhost:3000
```

No environment variables needed.

## What You Can Do

| Action                | Where          | Detail                                                                   |
| --------------------- | -------------- | ------------------------------------------------------------------------ |
| **Search books**      | Home page      | Queries Open Library; debounced 400 ms, min 2 chars                      |
| **Add a book**        | Home page      | Pick status (Wishlist / Reading / Finished / Dropped) on any result card |
| **Update status**     | Any book card  | Dropdown on saved cards                                                  |
| **Remove a book**     | Any saved card | "Remove" link                                                            |
| **Filter collection** | My Books page  | Tab bar: All / Wishlist / Reading / Finished / Dropped                   |

## Project Structure

```
src/
├── app/                # Next.js App Router pages and API routes
│   ├── api/            # Internal API endpoints
│   └── my-books/       # My Books page
├── components/         # Shared React components
├── hooks/              # Custom hooks (e.g. useDebounce, useSearch)
└── lib/                # Database client and utility functions
```

## Open Library API

The app uses the [Open Library API](https://openlibrary.org/developers/api) — completely free, no account or API key needed.
