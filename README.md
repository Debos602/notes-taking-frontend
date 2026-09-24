# TaskFlow — Frontend

A responsive React frontend for the Project & Task Management Portal. It consumes
the backend REST API and stores task data in an SQL database (handled by the
backend).

## Features

- Create, read, update, and delete tasks
- Task fields: Title, Description, Priority (Low/Medium/High),
  Status (Pending/In Progress/Completed), Created Date
- Form validation with clear inline error messages
- Loading states (skeletons + spinners)
- Success / error toast notifications
- Delete confirmation modal
- Empty states
- Search + status filter
- Mobile-responsive layout (Tailwind CSS)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ (LTS recommended)
- npm 10+
- The backend API running (see the backend setup). The app expects the API at
  `http://localhost:5000/api` by default.

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure the API URL (optional)
#    Copy .env.example to .env and adjust VITE_API_URL if your backend
#    runs on a different host/port.
cp .env.example .env

# 3. Run the dev server
npm run dev

# 4. Open http://localhost:5173
```

## Environment Variables

| Variable        | Description                                  | Default                          |
| --------------- | -------------------------------------------- | -------------------------------- |
| `VITE_API_URL` | Base URL of the backend REST API (no trailing slash) | `http://localhost:5000/api` |

## Available Scripts

| Command        | Description                                     |
| -------------- | ----------------------------------------------- |
| `npm run dev`  | Start the Vite dev server with hot reload       |
| `npm run build`| Type-check and build for production             |
| `npm run lint` | Run ESLint                                      |
| `npm run preview` | Preview the production build locally          |

## API Contract

The frontend communicates with the backend via these REST endpoints
(`/tasks` appended to `VITE_API_URL`):

| Method   | Endpoint        | Description          |
| -------- | --------------- | -------------------- |
| `GET`    | `/tasks`        | Fetch all tasks      |
| `POST`   | `/tasks`        | Create a task        |
| `GET`    | `/tasks/:id`    | Fetch a single task  |
| `PUT`    | `/tasks/:id`    | Update a task        |
| `DELETE` | `/tasks/:id`    | Delete a task        |

A task resource looks like:

```json
{
  "id": 1,
  "title": "Set up database",
  "description": "Create the tasks table",
  "priority": "High",
  "status": "InProgress",
  "createdDate": "2025-01-01T12:00:00.000Z"
}
```

## Project Structure

```
src/
  App.tsx                 # Root component: state, API calls, routing
  main.tsx                # React entry point
  types.ts                # Shared TypeScript types
  index.css               # Tailwind base + global styles
  App.css                 # App-scoped styles
  lib/
    api.ts                # REST API client (fetch)
    utils.ts              # Validation schema, color maps, helpers
  components/
    TaskCard.tsx          # Single task card
    TaskList.tsx          # Task grid + empty/loading states
    TaskForm.tsx          # Create / edit form
    DeleteConfirmation.tsx # Delete modal
    ui/
      Modal.tsx
      LoadingSpinner.tsx
      EmptyState.tsx
      Badge.tsx           # PriorityBadge, StatusBadge
      Toast.tsx           # Toast notifications
```

## Running with Docker

A multi-stage Dockerfile is provided for production builds. Build and run:

```bash
docker build -t taskflow-frontend .
docker run -p 80:80 -e VITE_API_URL=http://host.docker.internal:5000/api taskflow-frontend
```
