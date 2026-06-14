@echo off
echo ========================================================
echo Starting Dokan Baki Web App on Localhost...
echo ========================================================
cd /d "e:\MySaas\dokan-baki-web"

echo Running Next.js server...
echo.
echo Please wait 5-10 seconds for the server to start.
echo After that, open your browser and go to http://localhost:3000
echo.

call npm run dev

pause
