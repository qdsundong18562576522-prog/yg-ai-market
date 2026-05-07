@echo off
echo ==============================
echo  扬光AI商城 - 启动所有服务
echo ==============================

:: Start Backend
echo [1/2] 启动后端...
cd /d %~dp0backend
start "yg-backend" cmd /c "venv\Scripts\python run.py"

:: Wait for backend to start
timeout /t 4 /nobreak > nul

:: Start Frontend
echo [2/2] 启动前端...
cd /d %~dp0frontend
start "yg-frontend" cmd /c "npx vite --port 12400"

echo.
echo 后端: http://localhost:12401
echo 前端: http://localhost:12400
echo 账号: admin / admin123
echo.
echo 窗口关闭后服务会停止。
pause
