# 🍽️ SmartMeal: AI-Based College Meal Pre-Booking and Management System

> **Book Your Meal. Pay Online. Collect on Time.**  
> An enterprise-grade, full-stack pre-booking and mess management web application designed for Anurag University students and canteen administrators.

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.1-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python%203.10%2B-teal.svg)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Tests](https://img.shields.io/badge/Tests-5%2F5%20Passing-success.svg)]()

---

## 🚀 Live Deployment

### 🌐 Frontend Application
- **Live URL**: Pending verification / deployment (Candidate: [https://smartmeal-frontend.vercel.app](https://smartmeal-frontend.vercel.app) — *Currently serving an unrelated application. Must be connected to this repository and deployed via Vercel with root directory set to `frontend`*).

### ⚙️ Backend API
- **API URL**: [https://smartmeal-backend-l5xs.onrender.com](https://smartmeal-backend-l5xs.onrender.com) (*Pending live verification; service is currently suspended or spinning up on Render*).

### 🩺 Backend Health Check
- **Health Check Endpoint**: [https://smartmeal-backend-l5xs.onrender.com/api/health](https://smartmeal-backend-l5xs.onrender.com/api/health) (*Pending live response; timed out during audit*).

### 💻 Source Code
- **GitHub Repository**: [https://github.com/mehermadhuri/SmartMeal](https://github.com/mehermadhuri/SmartMeal) (Branch: `master`)

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
  - [Student Experience](#student-experience)
  - [Admin Management](#admin-management)
  - [AI Demand Forecasting](#ai-demand-forecasting)
- [System Architecture & Flow](#-system-architecture--flow)
- [Technology Stack](#-technology-stack)
- [Local Setup & Installation](#-local-setup--installation)
- [Environment Variables](#-environment-variables)
- [Testing & Verification](#-testing--verification)
- [Cloud Deployment Guide](#-cloud-deployment-guide)
  - [1. Cloud MySQL Database (Aiven / TiDB)](#1-cloud-mysql-database)
  - [2. Backend Deployment (Render / Railway)](#2-backend-deployment)
  - [3. Frontend Deployment (Vercel / Netlify)](#3-frontend-deployment)
  - [4. AI Service Deployment](#4-ai-service-deployment)
- [API Reference](#-api-reference)
- [Safety & Payment Limitations](#-safety--payment-limitations)
- [Author & Academic Disclaimer](#-author--academic-disclaimer)

---

## 🎯 Project Overview

College canteens face severe rush during lunch and tiffin hours, leading to long queues, delayed food pickup, and high food wastage due to unpredictable preparation quantities.

**SmartMeal** solves this by introducing:
1. **Time-Windowed Pre-Booking**: Students book meals during scheduled windows before cooking begins (Tiffin: 8:00 AM – 10:00 AM, Lunch: 11:30 AM – 2:00 PM).
2. **Pickup Slot Scheduling**: Orders are tied to specific pickup time slots (e.g., *08:00 AM - 09:00 AM*, *12:45 PM - 02:00 PM*), staggering foot traffic at pickup counters.
3. **Multi-Option Demo Checkout**: Supports simulated UPI payments, simulated test card payments, and *Pay at Canteen Counter*.
4. **Digital Printable Bill/Receipt**: Browser-printable official receipts featuring Anurag University Canteen branding, itemization, and order timestamps.
5. **AI Demand Prediction**: Machine learning microservice forecasting meal demand using a Random Forest model to minimize mess wastage.

---

## ✅ Key Features

### Student Experience
- **Authentication**: Registration and login with BCrypt password hashing and 24-hour stateless JWT tokens.
- **Menu Browsing**: Filter items by Tiffin and Lunch with real-time availability badges and stock tracking.
- **Interactive Cart**: Quantity increments, individual item pricing, subtotal, and pickup slot selection.
- **Review & Checkout**: Itemized order summary with server-side trusted price calculation and multi-click duplicate-order protection.
- **Flexible Payment Methods**:
  - ⚡ **UPI (QR & Intent)**: Anurag University Canteen VPA (`anuragcanteen@upi`), QR preview, and 1-click simulation or manual UTR reference submission.
  - 💳 **Debit / Credit Card (Demo)**: Safe test simulator (no real financial card data collected or stored).
  - 🏬 **Pay at Canteen Counter**: Meal is confirmed immediately for kitchen preparation while payment status remains *PENDING* until collected.
- **Printable Bill & Receipt**: Clean browser printing (`Ctrl + P` / 1-click button) with hidden UI elements, showing order ID, IST date/time, student info, itemization, subtotal, total, and payment status.
- **My Orders**: Reopen any past receipt or execute pending payments directly from order history.

### Admin Management
- **Dashboard Metrics**: Real-time summary of today's orders, revenue, paid orders, and pending payments.
- **Booking Window Control**: Toggle test overrides to allow testing outside normal operating hours.
- **Menu Management**: Full CRUD operations to add, update pricing, change availability, and delete menu items.
- **Order Tracking**: Live table of all student orders with one-click status transitions (`CONFIRMED` → `PREPARING` → `READY_FOR_PICKUP` → `COLLECTED`).
- **Payment Verification**: Verify counter payments and audit transactions.

### AI Demand Forecasting
- **RandomForestRegressor Model**: Forecasts expected meal quantities based on day-of-week, meal category, slot time, and weekend factors.
- **Recommended Safety Buffer**: Computes an optimal +8% preparation buffer to prevent food shortages.
- **Calibrated Heuristic Fallback**: Ensures uninterrupted predictions even if historical samples are limited.

### Implementation Status

| Feature | Current status |
|---|---|
| Student registration and login | Email/password-only registration and login are implemented with BCrypt and JWT; registration does not require OTP or profile fields. |
| Daily menu | Partially implemented: the initializer seeds Tiffin and Lunch once when the menu table is empty; daily refresh and Breakfast/Snacks/Dinner menus are not implemented. |
| Pickup slots | Implemented for seeded Tiffin and Lunch slots. |
| Booking history | Implemented as the student's order history. |
| Booking modification | Not implemented. |
| Cancellation cutoff | Cancellation exists, but no configured time cutoff is enforced. |
| Admin order/menu operations | Implemented behind the admin role. |
| Demand estimation | Implemented as a demo prediction flow using synthetic historical data and a heuristic fallback; it is not trained on production booking history. |
| Live Vercel/Render integration | Not verified; the current public Vercel candidate serves a different app and the Render health check timed out. |

---

## 🏛️ System Architecture & Flow

```
[ Anurag Student / Browser ]
         │
         ▼
[ React 19 + Vite Frontend ] (Vercel / Netlify / Local port 5173)
         │  REST / JWT
         ▼
[ Spring Boot 4 Backend ] (Render / Railway / Local port 8081)
   ├── SecurityConfig & JwtAuthFilter
   ├── OrderService (Trusted price computation & Duplicate prevention)
   ├── BookingWindowService (IST Timezone enforcement)
   └── PaymentService (UPI / Card Demo / Pay-at-Counter transitions)
         │                           │
         ▼                           ▼
[ MySQL Database ]          [ Python FastAPI AI Service ] (Port 8000)
(Local or Cloud Aiven)       (RandomForest Demand Forecaster)
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, Vite 8, React Router 7, Lucide Icons | Responsive Student & Admin Single Page Application |
| **Backend** | Java 17, Spring Boot 4.1.1, Spring Security 7, Spring Data JPA | Secure RESTful API, Business Logic, Transaction Management |
| **Database** | MySQL 8.0 (Local / Aiven Cloud / TiDB) | Persistent relational storage for users, orders, menus, and payments |
| **Authentication** | JWT (`io.jsonwebtoken:jjwt`), BCrypt | Stateless bearer authentication and role-based authorization |
| **AI Microservice** | Python 3.14, FastAPI, scikit-learn, pandas, numpy | Canteen demand prediction and wastage mitigation |
| **DevOps** | Multi-stage Docker, Docker Compose, Netlify TOML, Render YAML | Containerization and push-to-deploy cloud configurations |

---

## 🚀 Local Setup & Installation

### 1. Prerequisites
- **Java 17+** (Eclipse Temurin JDK 17 recommended)
- **Node.js 20+** & npm
- **Python 3.10+**
- **MySQL 8.0+** running locally on port `3306`

### 2. Clone the Repository
```bash
git clone https://github.com/mehermadhuri/SmartMeal.git
cd SmartMeal
```

### 3. Database Configuration
Ensure MySQL is running and set local credentials and a private JWT secret in the current PowerShell session:
```powershell
# Windows PowerShell (replace placeholders; do not commit these values):
$env:DB_URL="jdbc:mysql://localhost:3306/smartmeal?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata"
$env:DB_USERNAME="<your_mysql_username>"
$env:DB_PASSWORD="<your_mysql_password>"
$env:JWT_SECRET="<at-least-32-random-bytes>"
```

To bootstrap an administrator, also set `ADMIN_EMAIL` and `ADMIN_PASSWORD` as private environment variables before starting the backend. When configured, the initializer sets the selected account's role to admin and applies the configured password on startup. Without them, the application does not create a default administrator. Registration always creates student accounts.

### 4. Run the Backend (Spring Boot — Port 8081)
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
*The database schema, sample menus, slots, and synthetic sample predictions are initialized on startup. Existing records are not deleted.*

### 5. Run the Frontend (React Vite — Port 5173)
```powershell
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 6. Run the AI Microservice (FastAPI — Port 8000)
```powershell
cd ai-service
py -m venv .venv
.\.venv\Scripts\activate
python -m pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```
Health endpoint: `http://localhost:8000/`

---

## ⚙️ Environment Variables

### Backend (`application.properties` / Cloud environment)
| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP port assigned by cloud host | `8081` |
| `DB_URL` | JDBC URL for MySQL | `jdbc:mysql://localhost:3306/smartmeal...` |
| `DB_USERNAME` | Database username | Required |
| `DB_PASSWORD` | Database password | Required |
| `JWT_SECRET` | Secret key for signing tokens (at least 32 bytes) | Required; no built-in key |
| `JWT_EXPIRATION` | Token expiry in milliseconds | `86400000` (24 hours) |
| `AI_SERVICE_URL` | URL of the Python AI microservice | `http://localhost:8000` |
| `ADMIN_EMAIL` | Optional administrator bootstrap email | Unset; no default admin |
| `ADMIN_PASSWORD` | Optional administrator bootstrap password | Unset; no default password |
| `ALLOWED_ORIGINS` | Comma-separated exact browser origins allowed by CORS | `http://localhost:5173,http://localhost:3000` |

### Frontend (`frontend/.env` / Cloud environment)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Optional direct base URL override for the deployed Spring Boot backend | Empty (`/api`; Vercel proxies API requests to the Render backend) |

---

## 🧪 Testing & Verification

### 1. Backend Integration Tests (Java / Spring Boot)
```powershell
cd backend
.\mvnw.cmd test
```
**Audit verification:** Backend tests passed (6/6) and the production JAR packaged successfully on Java 17. The current auth integration tests also verify email/password-only registration followed by login.
- `AuthIntegrationTests` (2/2): Validates student registration (including email/password-only registration), duplicate prevention, BCrypt hashing, JWT generation, invalid credential rejection, unauthorized access barriers, and student role restrictions on admin APIs.
- `OrderAndPaymentIntegrationTests` (3/3):
  1. `testPublicHealthAndMenus`: Public `/api/health`, `/api/menus/available`, and `/api/slots`.
  2. `testOrderCreationAndPaymentFlows`: Order placement, server price calculation, duplicate order reuse, and card simulation.
  3. `testPayAtCanteenFlow`: Pay-at-canteen status transitions (`OrderStatus.CONFIRMED` with `PaymentStatus.PENDING`).
- `SmartMealApplicationTests` (1/1): Context boot and bean dependency graph.
- Backend tests use a disposable in-memory H2 database and do not connect to the configured MySQL database.

### 2. Frontend Production Build (React / Vite)
```powershell
cd frontend
npm run build
```
**Audit result:** Production build passed (1,944 modules transformed, 0 errors). `npm run lint` also exited successfully; existing React hook and fast-refresh warnings remain.

### 3. AI Service Tests (Python)
```powershell
cd ai-service
.\.venv\Scripts\python.exe test_ai_service.py
```
**Audit result:** All AI service tests passed (3/3).

---

## ☁️ Cloud Deployment Guide

### 1. Cloud MySQL Database
Deploy to a persistent cloud MySQL provider:
- **Aiven for MySQL** (Recommended free tier, 5 GB storage, automatic SSL):
  1. Sign up at [aiven.io](https://aiven.io) and create a free MySQL service named `smartmeal-db`.
  2. Copy Service URI (`mysql://avnadmin:password@host:port/defaultdb?ssl-mode=REQUIRED`).
  3. Format as JDBC URL:
     ```
     jdbc:mysql://<host>:<port>/defaultdb?useSSL=true&requireSSL=true&serverTimezone=Asia/Kolkata
     ```
- **TiDB Cloud Serverless** (Free 5 GB storage, 100% MySQL 8.0 compatible, no credit card required at [tidbcloud.com](https://tidbcloud.com)).

### 2. Backend Deployment
Deploy the Spring Boot service to **Render** or **Railway**:
- **Option A — Render Web Service**:
  1. Connect your GitHub repository at [dashboard.render.com](https://dashboard.render.com).
  2. Apply `render.yaml` from the repository root. The backend Docker service uses `backend/Dockerfile` with `backend` as its build context.
  3. Set environment variables:
     - `PORT`: `8080`
     - `DB_URL`: `<your-cloud-mysql-jdbc-url>`
     - `DB_USERNAME`: `<your-db-username>`
     - `DB_PASSWORD`: `<your-db-password>`
     - `JWT_SECRET`: `<generated-random-secret-of-at-least-32-bytes>`
     - `ADMIN_EMAIL` and `ADMIN_PASSWORD`: private administrator bootstrap values, if needed.
     - `AI_SERVICE_URL`: private URL of the `smartmeal-ai` Render service.
     - `ALLOWED_ORIGINS`: exact verified Vercel origin (for example, `https://<your-project>.vercel.app`).
  4. Health check path: `/api/health`.
  5. Before deploying over an existing database, verify and safely backfill `meal_slots.menu_id` for existing rows. The production schema and data were not accessible during this audit, so this required-column migration has not been verified.

### 3. Frontend Deployment
Deploy the React single page application to **Vercel** or **Netlify**:
- **Option A — Vercel**:
  1. Import GitHub repository `mehermadhuri/SmartMeal` on [vercel.com](https://vercel.com).
  2. Root directory: `frontend`.
  3. Framework Preset: `Vite`.
  4. `frontend/vercel.json` sends `/api/*` requests to the configured Render backend and handles client-side routing. Set `VITE_API_BASE_URL` only if using a different backend; the client adds `/api` unless it is already present.
  5. Ensure Render's `ALLOWED_ORIGINS` includes the deployed Vercel site's exact origin, and verify the Render health endpoint before testing login.
- **Option B — Netlify**:
  1. Connect GitHub repo on [netlify.com](https://netlify.com).
  2. Build command: `npm run build`, Publish directory: `frontend/dist`.
  3. Netlify automatically reads `netlify.toml` for single-page routing rewrites.
  4. Set `VITE_API_BASE_URL` to the verified backend base URL (without `/api`, or with `/api`); Netlify does not use Vercel's API rewrite.

### 4. AI Service Deployment
- The Render blueprint in `render.yaml` defines the `smartmeal-ai` service and sets the backend's `AI_SERVICE_URL` to its private service URL.
- If deployed separately, set `AI_SERVICE_URL` to the reachable base URL of the FastAPI service.

---

## 📡 API Reference

### Public Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Public application and database readiness probe (503 when the database is unavailable) |
| `POST` | `/api/auth/register` | Register new student account |
| `POST` | `/api/auth/login` | Login and obtain JWT token |
| `GET` | `/api/menus/available` | Browse available menu items |
| `GET` | `/api/slots` | List meal pickup slots |

### Student Endpoints (Bearer Token Required)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `POST` | `/api/orders` | Create an order (protected against duplicate submissions) |
| `GET` | `/api/orders/my` | View authenticated student's orders |
| `GET` | `/api/orders/{id}` | View specific order & bill details |
| `POST` | `/api/orders/{id}/cancel` | Cancel order & restore inventory stock |
| `POST` | `/api/payments/initiate` | Generate payment record & UPI intent |
| `POST` | `/api/payments/{id}/simulate-success` | Simulate successful UPI payment |
| `POST` | `/api/payments/{id}/simulate-card` | Simulate successful card payment |
| `POST` | `/api/payments/{id}/pay-at-canteen` | Confirm order with payment due at counter |
| `POST` | `/api/payments/{id}/submit-proof` | Submit manual 12-digit UPI UTR reference |

### Admin Endpoints (`ROLE_ADMIN` Required)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/dashboard` | Canteen metrics (revenue, orders, active items) |
| `GET` | `/api/admin/orders` | View & filter all student orders |
| `PUT` | `/api/admin/orders/{id}/status` | Update preparation & collection status |
| `POST` | `/api/admin/menus` | Create new menu item |
| `PUT` | `/api/admin/menus/{id}` | Edit existing menu item |
| `DELETE` | `/api/admin/menus/{id}` | Remove menu item |
| `GET` | `/api/admin/settings/window-status` | Check booking window open/close state |
| `POST` | `/api/admin/settings/override-hours` | Toggle administrative test override |

---

## 🔐 Safety & Payment Limitations

1. **Simulated Demo Payments**: All UPI and card payments in this application are **safe demonstration simulations**. No real money is transferred and no real debit/credit card credentials or CVVs are collected or stored.
2. **Pay at Canteen Counter**: Orders placed with *Pay at Canteen* are set to `OrderStatus.CONFIRMED` so the kitchen can begin preparation, while `PaymentStatus` remains `PENDING` until cash or counter UPI is verified upon physical food pickup.
3. **Server-Side Price Security**: Order subtotal and grand total are calculated server-side from database menu records, preventing frontend client-side price manipulation.
4. **Duplicate Prevention**: The backend reuses existing uncompleted pending orders placed within the last 10 minutes with matching items, preventing double deductions from inventory.

---

## 👩‍💻 Author & Academic Disclaimer

**K MEHER MADHURI**  
Department of Computer Science & Engineering  
**Anurag University**, Hyderabad, Telangana, India  
GitHub: [https://github.com/mehermadhuri](https://github.com/mehermadhuri)

> *SmartMeal is an academic demonstration project for meal pre-booking and canteen management.*
