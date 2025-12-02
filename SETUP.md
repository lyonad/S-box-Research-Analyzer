# 🚀 Quick Setup Guide

## For Windows Users

### Step 1: Install Dependencies

#### Backend (Python)
Double-click: `install-backend.bat`

Or manually:
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend (Node.js)
Double-click: `install-frontend.bat`

Or manually:
```bash
cd frontend
npm install
```

### Step 2: Start the Application

#### Start Backend Server
Double-click: `start-backend.bat`

The API will start at: http://localhost:8000

#### Start Frontend Server
Double-click: `start-frontend.bat`

The app will start at: http://localhost:3000

---

## For Linux/Mac Users

### Step 1: Install Dependencies

#### Backend
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
```

### Step 2: Start the Application

#### Terminal 1 - Backend
```bash
cd backend
python main.py
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

---

## Verification

1. **Backend**: Visit http://localhost:8000/docs to see the API documentation
2. **Frontend**: Visit http://localhost:3000 to see the application

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
- Close any application using port 8000
- Or modify the port in `backend/main.py`

**Python not found:**
- Install Python 3.8+ from https://python.org
- Make sure Python is added to PATH

**Module import errors:**
- Make sure you're in the `backend` directory
- Run `pip install -r requirements.txt` again

### Frontend Issues

**Port 3000 already in use:**
- The application will automatically use another port
- Or modify the port in `frontend/vite.config.ts`

**npm not found:**
- Install Node.js 16+ from https://nodejs.org
- Restart your terminal after installation

**Connection to backend failed:**
- Make sure the backend server is running on port 8000
- Check for firewall issues

## Testing the Application

1. Click "Generate & Analyze" button
2. Wait for the analysis to complete (usually 2-5 seconds)
3. Explore the three tabs:
   - **K44 S-box**: View and analyze the K44 matrix results
   - **AES S-box**: View and analyze standard AES results
   - **Comparison**: Side-by-side comparison

## Next Steps

- Read the full documentation in `README.md`
- Explore the API at http://localhost:8000/docs
- Review the backend code in `backend/`
- Review the frontend code in `frontend/src/`

## Support

For issues or questions:
1. Check the main `README.md`
2. Review the backend documentation: `backend/README.md`
3. Review the frontend documentation: `frontend/README.md`

