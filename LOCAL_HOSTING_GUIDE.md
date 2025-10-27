# Local LAN Hosting Guide

This guide explains how to host your Gastos application on a local network instead of cloud hosting.

## Architecture

- **Backend Server** (Server 1): Hosts Django API + Database
- **Frontend Server** (Server 2): Serves React static files
- **Clients**: Access via browser on any device in the LAN

## Quick Start

### 1. Backend Server Setup

**Windows:**
```bash
cd gastos
serve-backend.bat
```

**Linux/Mac:**
```bash
cd gastos
./serve-backend.sh
```

The backend will be available at: `http://YOUR_BACKEND_SERVER_IP:8000`

### 2. Frontend Server Setup

**Before starting, configure the backend URL:**

Edit `frontend/src/constants.js`:
```javascript
export const API_URL = 'http://192.168.1.X:8000'  // Replace with your backend server IP
```

**Then start the frontend:**

**Windows:**
```bash
cd frontend
serve-local.bat
```

**Linux/Mac:**
```bash
cd frontend
./serve-local.sh
```

The frontend will be available at: `http://YOUR_FRONTEND_SERVER_IP:3000`

### 3. Update Backend CORS Settings

Edit `gastos/gastos/settings.py` to allow your frontend server:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://192.168.1.Y:3000",  # Your frontend server IP
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://192.168.1.Y:3000",  # Your frontend server IP
]

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '192.168.1.X',  # Your backend server IP
    '192.168.1.Y',  # Your frontend server IP
]
```

### 4. Client Access

From any device on the LAN, open a browser and go to:
```
http://192.168.1.Y:3000
```

Replace `192.168.1.Y` with your frontend server's actual IP address.

## Finding Your Server IP Address

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your network adapter.

**Linux/Mac:**
```bash
ip addr show  # Linux
ifconfig      # Mac
```
Look for your LAN interface (usually starts with 192.168.x.x or 10.x.x.x)

## Running as Windows Services (Production)

For always-on hosting, you can run both servers as Windows services.

### Backend as Service

1. Download [NSSM](https://nssm.cc/download)
2. Install backend service:
```cmd
nssm install GastosBackend "C:\path\to\python.exe"
nssm set GastosBackend AppDirectory "C:\path\to\Gastos\gastos"
nssm set GastosBackend AppParameters "manage.py runserver 0.0.0.0:8000"
nssm start GastosBackend
```

### Frontend as Service

1. Install [serve](https://www.npmjs.com/package/serve) globally:
```cmd
npm install -g serve
```

2. Build the frontend:
```cmd
cd frontend
npm run build
```

3. Create service:
```cmd
nssm install GastosFrontend "C:\path\to\node.exe"
nssm set GastosFrontend AppDirectory "C:\path\to\Gastos\frontend\dist"
nssm set GastosFrontend AppParameters "C:\Users\YourUser\AppData\Roaming\npm\node_modules\serve\bin\serve.js -s . -l 3000 -L"
nssm start GastosFrontend
```

## Using SQLite Database (Simpler Setup)

For a single-server deployment without PostgreSQL:

1. Edit `gastos/gastos/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

2. Run migrations:
```bash
cd gastos
python manage.py migrate
```

## Troubleshooting

### "Nothing renders when I open index.html"

❌ **Don't do this:** Double-clicking `index.html` won't work.

✅ **Do this:** Always serve via HTTP using the provided scripts.

### "API calls fail with CORS error"

Make sure:
1. Backend server is running
2. `constants.js` has correct backend IP
3. `settings.py` has frontend IP in CORS_ALLOWED_ORIGINS

### "Can't access from other devices"

Make sure:
1. Both servers use `0.0.0.0` to bind (not `localhost`)
2. Windows Firewall allows ports 8000 and 3000
3. You're using the correct IP addresses (not 127.0.0.1)

### Opening Firewall Ports (Windows)

```powershell
# Allow backend port
netsh advfirewall firewall add rule name="Gastos Backend" dir=in action=allow protocol=TCP localport=8000

# Allow frontend port
netsh advfirewall firewall add rule name="Gastos Frontend" dir=in action=allow protocol=TCP localport=3000
```

## Next Steps

Consider:
- **Docker**: Package both servers as containers
- **nginx**: Use nginx as reverse proxy for both services
- **Executables**: Use PyInstaller + Electron for standalone .exe files

See main README.md for more deployment options.
