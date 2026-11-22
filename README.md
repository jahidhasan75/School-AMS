# School AMS — School Teacher Attendance Management System

A digital school teacher attendance and leave management platform with GPS geofencing, QR code attendance, leave tracking, monthly reporting, and analytics.

---

## 🌟 Key Features

- **Teacher & Admin Portals:** Role-based dashboards with glassmorphism UI.
- **Attendance Tracking:**
  - Online manual check-in / check-out.
  - GPS-based geofence attendance verification (Haversine formula).
  - Dynamic QR code generation with expiring sessions and token verification.
  - Automatic late arrival calculation based on school office hours and grace periods.
  - Duplicate check-in and check-out protection.
- **Leave Management:**
  - Submit leave requests with reason and supporting document attachments.
  - Overlapping leave application guard.
  - Admin approval and rejection with admin remarks.
  - Automated in-app notifications on status changes.
- **Reports & Analytics:**
  - Daily, weekly, monthly, yearly, and departmental attendance reports.
  - Recharts attendance trend lines and status distributions.
- **Teacher Directory & Administration:**
  - Complete teacher CRUD (Add, View, Edit, Soft-delete, Password Reset).
  - Profile photo uploads with MIME/extension security checks.
- **School Configuration:**
  - Manage office start/end times, grace period, working hours, geofence radius, and weekend days.
- **Theme Support:**
  - Persistent Light and Dark themes.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS, Lucide React, Recharts, Axios, React Hot Toast.
- **Backend:** Node.js, Express.js, Sequelize ORM, JWT Authentication, Bcrypt, Multer, Helmet, CORS, Express Rate Limit.
- **Database:** MySQL 8.0+ / MariaDB.

---

## 📁 Repository Structure

```
school-ams/
├── backend/
│   ├── config/             # Sequelize database configuration
│   ├── controllers/        # Express route controllers (auth, teachers, attendance, qr, leaves, reports, etc.)
│   ├── middleware/         # JWT auth, error handling, rate limiting, and secure Multer upload
│   ├── migrations/         # 11 Sequelize migration files
│   ├── models/             # 12 Sequelize models with associations
│   ├── routes/             # REST API routes
│   ├── seeders/            # Idempotent demo data seeder
│   ├── services/           # GPS Haversine, QR generation, notifications
│   ├── utils/              # Date helpers, response wrappers, formatting
│   ├── app.js              # Express app setup
│   ├── server.js           # Server entrypoint (Port 5000)
│   └── .env.example        # Environment variable template
├── frontend/
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── components/     # UI components (charts, common, layout, notifications)
│   │   ├── context/        # AuthContext and ThemeContext
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Admin, Teacher, Auth, and Public pages
│   │   ├── routes/         # AppRoutes, ProtectedRoute, RoleRoute
│   │   ├── services/       # Axios API services
│   │   ├── utils/          # Date & formatting helpers
│   │   ├── App.jsx         # Root component
│   │   └── main.jsx        # App entry point
│   ├── index.html          # HTML entry template
│   ├── vite.config.js      # Vite build and proxy configuration
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── .env.example        # Frontend environment template
├── .gitignore              # Git ignore rules for node_modules, secrets, uploads, builds
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MySQL >= 8.0 or MariaDB
- Git

### 1. Clone Repository

```bash
git clone https://github.com/jahidhasan75/School-AMS.git
cd School-AMS
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` based on `backend/.env.example`:

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=school_ams
DB_USER=root
DB_PASS=
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:5173
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

### 3. Database Migration and Seeding

Create the MySQL database:
```sql
CREATE DATABASE school_ams CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run Sequelize migrations and seeders:
```bash
npm run migrate
npm run seed
```

Start the backend server:
```bash
npm run dev
# Backend API runs on http://localhost:5000
```

### 4. Frontend Setup

In a new terminal:
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

To build for production:
```bash
npm run build
```

---

## 🔑 Demo Credentials

- **Admin Account:**
  - Email: `admin@schoolams.demo`
  - Password: `Admin@123`
- **Teacher Account:**
  - Email: `teacher@schoolams.demo`
  - Password: `Teacher@123`

---

## 🛡️ Security Features

- **Hardened Upload Boundaries:** Category-specific Multer middleware (`uploadTeacherPhoto`, `uploadLeaveDocument`, `uploadSchoolLogo`) with dual MIME and extension whitelisting, file size limits, and randomized safe filenames.
- **IDOR Protection:** Multi-tenant checks prevent teachers from accessing other teachers' profile and attendance data.
- **Security Headers & Rate Limiting:** Helmet HTTP security headers and Express rate limiting on API and authentication routes.
- **Password Protection:** Bcrypt hashing with salt rounds of 12 and scoped credential exclusions from general queries.

---

## 📄 License

This project is licensed under the MIT License.
