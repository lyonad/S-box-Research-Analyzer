# 🚀 Deployment Guide - S-Box Analyzer (PC Mode & Production)

## Ringkasan Fix yang Diterapkan

### ✅ Yang Diperbaiki:

1. **Rate Limiter Middleware**
   - Support header forwarded dari Tailscale Funnel dan Cloudflare
   - Membaca `CF-Connecting-IP`, `X-Real-IP`, `X-Forwarded-For`
   - Trusted proxy networks (Tailscale CIDR: `100.64.0.0/10`)

2. **Request Logging Middleware**
   - Log semua request masuk dengan emoji (🔵 incoming, ✅ success, ❌ error)
   - Tracking header dan client IP untuk debugging
   - Bisa di-toggle via `RATE_LIMIT_DEBUG` env var

3. **Tailscale Serve/Funnel Configuration**
   - Command: `tailscale serve --bg --https 443 http://127.0.0.1:8000`
   - Background mode (persistent setelah restart terminal)
   - Accessible via HTTPS di port 443 (standar)

4. **Backend Binding**
   - `--host 0.0.0.0` (bukan `127.0.0.1`) agar accessible dari Tailscale network
   - Port 8000 untuk PC, port 5000 untuk production server

5. **Frontend Configuration**
   - `.env`: `VITE_API_BASE_URL=https://greepzid.tail31204e.ts.net` (tanpa port)
   - Rebuild frontend agar menggunakan URL yang benar

---

## 📋 Setup Mode 1: PC Backup (Sekarang - Untuk Traffic Tinggi)

### Prasyarat:
- ✅ Tailscale terinstall dan running
- ✅ Python 3.13 terinstall
- ✅ Backend dependencies installed (`pip install -r requirements.txt`)

### Langkah Setup:

#### 1. **Jalankan Backend di PC**

```powershell
cd C:\Users\GreepzID\Documents\S-box-Research-Analyzer\backend
.\start-pc-mode.bat
```

Script ini akan:
- Load konfigurasi dari `.env`
- Setup Tailscale Serve otomatis (`https://greepzid.tail31204e.ts.net`)
- Start uvicorn di `0.0.0.0:8000`
- Enable auto-reload untuk development

#### 2. **Verifikasi Backend Berjalan**

Terminal baru:
```powershell
# Test lokal
curl.exe http://localhost:8000/health

# Test via Tailscale
curl.exe https://greepzid.tail31204e.ts.net/health
```

Harus return: `{"status":"healthy","service":"S-Box Analyzer API"}`

#### 3. **Deploy Frontend ke Production Server**

Di PC (build frontend):
```powershell
cd C:\Users\GreepzID\Documents\S-box-Research-Analyzer\frontend
npm run build
```

Upload `dist/` dan `.env` ke server:
```bash
# Di server (via SSH)
scp -r dist/* root@your-server:/www/wwwroot/try-sboxanalyzer.greepzid.com/
scp .env root@your-server:/www/wwwroot/try-sboxanalyzer.greepzid.com/
```

Restart nginx di server:
```bash
nginx -t && nginx -s reload
```

#### 4. **Test Production**

Buka browser: https://try-sboxanalyzer.greepzid.com

Cek Network tab (F12):
- `/health` → HTTP 200 ✅
- Tidak ada "NS_BINDING_ABORTED" ❌

---

## 📋 Setup Mode 2: Production Server (Senin - Normal Traffic)

### Prasyarat:
- Server production running (Ubuntu/Debian/CentOS)
- Nginx configured sebagai reverse proxy
- Python 3.8+ terinstall
- Gunicorn terinstall

### Langkah Migrasi:

#### 1. **Upload Backend ke Server**

```bash
# Di PC, compress backend folder
cd C:\Users\GreepzID\Documents\S-box-Research-Analyzer
tar -czf backend.tar.gz backend/

# Upload ke server
scp backend.tar.gz root@your-server:/www/wwwroot/S-box-Research-Analyzer/

# Di server, extract
ssh root@your-server
cd /www/wwwroot/S-box-Research-Analyzer
tar -xzf backend.tar.gz
```

#### 2. **Setup Environment di Server**

```bash
cd /www/wwwroot/S-box-Research-Analyzer/backend

# Copy production env
cp .env.production .env

# Install dependencies
pip3 install -r requirements.txt

# Make startup script executable
chmod +x start-production-server.sh
```

#### 3. **Test Manual (Opsional)**

```bash
# Test run
./start-production-server.sh
```

Buka terminal baru dan test:
```bash
curl http://localhost:5000/health
```

Ctrl+C untuk stop test.

#### 4. **Setup Systemd Service (Auto-Start)**

Buat file `/etc/systemd/system/sbox-backend.service`:

```ini
[Unit]
Description=S-Box Analyzer Backend
After=network.target

[Service]
Type=notify
User=root
WorkingDirectory=/www/wwwroot/S-box-Research-Analyzer/backend
ExecStart=/usr/bin/gunicorn -c gunicorn_conf.py main:app
Restart=always
RestartSec=10
StandardOutput=append:/www/wwwroot/S-box-Research-Analyzer/backend/logs/stdout.log
StandardError=append:/www/wwwroot/S-box-Research-Analyzer/backend/logs/stderr.log

[Install]
WantedBy=multi-user.target
```

Enable dan start:
```bash
systemctl daemon-reload
systemctl enable sbox-backend
systemctl start sbox-backend
systemctl status sbox-backend
```

#### 5. **Update Nginx Reverse Proxy**

Edit `/etc/nginx/sites-available/your-site.conf`:

```nginx
upstream sbox_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 443 ssl http2;
    server_name try-sboxanalyzer.greepzid.com;

    # SSL configuration (your existing)
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend (static files)
    location / {
        root /www/wwwroot/try-sboxanalyzer.greepzid.com;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://sbox_backend/;
        proxy_http_version 1.1;
        
        # Forwarded headers (IMPORTANT for rate limiter)
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
        
        # Buffering
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

Test dan reload:
```bash
nginx -t
nginx -s reload
```

#### 6. **Update Frontend .env di Server**

Edit `/www/wwwroot/try-sboxanalyzer.greepzid.com/.env`:

```env
# Change from Tailscale URL to local API
VITE_API_BASE_URL=https://try-sboxanalyzer.greepzid.com/api
```

Rebuild frontend (di PC):
```powershell
cd frontend
npm run build
```

Upload ulang:
```bash
scp -r dist/* root@your-server:/www/wwwroot/try-sboxanalyzer.greepzid.com/
```

#### 7. **Verifikasi Production**

```bash
# Di server
curl http://localhost:5000/health

# Dari luar (browser)
# https://try-sboxanalyzer.greepzid.com
```

---

## 🔧 Troubleshooting

### PC Mode Issues:

**❌ "Tailscale is not running"**
```powershell
# Start Tailscale
net start Tailscale
tailscale up
```

**❌ Backend tidak accessible dari Tailscale**
```powershell
# Check firewall
netsh advfirewall firewall show rule name="Tailscale-Process"

# Restart Tailscale service
Restart-Service Tailscale

# Re-configure serve
tailscale serve --bg --https 443 http://127.0.0.1:8000
```

**❌ Rate limit terlalu ketat**
Edit `backend/.env`:
```env
RATE_LIMIT_PER_MINUTE=120
```
Restart backend.

### Production Server Issues:

**❌ Gunicorn tidak start**
```bash
# Check logs
journalctl -u sbox-backend -f

# Manual test
cd /www/wwwroot/S-box-Research-Analyzer/backend
gunicorn -c gunicorn_conf.py main:app
```

**❌ CORS Error di browser**
Check `backend/.env`:
```env
ALLOWED_ORIGINS=https://try-sboxanalyzer.greepzid.com,https://analyzer.greepzid.com
```
Restart backend:
```bash
systemctl restart sbox-backend
```

**❌ 502 Bad Gateway (Nginx)**
```bash
# Check backend is running
curl http://localhost:5000/health

# Check nginx error log
tail -f /var/log/nginx/error.log
```

---

## 📊 Monitoring & Logs

### PC Mode:
- Backend console: langsung tampil di terminal
- Tailscale logs: `tailscale status`

### Production Server:
- Backend logs: `/www/wwwroot/S-box-Research-Analyzer/backend/logs/`
- Systemd logs: `journalctl -u sbox-backend -f`
- Nginx logs: `/var/log/nginx/access.log`, `error.log`

### Debug Mode (Temporary):

Edit `backend/.env`:
```env
RATE_LIMIT_DEBUG=true
```

Restart backend → akan mencetak log detail setiap request:
```
🔵 INCOMING REQUEST: GET /health from 1.2.3.4
   Headers: {...}
✅ RESPONSE: 200 for GET /health
```

**⚠️ Set `RATE_LIMIT_DEBUG=false` untuk production** (performance).

---

## ✅ Checklist Migrasi PC → Server (Senin)

- [ ] Stop backend di PC (`Ctrl+C` di terminal)
- [ ] Stop Tailscale Serve: `tailscale serve --https=443 off`
- [ ] Upload backend ke server (via SCP atau Git)
- [ ] Copy `.env.production` → `.env` di server
- [ ] Install dependencies: `pip3 install -r requirements.txt`
- [ ] Setup systemd service
- [ ] Update Nginx config (reverse proxy + forwarded headers)
- [ ] Update frontend `.env` ke URL server
- [ ] Rebuild dan upload frontend
- [ ] Test: `curl http://localhost:5000/health` di server
- [ ] Test: buka `https://try-sboxanalyzer.greepzid.com` di browser
- [ ] Monitor logs: `journalctl -u sbox-backend -f`

---

## 🎯 Summary

| Aspect | PC Mode (Sekarang) | Production (Senin) |
|--------|-------------------|-------------------|
| **Backend** | PC via Tailscale | Server lokal |
| **URL** | `https://greepzid.tail31204e.ts.net` | `https://try-sboxanalyzer.greepzid.com/api` |
| **Port** | 8000 | 5000 |
| **Process** | Uvicorn (manual/auto-reload) | Gunicorn (systemd service) |
| **Frontend .env** | `https://greepzid.tail31204e.ts.net` | `https://try-sboxanalyzer.greepzid.com/api` |
| **Auto-Start** | Manual (run `start-pc-mode.bat`) | Systemd (auto on boot) |

---

**Status Saat Ini**: ✅ Backend berjalan di PC dengan Tailscale Funnel → production frontend connect via HTTPS.

**Next Step (Senin)**: Migrate backend ke server, update Nginx reverse proxy, rebuild frontend dengan API URL baru.
