# Note Manager

Note Manager is a responsive React and TypeScript application for creating,
organizing, and reviewing notes. It supports authenticated users, role-based
administration, user posts, profile management, and Progressive Web App (PWA)
installation.

## Features

- Register with a name, email, password, and interests
- Sign in, refresh, and terminate a cookie-based or bearer-token session
- Create, view, edit, and delete personal notes
- Paginated notes sorted by newest creation date
- Create and view posts for the current user
- Admin user management with role and interest assignment
- Admin review of all notes and their owners
- Dashboard statistics for users and interest groups
- Profile viewing and account management
- Responsive desktop and mobile layout
- Loading, empty, error, and confirmation states
- Installable PWA with an auto-updating service worker

## Technology

- React 19 and TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack React Query
- Lucide React
- Vite PWA plugin

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- A running backend that provides the API described below

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in a browser. The frontend uses
`http://localhost:5000/api/v1` when `VITE_API_URL` is not set.

## Environment Variables

Create a `.env` file in the project root to point the frontend at another
backend:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

`VITE_API_URL` is normalized by the client, but it is best to provide the base
URL without a trailing slash. The repository also includes `.env.example` for
the deployed backend configuration. Never commit private credentials or tokens
to an environment file.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite with hot reload |
| `npm run build` | Type-check and create the production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve the production build locally |
| `npm run generate-icons` | Generate application icons when the icon script is available |

There is currently no test script or test suite in this repository.

## Routes and Access

| Route | Access | Purpose |
| --- | --- | --- |
| `/login` | Public | Sign in |
| `/register` | Public | Create an account |
| `/` | Authenticated | Dashboard overview |
| `/notes` | Authenticated | Manage personal notes |
| `/settings` | Authenticated | Settings page |
| `/profile` | Authenticated | View and manage profile |
| `/my-posts` | `USER` only | View and create posts |
| `/users` | `ADMIN` only | Manage users |
| `/admin/notes` | `ADMIN` only | Review all notes |

Role values are case-sensitive and must be `ADMIN` or `USER`. Unauthenticated
users are redirected to `/login`; authenticated users without the required role
are redirected to `/`. Unknown routes also redirect to `/`.

## Backend API Contract

The client sends all requests with `credentials: 'include'`. If a token is
available, it also sends `Authorization: Bearer <token>`. Successful responses
generally follow this shape:

```json
{
  "success": true,
  "message": "Request completed",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPage": 1
  }
}
```

### Authentication and Profile

| Method | Endpoint | Payload or purpose |
| --- | --- | --- |
| `POST` | `/auth/login` | `{ email, password }` |
| `POST` | `/auth/register` | `{ name, email, password, interests }` |
| `POST` | `/auth/refresh` | Refresh the current session |
| `POST` | `/auth/logout` | End the current session |
| `GET` | `/users/me` | Load the current user |
| `PATCH` | `/users/:id` | Update profile fields |
| `DELETE` | `/users/:id` | Delete the current account |

### Notes and Posts

| Method | Endpoint | Payload or purpose |
| --- | --- | --- |
| `GET` | `/notes/my-notes?sort=-createdAt&page=&limit=` | Paginated personal notes; the UI uses six per page |
| `POST` | `/notes` | `{ title, content }` |
| `GET` | `/notes/:id` | Load one note |
| `PATCH` | `/notes/:id` | Update note fields |
| `DELETE` | `/notes/:id` | Delete a note |
| `GET` | `/notes?sort=-createdAt&page=&limit=` | Admin-only all-notes listing with owners |
| `GET` | `/aggregations/posts/user/:userId?page=&limit=` | Load user metadata and paginated posts |
| `POST` | `/posts` | `{ title, content }` |

### Users and Dashboard

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/users?page=&limit=` | Paginated admin user list; the UI uses ten per page |
| `POST` | `/users` | Create a user with role and interests |
| `PATCH` | `/users/:id` | Update a user; password is optional |
| `DELETE` | `/users/:id` | Delete a user |
| `GET` | `/aggregations/users/grouped-by-interest` | Group users by interest |
| `GET` | `/aggregations/user/stats` | Load dashboard statistics |

The client accepts note identifiers as either `id` or Mongo-style `_id`. API
errors may use `message`, a string `error`, `errorSources`, or structured
validation issues.

## PWA and Deployment

The production build generates a web manifest, service worker, and installable
icons. Static JavaScript, CSS, HTML, SVG, PNG, and ICO assets are precached.
Requests matching `/api/` use a network-first cache strategy with a five-second
network timeout.

The repository includes deployment configuration for two common setups:

- `vercel.json` rewrites frontend routes to `index.html` for SPA navigation.
- `nginx.conf` provides SPA fallback behavior and proxies `/api/` to
  `http://backend:5000/api/`.

For Vercel or another separately hosted frontend, set `VITE_API_URL` to the
external backend URL. The frontend rewrite does not proxy API requests. Cookie
authentication across separate frontend and backend domains also requires
appropriate backend CORS and cookie settings.

Build and preview the production app with:

```bash
npm run build
npm run preview
```

There is no Dockerfile in this repository, so Docker image commands are not
provided here.

## Project Structure

```text
src/
  App.tsx                    # Routes and authentication guards
  main.tsx                   # React, Router, Query, and DnD providers
  types.ts                  # Shared application types
  contexts/
    AuthContext.tsx          # Authentication, session, and profile operations
    useAuth.ts               # Auth context interface and hook
  lib/
    notesApi.ts              # Notes and posts API client
    usersApi.ts              # Users and dashboard API client
    utils.ts                 # Shared utility code
  layout/
    MainLayout.tsx           # Authenticated application shell
  components/
    DashboardOverview.tsx    # Dashboard content
    layout/                  # Header, sidebar, menus, and navigation data
    ui/                      # Shared UI primitives
    *Skeleton.tsx             # Loading placeholders
  pages/                     # Authentication, notes, users, profile, and posts views
public/                      # Favicon and PWA assets
```

## Current Limitations

- Settings is currently a placeholder page.
- Header search, notifications, and Help & Support are visual controls without
  complete behavior.
- Drag-and-drop providers are configured, but no current screen uses them.
- The `generate-icons` script references `scripts/generate-icons.mjs`; confirm
  that the script exists before using it in a fresh checkout.
