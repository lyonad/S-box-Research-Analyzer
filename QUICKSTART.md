# 🚀 Quick Start Guide - Security Enhanced Version

## Setup dalam 5 Menit

### 1️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env

# Edit .env (optional - sudah ada default values)
# ALLOWED_ORIGINS=https://your-frontend.com
# RATE_LIMIT_PER_MINUTE=60

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend akan berjalan di: http://localhost:8000  
✅ API Docs di: http://localhost:8000/docs

---

### 2️⃣ Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Edit .env dengan backend URL Anda
# VITE_API_BASE_URL=http://localhost:8000

# Run development server
npm run dev
```

✅ Frontend akan berjalan di: http://localhost:3000

---

## 🔧 Configuration

### Environment Variables

#### Frontend (`.env`)
```bash
# Local development
VITE_API_BASE_URL=http://localhost:8000

# Production
VITE_API_BASE_URL=https://api.example.com
```

#### Backend (`.env`)
```bash
# CORS - Tambahkan frontend URLs Anda
ALLOWED_ORIGINS=http://localhost:3000,https://app.example.com

# Rate Limiting (requests per minute)
RATE_LIMIT_PER_MINUTE=60

# Max file upload size (bytes)
MAX_UPLOAD_SIZE=8388608

# Server config
HOST=0.0.0.0
PORT=8000
```

---

## 🔒 Security Features (Sudah Aktif!)

### ✅ Frontend
- Environment-based API configuration
- Request timeout (30 detik)
- Automatic error handling
- Retry logic untuk network errors

### ✅ Backend
- Rate limiting (60 req/min default)
- Security headers (XSS, Clickjacking, etc.)
- Input validation
- File size limits (8MB)
- CORS whitelist
- Comprehensive logging

---

## 🎯 Common Tasks

### Update API URL
```bash
# Frontend: Edit .env
VITE_API_BASE_URL=https://new-api-url.com

# Restart frontend
npm run dev
```

### Add Frontend Domain to CORS
```bash
# Backend: Edit .env
ALLOWED_ORIGINS=https://frontend1.com,https://frontend2.com

# Restart backend
uvicorn main:app --reload
```

### Adjust Rate Limit
```bash
# Backend: Edit .env
RATE_LIMIT_PER_MINUTE=120  # 120 requests per minute

# Restart backend
```

### Change Max Upload Size
```bash
# Backend: Edit .env
MAX_UPLOAD_SIZE=16777216  # 16 MB

# Restart backend
```

---

## 🐛 Troubleshooting

### ❌ CORS Error
**Problem:** Frontend tidak bisa connect ke backend

**Solution:**
1. Check backend logs
2. Pastikan frontend URL ada di `ALLOWED_ORIGINS`
3. Restart backend setelah edit `.env`

```bash
# Backend .env
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.com
```

### ❌ Rate Limit Error (429)
**Problem:** Too many requests

**Solution:**
1. Wait 1 minute
2. Atau increase limit di backend `.env`

```bash
# Backend .env
RATE_LIMIT_PER_MINUTE=120
```

### ❌ File Too Large (413)
**Problem:** Image upload gagal

**Solution:**
1. Reduce file size
2. Atau increase limit di backend `.env`

```bash
# Backend .env
MAX_UPLOAD_SIZE=16777216  # 16 MB
```

### ❌ Cannot Connect to Backend
**Problem:** Frontend tidak bisa reach backend

**Solution:**
1. Check backend is running: http://localhost:8000/health
2. Check frontend `.env`:
```bash
VITE_API_BASE_URL=http://localhost:8000
```
3. Restart frontend: `npm run dev`

---

## 📦 Production Deployment

### Frontend

```bash
# Build production bundle
npm run build

# Files akan ada di folder dist/
# Upload ke hosting (Vercel, Netlify, etc.)
```

**Environment:**
```bash
# .env atau hosting environment variables
VITE_API_BASE_URL=https://your-production-api.com
```

### Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Setup production environment
cp .env.example .env

# Edit .env untuk production
nano .env

# Run with gunicorn (production server)
gunicorn main:app -c gunicorn_conf.py
```

**Environment:**
```bash
ALLOWED_ORIGINS=https://your-frontend.com
RATE_LIMIT_PER_MINUTE=60
MAX_UPLOAD_SIZE=8388608
HOST=0.0.0.0
PORT=8000
```

---

## 📊 Testing

### Test Backend
```bash
# Health check
curl http://localhost:8000/health

# Generate S-box
curl -X POST http://localhost:8000/generate-sbox

# API Documentation
open http://localhost:8000/docs
```

### Test Frontend
1. Open http://localhost:3000
2. Try generate S-box
3. Try image encryption
4. Check browser console untuk errors

---

## 📚 Additional Help

- **Full Security Guide:** See `SECURITY.md`
- **Changes Summary:** See `SECURITY_UPDATE.md`
- **Files Changed:** See `FILES_CHANGED.md`
- **API Documentation:** http://localhost:8000/docs

---

## ⚡ Quick Commands Reference

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload          # Development
gunicorn main:app -c gunicorn_conf.py  # Production

# Frontend
cd frontend
npm install
npm run dev                        # Development
npm run build                      # Production build

# Environment setup
cp .env.example .env               # Copy template
nano .env                          # Edit configuration
```

---

**Need Help?** Check the error logs:
- Backend: Terminal output
- Frontend: Browser console (F12)

**Status:** ✅ Ready to use!  
**Version:** 2.0.0 (Security Enhanced)
