@echo off
title Launch Live Public Demo URL - ACME Salary Management
set "PATH=C:\Program Files\nodejs;C:\Users\HP\AppData\Local\Programs\Python\Python312;%PATH%"

cd /d "%~dp0"

echo ======================================================================
echo    ACME SALARY MANAGEMENT - INSTANT PUBLIC DEMO TUNNEL
echo ======================================================================
echo.
echo Starting secure public tunnel for your React frontend (port 5173)...
echo.
echo NOTE: When visiting the link the first time, localtunnel might ask
echo for your public IP as password to prevent bots.
echo.
echo ======================================================================
echo.

npx localtunnel --port 5173 --subdomain acme-salary-prashanth

pause
