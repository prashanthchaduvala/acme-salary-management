@echo off
title Push ACME Salary Management to GitHub
set "PATH=C:\Program Files\nodejs;C:\Users\HP\AppData\Local\Programs\Python\Python312;C:\Users\HP\AppData\Local\Programs\Python\Python312\Scripts;C:\Users\HP\AppData\Local\Programs\MinGit\cmd;%PATH%"

cd /d "%~dp0"

echo ======================================================================
echo Pushing repository to:
echo https://github.com/prashanthchaduvala/acme-salary-management.git
echo ======================================================================
echo.

git branch -M main
git push -u origin main

echo.
echo ======================================================================
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Code successfully pushed to GitHub!
) else (
    echo [NOTE] If you were prompted for a password, GitHub requires a 
    echo        Personal Access Token (classic token with 'repo' scope).
)
echo ======================================================================
pause
