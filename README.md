# Gastos


Expense tracking project with enhanced authentication & security features.

## Authentication Enhancements

Features:
* Login with either username or email (single `username` field accepted by token endpoint).
* Detailed auth error codes: `user_not_found`, `inactive_user`, `bad_password`, `too_many_attempts`.
* Rate limiting of failed logins (configurable via `AUTH_RATE_LIMIT` in `gastos/settings.py`).
* Remaining attempts returned on bad password responses (`remaining_attempts`).
* Login attempt tracking model with admin list & IP capture.
* Admin-only analytics endpoint: `GET /api/login-attempts/analytics/?hours=24`.
	* Includes `last_cleanup_at` timestamp showing when old attempts were last purged.
* Admin manual cleanup:
	* Django Admin action on LoginAttempt list: "Ejecutar limpieza de intentos antiguos".
	* API endpoint `POST /api/login-attempts/manual-cleanup/` returns `{deleted, last_cleanup_at}`.
* Management command to purge stale attempts: `python manage.py purge_login_attempts`.
* Case-insensitive unique email index (migration 0012) – empty emails allowed and ignored by constraint.

### Rate Limit Settings (`AUTH_RATE_LIMIT`)
```
AUTH_RATE_LIMIT = {
	'WINDOW_MINUTES': 10,   # Window for counting failures
	'MAX_FAILURES': 5,      # Failures allowed before temporary block
	'BLOCK_MINUTES': 15,    # Duration of block once threshold hit
	'RETENTION_DAYS': 30,   # Used by purge_login_attempts command
}
```

### Migration Notes
Migration `0012_user_email_ci_unique` creates a partial unique index on `LOWER(email)` for non-empty emails.
If duplicates existed, later user IDs had their email cleared to allow the index creation (irreversible).

### Testing
Extended test suite covers:
* Username & email login
* Duplicate email & weak password validation
* Rate limiting lockout & remaining attempts
* Analytics endpoint authorization & structure
* Cleanup marker + `last_cleanup_at` exposure
* Purge command behavior

Run tests:
```
python manage.py test api
```

Aplicación full‑stack para gestionar gastos personales y compartidos. Incluye backend en Django REST Framework con JWT y frontend en React (Vite + Tailwind). Permite registrar gastos, medios de pago, ver cotizaciones, autenticación con tokens y un sistema base para proyectos/grupos de gastos compartidos.

## ¿Qué hace y cómo funciona?

- Autenticación con JWT (login, refresh, logout con blacklist de tokens)
- Gestión de gastos (CRUD), filtrados por usuario autenticado
- Gestión de medios de pago (CRUD) por usuario
- Cotizaciones de dólar desde API externa
- Base de “Proyectos/Grupos” para compartir gastos entre varios usuarios (modelo listo para extender)
- Documentación OpenAPI y Swagger auto‑generadas

Arquitectura:
- Backend: Django 5 + DRF, app `api/`, JWT con `rest_framework_simplejwt`, CORS, Swagger (`drf_spectacular`), base de datos (local SQLite o remota PostgreSQL con `dj_database_url`).
- Frontend: React 19 con Vite, Tailwind 4, Axios con interceptor de tokens, router, y constantes en `frontend/src/constants.js`.

## Requisitos

- Python 3.13 (virtualenv en `env/` ya presente)
- Node.js 18+ (para el frontend)
- Variables de entorno en `.env` (ver abajo)

## Variables de entorno (backend)

Crear un archivo `.env` en `gastos/` (misma carpeta que `manage.py`) con al menos:

- `DJANGO_SECRET_KEY=clave-secreta`
- `DEBUG=True` para desarrollo local
- Opcional producción/PG: `DATABASE_URL=postgres://usuario:pass@host:puerto/db`

El backend admite dos configuraciones en `gastos/gastos/settings.py`:
- Producción/Remoto: `DATABASES['default'] = dj_database_url.config(default=os.getenv("DATABASE_URL"))`
- Local/SQLite: (descomentando el bloque de SQLite en `settings.py`) `ENGINE=django.db.backends.sqlite3`, `NAME=db.sqlite3`

## Ejecutar en local

1) Backend (Django):
- Activar venv e instalar dependencias si hace falta:
	- Windows (PowerShell):
		```powershell
		.\env\Scripts\Activate.ps1
		```
	- Windows (bash de Git):
		```bash
		source env/Scripts/activate
		```
- Migraciones y arranque:
	```bash
	cd gastos
	py manage.py migrate
	py manage.py runserver 0.0.0.0:8000
	```

2) Frontend (React):
- Instalar dependencias y correr el dev server:
	```bash
	cd frontend
	npm install
	npm run dev
	```
- Por defecto el frontend pega al backend en `http://localhost:8000` (ver `frontend/src/constants.js` → `API_URL`). Cambia esa constante si tu backend corre en otra URL.

## Endpoints principales (backend)

Base: `http://localhost:8000/`
- Swagger UI: `/swagger/` (OpenAPI en `/schema/`)
- Auth JWT:
	- `POST /api/token/` (login: recibe `username` y `password` o email según el serializer configurado)
	- `POST /api/token/refresh/`
	- `POST /api/logout/` (blacklist del refresh token)
- Usuarios:
	- `POST /api/user/register/`
	- `GET /api/user/` (datos del usuario autenticado)
- Gastos:
	- `GET/POST /api/gastos/`
	- `GET/PATCH/DELETE /api/gastos/{id}/`
- Medios de pago:
	- `GET/POST /api/medios-pago/`
	- `GET/PATCH/DELETE /api/medios-pago/{id}/`
- Cotización:
	- `GET /api/cotizacion/`

Notas:
- Todas las rutas (excepto registro y token) requieren JWT en `Authorization: Bearer <token>`.
- Los listados devuelven solo datos del usuario autenticado.

## Flujo del frontend

- Login obtiene `access` y `refresh`, los guarda en `localStorage`.
- Interceptor de Axios agrega `Authorization` y refresca tokens si expiran.
- Búsqueda en el NavBar resalta texto y hace scroll a coincidencias.
- Estructura con `LayoutWrapper`, rutas con `react-router-dom`.

## Despliegue

Backend (Render recomendado):
- Variables: `DJANGO_SECRET_KEY`, `DEBUG=False`, `DATABASE_URL` (PostgreSQL gestionado por Render)
- Build: instalar requirements (`pip install -r requirements.txt`)
- Start: `py manage.py migrate && py manage.py collectstatic --noinput && py manage.py runserver 0.0.0.0:$PORT`
- Archivos útiles: `render.yaml` y `start.sh`

Frontend (Vercel recomendado):
- Comando de build: `npm run build`
- Output: `.vercel`/dist según tu configuración (Vite genera `dist/`)
- Configura `API_URL` en producción: puedes reemplazar `frontend/src/constants.js` en CI/CD o usar variables de entorno y un paso de build.

## Migración de base de datos (PG → SQLite para local)

En la raíz de `gastos/` quedaron utilidades seguras:
- `safe_migration.py` → Exporta desde PostgreSQL e importa a SQLite con backups
	- Exportar (con `settings.py` apuntando a PG):
		```bash
		py safe_migration.py --export
		```
	- Importar (con `settings.py` apuntando a SQLite):
		```bash
		py safe_migration.py --import
		```

Sugerencias:
- Conserva los archivos `postgresql_backup_*.json` hasta confirmar tu entorno local.
- Si cambias `settings.py` entre PG/SQLite, recuerda reiniciar el servidor.

## Pruebas rápidas

Backend:
```bash
py manage.py check
py manage.py test
```

Frontend:
```bash
npm run lint
npm run build && npm run preview
```

## Troubleshooting

- Error “No module named django”: activa el venv correcto (ver sección Backend).
- CORS/CSRF en local: asegúrate que `http://localhost:5173` esté en `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS`.
- 401/403 en API: verifica que el `Authorization: Bearer <access>` esté presente; revisa refresco del token.
- Migraciones piden default de `created_at`: crea migración con un valor por única vez cuando lo solicite `makemigrations`.

## Licencia y autoría

Proyecto creado por AUCB21. Uso libre para aprendizaje y proyectos personales. Revisa `requirements.txt` para licencias de dependencias.