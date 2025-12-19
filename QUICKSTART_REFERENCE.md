# 🎯 Quick Start Guide - S-Box Analyzer

## Mode Sekarang: PC Backup (Jumat-Minggu)

### Start Backend (1 Command):
```powershell
cd C:\Users\GreepzID\Documents\S-box-Research-Analyzer\backend
.\start-pc-mode.bat
```
✅ Backend auto-configure Tailscale → https://greepzid.tail31204e.ts.net

### Verify:
```powershell
curl.exe https://greepzid.tail31204e.ts.net/health
```
Harus return: `{"status":"healthy",...}`

### Stop Backend:
Tekan `Ctrl+C` di terminal backend

---

## Mode Senin: Production Server

### Setup (One-Time):
```bash
# Di server
cd /www/wwwroot/S-box-Research-Analyzer/backend
cp .env.production .env
chmod +x start-production-server.sh
pip3 install -r requirements.txt

# Create systemd service (see DEPLOYMENT_GUIDE_COMPLETE.md)
sudo systemctl enable sbox-backend
sudo systemctl start sbox-backend
```

### Commands:
```bash
# Start
sudo systemctl start sbox-backend

# Stop
sudo systemctl stop sbox-backend

# Restart
sudo systemctl restart sbox-backend

# Status & Logs
sudo systemctl status sbox-backend
sudo journalctl -u sbox-backend -f
```

### Update Code:
```bash
cd /www/wwwroot/S-box-Research-Analyzer/backend
git pull  # or upload via SCP
sudo systemctl restart sbox-backend
```

---

## Frontend Build & Deploy

### Build (di PC):
```powershell
cd frontend
npm run build
```

### Upload ke Server:
```bash
scp -r dist/* root@your-server:/www/wwwroot/try-sboxanalyzer.greepzid.com/
```

### Reload Nginx:
```bash
ssh root@your-server "nginx -s reload"
```

---

## Troubleshooting Cepat

### Backend tidak bisa diakses:
```powershell
# PC Mode
tailscale serve status
tailscale serve --bg --https 443 http://127.0.0.1:8000

# Server Mode
sudo systemctl status sbox-backend
curl http://localhost:5000/health
```

### CORS Error:
Edit `backend/.env` → tambahkan domain di `ALLOWED_ORIGINS`, restart backend

### Rate Limit Terlalu Ketat:
Edit `backend/.env`:
```env
RATE_LIMIT_PER_MINUTE=120
```
Restart backend

### Debug Mode:
Edit `backend/.env`:
```env
RATE_LIMIT_DEBUG=true
```
Restart backend → lihat log detail setiap request

---

## File-File Penting

- **PC Mode**: `backend/start-pc-mode.bat`
- **Server Mode**: `backend/start-production-server.sh`
- **Config PC**: `backend/.env`
- **Config Server**: `backend/.env.production`
- **Frontend Config**: `frontend/.env`
- **Full Guide**: `DEPLOYMENT_GUIDE_COMPLETE.md`

---

## URL Reference

| Environment | Backend URL | Frontend URL |
|------------|-------------|--------------|
| **PC Backup** | `https://greepzid.tail31204e.ts.net` | `https://try-sboxanalyzer.greepzid.com` |
| **Production** | `http://localhost:5000` (via Nginx) | `https://try-sboxanalyzer.greepzid.com` |

---

Baca [DEPLOYMENT_GUIDE_COMPLETE.md](DEPLOYMENT_GUIDE_COMPLETE.md) untuk detail lengkap!
