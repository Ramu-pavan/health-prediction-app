@echo off
echo ========================================================
echo  Starting Health Prediction UI (React / Vite Frontend)
echo ========================================================
cd /d "%~dp0frontend"
echo.
echo Starting Vite Dev Server on http://localhost:3000 ...
npm run dev
pause
