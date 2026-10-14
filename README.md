# 🍽️ SmartMeal: AI-Based College Meal Pre-Booking and Management System

> **Book Your Meal. Pay Online. Collect on Time.**

SmartMeal is a full-stack web application built for Anurag University students to pre-book canteen meals online before the booking deadline, select pickup slots, complete payment, and receive a digital receipt. The admin panel enables canteen staff to manage the menu, track orders, and view AI-generated demand predictions to reduce food wastage.

---

## 📋 Table of Contents
- [Problem Statement](#problem-statement)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup & Installation](#local-setup--installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Docker](#docker)
- [Security Notes](#security-notes)

---

## 🎯 Problem Statement

College canteens face two major challenges every day:
1. **Overcrowding and long queues** — students rush to the canteen without prior booking.
2. **Food wastage and shortages** — the canteen cannot accurately predict demand for each meal.

SmartMeal solves both problems by enabling advance meal booking with online payment, giving the canteen exact demand numbers before cooking begins.

---

## ✅ Features

### Student Features
- Register with name, email, phone, roll number, department, and year
- Secure login with JWT authentication
- Browse daily menu by category (Tiffin / Lunch)
- Add items to cart with quantity control
- Place orders before the booking deadline
- Online payment simulation (UPI demo)
- View booking confirmation and printable receipt
- Order history with cancel option
- Personal profile page

### Admin Features
- Secure admin-only dashboard
- View today's orders, revenue, and pending payments
- Add, edit, disable, and delete menu items
- Update order statuses (Pending → Confirmed → Ready → Completed)
- Monitor booking window status (Tiffin / Lunch / General)
- Enable test override to allow orders outside normal hours (development)
- View AI demand predictions

### AI Features
- Python FastAPI microservice for meal demand forecasting
- RandomForest model trained on synthetic historical booking data
- Predictions for each menu item by category
- Graceful fallback when data is insufficient
- Clearly labeled as sample predictions

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, React Router DOM 7, Lucide React |
| Backend | Java 17, Spring Boot 4.1.1, Spring Security 7, Spring Data JPA |
| Database | MySQL (local or Aiven Cloud) |
| Authentication | JWT (jjwt 0.12.6), BCrypt |
| AI Service | Python 3.14, FastAPI, scikit-learn, pandas, RandomForestRegressor |
| Containerization | Docker, Docker Compose |
| Version Control | Git, GitHub |

---

## 📁 Project Structure

```
SmartMeal/
├── backend/                   # Spring Boot Java backend
│   ├── src/main/java/com/smartmeal/
│   │   ├── config/            # DataInitializer (seeds demo data)
│   │   ├── controller/        # REST API controllers
│   │   ├── dto/               # Request/Response data objects
│   │   ├── entity/            # JPA entities & enums
│   │   ├── exception/         # Global exception handler
│   │   ├── repository/        # Spring Data repositories
│   │   ├── security/          # JWT filter, SecurityConfig
│   │   └── service/           # Business logic
│   └── src/main/resources/
│       └── application.properties
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/               # API service layer
│   │   ├── components/        # Navbar, FoodCard, ProtectedRoute
│   │   ├── context/           # AuthContext, CartContext
│   │   └── pages/             # All page components
│   └── vite.config.js         # Dev proxy → backend:8081
├── ai-service/                # Python FastAPI AI microservice
│   └── app/
│       ├── main.py            # FastAPI endpoints
│       └── model.py           # RandomForest demand predictor
├── docker-compose.yml
├── .env.example               # Environment variable template
├── .gitignore
└── README.md
```

---

## 🔧 Prerequisites

- **Java 17** (Eclipse Temurin recommended)
- **Maven 3.9+** (or use the bundled `mvnw`)
- **Node.js 20+** and npm 10+
- **Python 3.10+** and pip
- **MySQL 8** (local) OR an Aiven Cloud MySQL connection
- Git

---

## 🚀 Local Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/mehermadhuri/smartmeal.git
cd smartmeal
```

### 2. Set up the database
Create the MySQL database (the app auto-creates it on first run with `createDatabaseIfNotExist=true`):
```sql
CREATE DATABASE IF NOT EXISTS smartmeal;
```

### 3. Set environment variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Then set them in your shell (Windows PowerShell):
```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/smartmeal?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_password"
```

### 4. Install frontend dependencies
```bash
cd frontend
npm install
cd ..
```

### 5. Set up AI service virtual environment
```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate    # Windows
pip install fastapi uvicorn scikit-learn pandas numpy pydantic
cd ..
```

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_URL` | JDBC connection URL | Local MySQL |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | *(required)* |
| `JWT_SECRET` | JWT signing secret (32+ chars) | Built-in dev secret |
| `JWT_EXPIRATION` | Token expiry in milliseconds | `86400000` (24h) |
| `AI_SERVICE_URL` | Python AI service base URL | `http://localhost:8000` |

---

## ▶️ Running the Application

### Backend (Spring Boot — port 8081)
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

On first startup, `DataInitializer` seeds:
- Admin account: `admin@anurag.edu.in` / `Admin@123`
- Demo student: `mehermadhuri7@gmail.com` / `Student@123`
- 15 menu items (8 Tiffin, 7 Lunch)
- 4 meal slots and sample predictions

### Frontend (React — port 5173)
```bash
cd frontend
npm run dev
```
Open: **http://localhost:5173**

### AI Service (FastAPI — port 8000)
```powershell
cd ai-service
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
Health check: **http://localhost:8000**

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new student | Public |
| POST | `/api/auth/login` | Login (returns JWT) | Public |
| GET | `/api/auth/me` | Get current user | Bearer |

### Menu
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/menus` | All menu items | Bearer |
| GET | `/api/menus/available` | Available items only | Bearer |
| GET | `/api/menus/category/{TIFFIN\|LUNCH}` | By category | Bearer |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Create new order | Bearer |
| GET | `/api/orders/my` | My orders | Bearer |
| GET | `/api/orders/{id}` | Get order by ID | Bearer |
| POST | `/api/orders/{id}/cancel` | Cancel order | Bearer |

### Payments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payments/initiate` | Initiate payment | Bearer |
| POST | `/api/payments/{id}/simulate-success` | Demo sandbox payment | Bearer |
| GET | `/api/payments/order/{orderId}` | Payment for order | Bearer |

### Admin (ROLE_ADMIN required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Stats summary |
| GET | `/api/admin/orders` | All orders (filterable) |
| PUT | `/api/admin/orders/{id}/status` | Update order status |
| POST | `/api/admin/menus` | Create menu item |
| PUT | `/api/admin/menus/{id}` | Update menu item |
| PATCH | `/api/admin/menus/{id}/toggle` | Toggle availability |
| DELETE | `/api/admin/menus/{id}` | Delete menu item |
| GET | `/api/admin/settings/window-status` | Booking window status |
| POST | `/api/admin/settings/override-hours` | Toggle test override |

### Booking Windows
| Window | Open | Close |
|--------|------|-------|
| Tiffin | 8:00 AM | 10:00 AM |
| Lunch | 11:30 AM | 2:00 PM |
| General ordering | — | 3:00 PM |
| Timezone | Asia/Kolkata (IST) | — |

---

## 🧪 Testing

### Backend tests
```bash
cd backend
.\mvnw.cmd test
```
Runs: `SmartMealApplicationTests` (context loads) + `AuthIntegrationTests` (7 assertions: registration, duplicate rejection, BCrypt hashing, login, invalid credential rejection, unauthorized access, admin role enforcement).

### Frontend build verification
```bash
cd frontend
npm run build
```

### AI Service test
```bash
curl http://localhost:8000/
curl -X POST http://localhost:8000/predict -H "Content-Type: application/json" \
  -d '{"date":"2026-10-15","meal_type":"TIFFIN","slot_name":"Counter Slot"}'
```

---

## 🐳 Docker

> Docker is configured but requires Docker Desktop to be installed.

```bash
# Build and start all services
docker-compose up --build

# Stop
docker-compose down
```

Services:
- `backend` → port 8081
- `frontend` → port 3000
- `ai-service` → port 8000

---

## 🔒 Security Notes

- Passwords are hashed with BCrypt (strength 10)
- JWT tokens expire after 24 hours
- Role-based access: `ROLE_STUDENT` and `ROLE_ADMIN`
- Admin endpoints enforced at the server with `@PreAuthorize("hasRole('ADMIN')")`
- Students cannot access or modify other students' orders (enforced in `OrderController`)
- CORS configured for `localhost:5173` and `localhost:3000`
- Environment variables used for all credentials — never hardcoded
- `.env` is excluded from Git via `.gitignore`

---

## 👩‍💻 Author

**KOTA MEHER MADHURI**  
B.Tech CSE — Anurag University  
GitHub: [https://github.com/mehermadhuri](https://github.com/mehermadhuri)

---

*SmartMeal is a B.Tech major project. It identifies Anurag University as its intended campus deployment target. It is not an officially approved university system.*
