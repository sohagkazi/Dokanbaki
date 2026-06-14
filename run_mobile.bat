@echo off
echo ========================================================
echo Starting Android Emulator (Medium_Phone)...
echo ========================================================
cd /d "e:\MySaas\dokan-baki-mobile"

echo Launching emulator (Please wait while it boots up)...
call e:\flutter_sdk\bin\flutter.bat emulators --launch Medium_Phone

echo.
echo Waiting 15 seconds for emulator to get ready...
timeout /t 15

echo ========================================================
echo Starting Dokan Baki Mobile App...
echo ========================================================
call e:\flutter_sdk\bin\flutter.bat run

echo.
echo Process finished.
pause
