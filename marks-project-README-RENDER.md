# Render deployment notes for Marks Project

This repo contains two services: `marks-backend` and `marks-client`.

## Backend (marks-backend)
- Build command: `npm install`
- Start command: `npm start`
- Environment variables to set on Render:
  - `MONGODB_URI` = your MongoDB connection string
  - `ADMIN_USER` (optional) default: admin
  - `ADMIN_PASS` (optional) default: admin123
  - `JWT_SECRET` (recommended to change)

## Frontend (marks-client)
- Build command: `npm install && npm run build`
- Start command: `serve -s build` (or use static site hosting)
- If you host frontend separately, set API base URLs accordingly. By default the client uses relative `/api` paths so hosting behind the same domain is easiest.

## Notes
- Admin login now returns a JWT used to protect the `/api/upload` route.
- Student passwords are hashed using bcrypt when importing the Excel file; students should still login with their roll number as both username and password.
