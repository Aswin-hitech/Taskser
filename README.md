# Taskser

Taskser is a full-stack task, notes, checklist, and reminder application built with:

- `backend`: Express, MongoDB, JWT auth, secure refresh-cookie sessions
- `frontend/tasks`: React application for planning tasks, habits, notes, notifications, and checklists

## Local setup

1. Copy [backend/.env.example](/D:/Aswin%20Projects/Taskser/backend/.env.example) to `backend/.env` and set your MongoDB connection plus JWT secrets.
2. Copy [frontend/tasks/.env.example](/D:/Aswin%20Projects/Taskser/frontend/tasks/.env.example) to `frontend/tasks/.env`.
3. Install dependencies in both `backend` and `frontend/tasks`.
4. Start the backend with `npm run dev` from `backend`.
5. Start the frontend with `npm start` from `frontend/tasks`.

## Security highlights

- Password hashing with bcrypt
- Short-lived access tokens
- HttpOnly refresh-cookie rotation
- Protected API routes
- Request rate limiting
- Helmet security headers
- Input validation and ownership checks

## Notes

- The backend requires a reachable MongoDB instance.
- Frontend reminders use the browser Notification API, so notification delivery depends on browser permission.
