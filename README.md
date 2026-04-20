# 🛡️ SysCall — User-Friendly System Call Interface for Enhanced Security

A full-stack web application that simulates OS-level system calls with a secure, role-based access control system, detailed audit logging, and a modern SaaS-style dashboard UI.

> Built by **Arvika Tech**

---

## 📸 Features At a Glance

| Feature | Details |
|---|---|
| 🔐 **Authentication** | JWT Bearer tokens, bcrypt-hashed passwords, 8h expiry |
| 👥 **Role-Based Access** | Admin (full access) / User (restricted) |
| 🖥️ **System Calls** | File Read, File Write, Process Create, Process Kill, Memory Alloc, Network Socket |
| 📋 **Audit Logs** | Every action logged with user, action, status, timestamp |
| 🚦 **Rate Limiting** | 10 logins/15min · 20 syscalls/min · 100 API req/15min |
| 📊 **Dashboard** | Live stats, bar chart, success rate, activity feed |
| 🌙 **Dark / Light Mode** | Persisted to localStorage |
| 🔔 **Notifications** | Toast alerts for all events |
| 🔍 **Log Filtering** | Search, filter by status/action/user, pagination |

---

## 🗂️ Project Structure

```
syscall-app/
├── backend/
│   ├── server.js                  # Express entry point
│   ├── package.json
│   ├── routes/
│   │   ├── auth.js                # POST /auth/login, GET /auth/me
│   │   ├── syscalls.js            # GET /system-calls, POST /system-calls/execute
│   │   └── logs.js                # GET /logs, DELETE /logs
│   ├── controllers/
│   │   ├── authController.js      # Login logic, JWT signing
│   │   ├── syscallController.js   # Permission check, simulate calls, log writes
│   │   └── logsController.js      # Fetch + filter + clear logs
│   ├── middleware/
│   │   ├── auth.js                # JWT verify middleware, requireAdmin
│   │   ├── rateLimiter.js         # express-rate-limit configs
│   │   └── db.js                  # JSON file read/write helpers
│   └── data/
│       ├── users.json             # User accounts (bcrypt passwords)
│       ├── logs.json              # Audit log store
│       └── systemCalls.json       # System call definitions
│
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── index.js               # React entry
        ├── App.js                 # Router + providers
        ├── index.css              # Tailwind + custom animations
        ├── context/
        │   ├── AuthContext.js     # Auth state, login/logout
        │   └── ThemeContext.js    # Dark/light mode
        ├── components/
        │   ├── Layout.js          # App shell with sidebar + outlet
        │   ├── Sidebar.js         # Navigation, user info, theme toggle
        │   ├── StatCard.js        # Reusable metric card
        │   └── ProtectedRoute.js  # Auth guard
        ├── pages/
        │   ├── LoginPage.js       # Login form with demo credentials
        │   ├── DashboardPage.js   # Stats, chart, activity feed
        │   ├── SystemCallsPage.js # System call cards with forms
        │   ├── LogsPage.js        # Filterable audit log table
        │   └── SettingsPage.js    # Account info + system config
        └── services/
            └── api.js             # Axios instance + all API calls
```

---

## 🚀 Setup & Run

### Prerequisites

- **Node.js** v16–v20 recommended (v18 LTS is ideal)
- **npm** v8+

> ⚠️ If using Node.js v22+, see the compatibility note below.

---

### 1. Clone / Extract the Project

```bash
cd syscall-app
```

### 2. Start the Backend

```bash
cd backend
npm install
node server.js
```

Backend runs at → **http://localhost:5000**

You should see:
```
🚀 SysCall Backend running at http://localhost:5000
📂 API Base: http://localhost:5000/api
🔐 Default credentials: admin/password | user/password
```

### 3. Start the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

Frontend runs at → **http://localhost:3000**

> The frontend proxies `/api` requests to `localhost:5000` automatically (configured in `package.json`).

---

### Node.js v22 Compatibility Fix

If you're on Node.js v22, run this before `npm start`:

```bash
# Linux / macOS
export NODE_OPTIONS=--openssl-legacy-provider
npm start

# Windows CMD
set NODE_OPTIONS=--openssl-legacy-provider
npm start

# Windows PowerShell
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm start
```

Or switch to Node 18 using nvm:
```bash
nvm install 18
nvm use 18
npm start
```

---

## 🔐 Demo Credentials

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `admin`  | `password` | Admin | All system calls + Delete logs |
| `user`   | `password` | User  | File Read/Write, Process Create, Memory Alloc |

---

## 🌐 API Reference

All API endpoints are prefixed with `/api`.

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | ❌ | Login, returns JWT token |
| `GET`  | `/auth/me`    | ✅ | Get current user from token |

**Login Request:**
```json
POST /api/auth/login
{
  "username": "admin",
  "password": "password"
}
```

**Login Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": { "id": "1", "username": "admin", "role": "admin", "displayName": "Administrator" }
}
```

### System Calls

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/system-calls`          | ✅ | List all system calls with role access flag |
| `POST` | `/system-calls/execute`  | ✅ | Execute a system call |

**Execute Request:**
```json
POST /api/system-calls/execute
Authorization: Bearer <token>

{
  "syscallKey": "FILE_READ",
  "params": { "path": "/var/data/sample.txt" }
}
```

**Available `syscallKey` values:**
- `FILE_READ` — params: `path`
- `FILE_WRITE` — params: `path`, `content`
- `PROCESS_CREATE` — params: `processName`, `priority`
- `PROCESS_KILL` — params: `pid` *(admin only)*
- `MEMORY_ALLOC` — params: `size`
- `NETWORK_SOCKET` — params: `host`, `port` *(admin only)*

### Logs

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET`    | `/logs` | ✅ | Any  | Fetch logs with optional filters |
| `DELETE` | `/logs` | ✅ | Admin | Clear all logs |

**Logs Query Params:**
```
GET /api/logs?search=admin&status=FAILED&action=FILE_READ&limit=20&offset=0
```

---

## 🗄️ JSON Database Schema

### `data/users.json`
```json
[
  {
    "id": "1",
    "username": "admin",
    "password": "<bcrypt hash>",
    "role": "admin",
    "displayName": "Administrator",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### `data/logs.json`
```json
[
  {
    "id": "uuid-v4",
    "userId": "1",
    "username": "admin",
    "role": "admin",
    "action": "FILE_READ",
    "params": { "path": "/var/data/sample.txt" },
    "status": "SUCCESS",
    "error": null,
    "result": "{\"path\":\"/var/data/sample.txt\",...}",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
]
```

### `data/systemCalls.json`
```json
[
  {
    "id": "sc_1",
    "name": "File Read",
    "key": "FILE_READ",
    "description": "Read contents from a virtual file system path",
    "icon": "file-text",
    "allowedRoles": ["admin", "user"],
    "params": [
      { "name": "path", "type": "text", "label": "File Path", "required": true }
    ],
    "color": "blue"
  }
]
```

---

## 🔒 Security Implementation

### JWT Authentication
- Tokens signed with `HS256` algorithm
- 8-hour expiry
- Auto-redirect to `/login` on 401 responses
- Stored in `localStorage` (client-side)

### Password Security
- bcrypt with 10 salt rounds
- Input sanitization (strips non-alphanumeric chars)
- Rate-limited login: **10 attempts per 15 minutes**

### Role-Based Access Control
- Each system call defines `allowedRoles: ["admin"] | ["admin", "user"]`
- Backend enforces RBAC before execution
- Frontend shows locked state for restricted calls

### Rate Limiting
```
Auth endpoints:     10 req / 15 min
System call exec:   20 req / 1 min
All API routes:    100 req / 15 min
```

### Input Validation
- Request body size limited to 10KB
- Required params validated per system call definition
- Username sanitized (alphanumeric + underscore only)
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`

---

## 🎨 UI Design

- **Font**: JetBrains Mono (terminal/code) + Space Grotesk (UI)
- **Theme**: Dark-first with full light mode support
- **Colors**: Indigo primary, semantic status colors (green/red)
- **Components**: Card-based, rounded-2xl, glassmorphism borders
- **Animations**: Fade-in, slide-in, pulse glow, cursor blink
- **Charts**: Chart.js via react-chartjs-2 (Bar chart)
- **Notifications**: react-hot-toast (top-right, dark themed)

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + React Router v6 |
| Styling | Tailwind CSS v3 |
| HTTP Client | Axios |
| Charts | Chart.js + react-chartjs-2 |
| Icons | Lucide React |
| Toasts | react-hot-toast |
| Backend | Node.js + Express.js |
| Auth | JSON Web Tokens (jsonwebtoken) |
| Passwords | bcryptjs |
| Rate Limiting | express-rate-limit |
| IDs | uuid v4 |
| Database | JSON files (fs module) |

---

## 🔧 Adding New System Calls

1. Add entry to `backend/data/systemCalls.json`
2. Add a `case` in `simulateExecution()` in `syscallController.js`
3. The frontend auto-discovers new calls via the API

---

## 📝 License

© 2024 Arvika Tech. All rights reserved.
