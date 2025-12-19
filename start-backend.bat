@echo off
echo ========================================
echo  Advanced S-Box 44 Analyzer - Backend
echo ========================================
echo.
echo Starting FastAPI server with timeout settings for large files...
echo.

cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --timeout-keep-alive 120 --timeout-graceful-shutdown 30

pause

