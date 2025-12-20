import multiprocessing

# --- PATH ---
chdir = "/www/wwwroot/S-box-Research-Analyzer/backend"

# --- NETWORK ---
bind = "0.0.0.0:5000"

# --- WORKER ---
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"

# --- TIMEOUT (NAIKKAN JADI 600 DETIK / 10 MENIT) ---
timeout = 600  
keepalive = 5

# --- LOGGING ---
loglevel = "info"
accesslog = "/www/wwwroot/S-box-Research-Analyzer/backend/logs/access.log"
errorlog =  "/www/wwwroot/S-box-Research-Analyzer/backend/logs/error.log"