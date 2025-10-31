# Gastos - Expense Management System

Full-stack expense tracking application with JWT authentication.

**Stack:** Django 5.0 + DRF | React 19 + Vite | Tailwind CSS | PostgreSQL/SQLite

---

## Requirements

- Python 3.13+
- Node.js 18+
- PostgreSQL (production) or SQLite (development)

---

## Quick Start

### Backend Setup

```bash
# Activate virtual environment
source env/Scripts/activate  # Windows Git Bash
.\env\Scripts\Activate.ps1   # Windows PowerShell
source env/bin/activate      # Linux/macOS

# Install dependencies
cd gastos
pip install -r requirements.txt

# Configure environment (.env file in gastos/)
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
# DATABASE_URL=postgresql://user:pass@host:port/db  # For production

# Run migrations and start server
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Backend: `http://localhost:8000`
Swagger Docs: `http://localhost:8000/swagger/`
Admin: `http://localhost:8000/admin/`

### Frontend Setup

```bash
cd frontend
npm install

# Configure API URL in frontend/src/constants.js
export const API_URL = 'http://localhost:8000';

npm run dev
```

Frontend: `http://localhost:5173`

---

## API Endpoints

**Base URL:** `http://localhost:8000/api/`

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/token/` | Login (returns access & refresh tokens) | No |
| POST | `/api/token/refresh/` | Refresh access token | No |
| POST | `/api/logout/` | Blacklist refresh token | Yes |
| POST | `/api/user/register/` | Create user account | No |
| GET | `/api/user/` | Get current user info | Yes |

### Expenses (Gastos)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/gastos/` | List user expenses | Yes |
| POST | `/api/gastos/` | Create expense | Yes |
| GET | `/api/gastos/{id}/` | Get expense detail | Yes |
| PATCH | `/api/gastos/{id}/` | Update expense | Yes |
| DELETE | `/api/gastos/{id}/` | Delete expense | Yes |

### Payment Methods (Medios de Pago)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/medios-pago/` | List payment methods | Yes |
| POST | `/api/medios-pago/` | Create payment method | Yes |
| GET | `/api/medios-pago/{id}/` | Get payment method | Yes |
| PATCH | `/api/medios-pago/{id}/` | Update payment method | Yes |
| DELETE | `/api/medios-pago/{id}/` | Delete payment method | Yes |

### Other
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cotizacion/` | Get currency rates | Yes |
| GET | `/api/login-attempts/analytics/` | Login analytics (admin) | Yes |

**Authentication Header:** All authenticated endpoints require:
```
Authorization: Bearer <access_token>
```

---

## Example Usage

### Login
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "user@example.com", "password": "password123"}'
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLC...",
  "refresh": "eyJ0eXAiOiJKV1QiLC..."
}
```

### Create Expense
```bash
curl -X POST http://localhost:8000/api/gastos/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Grocery Shopping",
    "monto": "150.00",
    "moneda": "USD",
    "categoria": "alimentacion",
    "fecha": "2025-10-30",
    "medio_pago": 1
  }'
```

---

## Project Structure

```
gastos/
├── gastos/              # Django backend
│   ├── api/            # REST API (models, views, serializers)
│   ├── gastos/         # Settings & configuration
│   └── manage.py
├── frontend/           # React frontend
│   └── src/
│       ├── features/   # gastos, grupos, medios-pago
│       ├── shared/     # Shared components
│       └── contexts/   # Global state (UserContext)
```

---

## Configuration

### Authentication Rate Limiting
Configure in `gastos/gastos/settings.py`:
```python
AUTH_RATE_LIMIT = {
    'WINDOW_MINUTES': 10,   # Window for counting failures
    'MAX_FAILURES': 5,      # Max failures before block
    'BLOCK_MINUTES': 15,    # Block duration
    'RETENTION_DAYS': 30,   # Data retention
}
```

### CORS Settings
Add your frontend URL to `CORS_ALLOWED_ORIGINS` in `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://your-frontend-domain.com",
]
```

### Database Switching

**SQLite (Development):**
```python
# gastos/gastos/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

**PostgreSQL (Production):**
```python
# .env file
DATABASE_URL=postgresql://user:password@host:port/dbname
```

---

## Testing

```bash
# Backend tests
cd gastos
python manage.py test

# Frontend build test
cd frontend
npm run build
```

---

## Deployment

### Backend (Render)
**Environment Variables:**
```
DJANGO_SECRET_KEY=<strong-secret>
DEBUG=False
DATABASE_URL=<postgres-url>
```

**Start Command:**
```bash
python manage.py migrate && \
python manage.py collectstatic --noinput && \
gunicorn gastos.wsgi:application --bind 0.0.0.0:$PORT
```

### Frontend (Vercel)
- Framework: Vite
- Root: `frontend`
- Build: `npm run build`
- Output: `dist`

Update `frontend/src/constants.js` with production backend URL.

---

## Common Issues

**"No module named django"** → Activate virtual environment
**CORS errors** → Add frontend URL to `CORS_ALLOWED_ORIGINS`
**401 errors** → Check `Authorization: Bearer <token>` header
**Connection refused** → Verify backend is running on correct port

---

## Additional Resources

- **Swagger UI:** `http://localhost:8000/swagger/`
- **OpenAPI Schema:** `http://localhost:8000/schema/`
- **Django Admin:** `http://localhost:8000/admin/`

---

## License

Created by AUCB21. Free for educational and personal use.
