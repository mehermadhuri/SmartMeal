@echo off
echo ===================================================
echo Starting Daily Task Manager Backend (Spring Boot)...
echo Port: 8081
echo URL: http://localhost:8081/api/tasks
echo ===================================================
cd /d "%~dp0backend"
java -jar target\task-manager-0.0.1-SNAPSHOT.jar
pause
