# SmartMeal: AI-Based College Meal Pre-Booking and Management System

A major B.Tech CSE project designed to prevent college mess food wastage and eliminate long pickup queues through real-time pre-booking, cutoff enforcement, and AI-driven meal demand forecasting.

## 🛠️ Technology Stack
- **Frontend**: React + Vite (Vanilla CSS)
- **Backend**: Java 17 + Spring Boot (Spring Security + JWT)
- **Database**: Aiven Cloud MySQL
- **AI Service**: Python (FastAPI + Scikit-Learn Random Forest Regressor)
- **DevOps**: Docker, Docker Compose, Git & GitHub

## 📂 Project Architecture
- `backend/`: Spring Boot REST API for users, menus, slots, bookings, and auth.
- `frontend/`: React Web Application for Students and Admins.
- `ai-service/`: Python microservice providing historical meal demand predictions and cooking recommendations.
