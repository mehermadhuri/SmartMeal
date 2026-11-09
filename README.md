# Daily Task Manager Application

A complete full-stack web application built for the **Full Stack Development using Java** lab examination.

## 🏗️ Architecture & Technology Stack
- **Frontend**: React.js with Vite (`frontend/`)
- **Backend**: Java Spring Boot REST API (`backend/`)
- **Database**: MySQL (`task_manager` database)
- **Communication**: Native `fetch` API + JSON
- **Dependencies**: Spring Web, Spring Data JPA, MySQL Connector/J

---

## ⚡ Quick Start Guide

### Step 1: Start MySQL Service & Database
Make sure your MySQL Server 8.0 service is running. The database `task_manager` has already been created.
If starting on another computer, run:
```sql
CREATE DATABASE IF NOT EXISTS task_manager;
```

### Step 2: Configure MySQL Password (if needed)
Open `backend/src/main/resources/application.properties` and verify:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/task_manager?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=12345
```
> **Note:** Replace `12345` with your local MySQL root password if it differs.

### Step 3: Start the Backend (Spring Boot)
Open a terminal in the `backend/` folder and run:
```powershell
.\mvnw.cmd spring-boot:run
```
- Backend starts at: **`http://localhost:8081`**
- REST API endpoint: **`http://localhost:8081/api/tasks`**
*(Port 8081 is configured to avoid conflict with Oracle TNSLSNR on port 8080).*

### Step 4: Start the Frontend (React + Vite)
Open a new terminal in the `frontend/` folder and run:
```powershell
npm run dev
```
- Frontend application URL: **`http://localhost:5173`**

---

## 📋 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | Retrieve all tasks (or filter by `?status=Pending` or `?status=Completed`) |
| `GET` | `/api/tasks/{id}` | Retrieve a specific task by its ID (returns 404 if not found) |
| `POST` | `/api/tasks` | Create a new task (validates non-empty title, returns 201 Created) |
| `PUT` | `/api/tasks/{id}` | Update title, description, due date, or status of an existing task |
| `DELETE` | `/api/tasks/{id}` | Delete a task permanently from MySQL (returns 200 OK) |

---

## ✨ Features Checklist
- [x] **Add Task**: Title (required), Description (optional), Due Date (optional).
- [x] **Display in Table**: Clean responsive table showing ID, Title, Description, Due Date, Status, and Actions.
- [x] **Edit Task**: Loads selected task details into the form for editing and updates MySQL.
- [x] **Delete Task**: Confirms and removes the task permanently from the database.
- [x] **Status Toggling**: One-click toggle between `⏳ Pending` and `✅ Completed` with immediate database persistence.
- [x] **Filters**: Quick filter buttons for `All Tasks`, `Pending`, and `Completed` with live counters.
- [x] **Validation**: Shows immediate error message if the title is empty.
- [x] **Feedback Alerts**: Color-coded banners for success and error messages with auto-dismiss.
- [x] **Permanent Storage**: All operations read/write directly to MySQL `task_manager.tasks`.
