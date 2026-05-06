# Multiplayer CLI Demo App

This project now includes a simple local backend server so the frontend can request data from `/api/*` instead of calling placeholder APIs directly.

## Folder structure

- `client/` - React + Vite frontend
- `server/` - Express backend proxy

## Run in development

```bash
npm install
npm run dev
```

This runs:

- Vite frontend on `http://localhost:5173`
- Express backend on `http://localhost:8787`

Vite proxies `/api` requests to the backend.

## Backend endpoints

- `GET /api/health`
- `GET /api/users`
- `GET /api/users/export`
- `GET /api/posts`
- `GET /api/comments`

The backend proxies data from JSONPlaceholder and can simulate errors/delay.

## Simulate backend failures

You can trigger failures from the browser by adding query params to any API request:

- `?fail=1` force an error
- `?failStatus=503` customize status code
- `?failRate=30` fail ~30% of calls
- `?delay=1200` add 1200ms response delay

Example:

```text
/api/users?fail=1&failStatus=503
```

## Environment variables for global simulation

Set these before running the backend:

- `API_FAIL_RATE` - default failure rate percent
- `API_FAIL_STATUS` - default failure status code
- `API_DELAY_MS` - default response delay
- `PORT` - backend port (defaults to `8787`)
