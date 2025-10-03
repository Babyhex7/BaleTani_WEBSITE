@echo off
echo ========================================
echo   BaleTani Fresh Market - Startup
echo ========================================
echo.

echo Starting Backend API Server...
cd backend
start cmd /k "npm run dev"

echo.
echo Waiting for backend to start...
timeout /t 3 >nul

echo Starting Frontend Customer...
cd ..\frontend-customer
start cmd /k "npm run dev"

echo.
echo ========================================
echo   All servers started!
echo ========================================
echo   Backend API: http://localhost:5000
echo   Frontend:    http://localhost:5173
echo ========================================
echo.
echo Press any key to exit...
pause >nul