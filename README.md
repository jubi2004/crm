# Mini CRM — MERN Stack

A full-stack CRM application built with MongoDB, Express, React, and Node.js.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, MUI v5, TanStack Query, Axios |
| Backend | Node.js, Express.js, Mongoose |
| Auth | JWT (Access Token), bcryptjs |
| Database | MongoDB |

---

## Project Structure

```
mini-crm/
├── backend/          # Express API
│   └── src/
│       ├── index.js
│       ├── config/db.js
│       ├── middleware/auth.js
│       ├── models/         # User, Lead, Company, Task
│       └── routes/         # auth, users, leads, companies, tasks, dashboard
└── frontend/         # React SPA
    └── src/
        ├── App.jsx
        ├── api/            # axios instance + service functions
        ├── context/        # AuthContext
        ├── components/     # Layout, StatusChip, LeadFormDialog, PrivateRoute
        ├── pages/          # Login, Dashboard, Leads, Companies, Tasks
        └── theme/          # MUI theme
```

---

## Setup & Running Locally

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: fill in MONGO_URI and JWT_SECRET
npm install
npm run dev
# Runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
# Proxied to backend via package.json "proxy" field
```

### 3. Create your first user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@example.com","password":"password123","role":"admin"}'
```

---

## API Reference

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Get current user |

### Leads
| Method | Route | Description |
|---|---|---|
| GET | `/api/leads?page=1&limit=10&search=&status=` | List with pagination/filter |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Soft delete (sets isDeleted=true) |

### Companies
| Method | Route | Description |
|---|---|---|
| GET | `/api/companies` | List all companies |
| POST | `/api/companies` | Create company |
| GET | `/api/companies/:id` | Company + associated leads |
| PUT | `/api/companies/:id` | Update company |

### Tasks
| Method | Route | Description |
|---|---|---|
| GET | `/api/tasks` | List with pagination |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task (status update requires assignee) |
| PATCH | `/api/tasks/:id/status` | Status-only update (assignee only) |
| DELETE | `/api/tasks/:id` | Delete task |

### Dashboard
| Method | Route | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | totalLeads, qualifiedLeads, tasksDueToday, completedTasks |

---

## Authorization Logic

### JWT Authentication
Every protected route requires `Authorization: Bearer <token>` header. The `protect` middleware verifies the token and attaches `req.user`.

### Task Status Authorization
```js
// tasks route — PATCH /:id/status
if (task.assignedTo.toString() !== req.user._id.toString()) {
  return res.status(403).json({ message: 'Only the assigned user can update task status' });
}
```
Only the user the task is assigned to can change its status. Other users get a `403 Forbidden`.

### Soft Delete
The `Lead` model uses a Mongoose query middleware hook:
```js
leadSchema.pre(/^find/, function (next) {
  if (this._conditions.isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
  next();
});
```
Deleted leads are invisible to all standard queries without any extra filtering code in routes.

---

## Deployment

### Backend (Render / Railway)
1. Push to GitHub
2. Create a new Web Service
3. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT`
4. Build command: `npm install` | Start: `npm start`

### Frontend (Netlify)
1. Set `REACT_APP_API_URL=https://your-backend-url.com/api` in Netlify env vars
2. Build command: `npm run build`
3. Publish directory: `build`
4. Add `_redirects` file in `public/`:
   ```
   /*  /index.html  200
   ```
