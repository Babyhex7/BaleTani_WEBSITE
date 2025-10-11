@echo off
echo Starting BaleTani Frontend...
cd /d "D:\nnnnssssffffwwww\BaleTani_WEBSITE\frontend"
echo Current directory: %CD%
echo.
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting development server...
call npm run dev
pause