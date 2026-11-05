@echo off
echo ========================================================
echo  Starting Health Prediction API (Python / Flask Backend)
echo ========================================================
cd /d "%~dp0backend"
python -m pip install -r requirements.txt
echo.
echo Starting Flask Server on http://127.0.0.1:5000 ...
python app.py
pause
