@echo off
title ACME Salary Management System Runner
echo ======================================================================
echo           ACME Organization - Global Salary Management System
echo ======================================================================
echo.

:: Ensure Python and Node are on PATH
set "PATH=C:\Program Files\nodejs;C:\Users\HP\AppData\Local\Programs\Python\Python312;C:\Users\HP\AppData\Local\Programs\Python\Python312\Scripts;C:\Users\HP\AppData\Local\Programs\MinGit\cmd;%PATH%"

echo [1/2] Launching Django Backend Server (Port 8000)...
start "ACME Backend (Django)" cmd /k "cd /d %~dp0backend && python manage.py runserver 0.0.0.0:8000"

timeout /t 3 /nobreak >nul

echo [2/2] Launching React Vite Frontend (Port 5173)...
start "ACME Frontend (React Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ======================================================================
echo System successfully launched!
echo.
echo  - Frontend Web UI:  http://localhost:5173
echo  - Backend REST API: http://localhost:8000/api/
echo  - Pre-seeded Data:  10,000 Employees ready
echo ======================================================================
echo.
echo Leave this window open, or close it when done.
pause
