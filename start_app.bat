@echo off
echo =========================================================================
echo       HEALTH PREDICTION WEB APPLICATION (Full-Stack Launch)
echo =========================================================================
echo.
echo Launching Python Backend on http://127.0.0.1:5000 ...
start "Health Prediction API (Backend)" cmd /k "cd /d %~dp0backend && python app.py"

timeout /t 2 /nobreak >nul

echo Launching React/Vite Frontend on http://localhost:3000 ...
start "Health Prediction UI (Frontend)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Application launched!
echo - Frontend: http://localhost:3000
echo - Backend:  http://127.0.0.1:5000/api/health
echo =========================================================================
