# CampusTalk

A full-stack campus engagement platform built using the MERN stack that combines:

- Anonymous student social interaction
- Peer-to-peer skill exchange
- Placement experience sharing and analytics

CampusTalk was designed to solve a common campus problem: students usually have information, opportunities, and peer support scattered across WhatsApp groups, clubs, placement cells, and informal circles. This platform brings them into one structured ecosystem.

---

## Core Modules

## 1. CampusBoard (Ajiogram)

An anonymous campus social feed where students can:

- Create text/image posts
- Like and comment on posts
- View trending campus discussions
- Maintain a private personal feed

### Features
- Anonymous identity for public posts
- Image upload support
- Persistent comments
- Trending algorithm based on engagement + recency
- Light / Dark theme support

---

## 2. SkillMap

A peer learning module where students can:

- Post what they know
- Post what they want to learn
- Connect with other students
- Start one-to-one discussions

### Features
- Skill matchmaking
- Real-time chat architecture
- Skill demand analytics for admin

---

## 3. PlacementPulse

A placement discussion and analytics platform where students can share:

- Company details
- Salary / package
- Online assessment experience
- Interview rounds
- Preparation strategies

### Features
- Anonymous discussion threads
- Comment system
- Placement analytics dashboard

---

## Admin Dashboard

Admins / placement coordinators can monitor:

- Most requested skills
- Most offered skills
- Internship vs full-time statistics
- Placement trends

### Dashboard Features
- Animated pie charts
- Dynamic bar charts
- Case-insensitive skill aggregation
- Responsive analytics layout

---

## Authentication & Security

CampusTalk includes:

- Email/password authentication
- JWT-based session management
- OTP-based password reset
- Role-based access control

### Access Rules
- Students can access all student modules
- Admins can access analytics/dashboard
- Admins cannot access anonymous CampusBoard

---

## Tech Stack

### Frontend
- React (Vite)
- CSS
- Axios
- React Router
- Recharts
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer (image uploads)

### Optional Integrations
- Twilio (SMS OTP)
- Nodemailer (Email OTP)

---

## Project Structure

```bash
CampusTalk/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── App.jsx
│
├── server/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   └── server.js
```

---

## Local Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd CampusTalk
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

Run backend:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## Current Implementation Status

### Completed
- Authentication system
- OTP password reset
- Profile management
- Theme switching
- Image uploads
- Comments and likes
- Dashboard analytics

### Planned Improvements
- Real-time chat using Socket.io
- Video collaboration rooms
- Push notifications
- Cloud image storage

---

## Engineering Focus

This project was built with emphasis on:

- Clean modular architecture
- Role-based access control
- User experience and interaction design
- Real-world product thinking
- Scalable backend design

---

## Author

Built by Navya as part of full-stack product engineering practice.
