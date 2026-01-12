@echo off
echo Installing Backend Dependencies...
cd backend
call npm install
cd ..

echo.
echo Installing Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo ====================================
echo Installation Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Create .env file in backend folder (copy from .env.example)
echo 3. Run start-backend.bat in one terminal
echo 4. Run start-frontend.bat in another terminal
echo.
pause
