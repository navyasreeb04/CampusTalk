# CampusTalk

CampusTalk is a MERN web application for college students with three connected modules:

- CampusBoard: anonymous campus feed with likes, comments, trending, and MyFeed
- SkillMap: peer-to-peer learning posts with one-to-one chat
- PlacementPulse: anonymous placement experiences with comments and likes

It also includes an admin dashboard for placement counts, companies, and skill demand trends.

## Stack

- Frontend: React + Vite + CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT stored in localStorage
- API: Axios
- Icons: lucide-react

## Project Structure

```text
backend/
  controllers/
  middleware/
  models/
  routes/
frontend/
  src/
    api/
    components/
    pages/
    styles/
```

## Run Locally

1. Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Configure environment variables:

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env`

3. Start the backend:

```bash
cd backend
npm run dev
```

4. Start the frontend:

```bash
cd frontend
npm run dev
```

5. Open `http://localhost:5173`

## Notes

- The backend defaults to port `5001` to avoid a local port conflict discovered during setup.
- `ADMIN_EMAIL` controls which registered email becomes an admin account.
- If a local MongoDB server is unavailable, the backend can fall back to an in-memory MongoDB instance for development.
