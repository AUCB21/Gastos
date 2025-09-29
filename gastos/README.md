# Gastos Backend (Django API)

This README focuses on the backend service inside the `gastos/` directory. For overall project context (frontend + backend), see the root-level `README.md`.

## Key Features

- JWT Authentication (SimpleJWT) with username or email login
- Detailed error codes: `user_not_found`, `inactive_user`, `bad_password`, `too_many_attempts`
- Rate limiting of failed logins (configurable)
- Remaining attempts feedback on bad password
- Login attempt tracking with IP & analytics endpoint
- Opportunistic and manual cleanup of stale login attempts (`RETENTION_DAYS` based)
- Case-insensitive unique email index (partial, ignores empty emails)
- Admin panel enhancements: LoginAttempt list, manual cleanup action, token activity management

## Important Settings

```
AUTH_RATE_LIMIT = {
  'WINDOW_MINUTES': 10,   # Failure counting window
  'MAX_FAILURES': 5,      # Allowed failures before block
  'BLOCK_MINUTES': 15,    # Temporary block duration
  'RETENTION_DAYS': 30,   # Age threshold for purging login attempts
}
```

## Authentication Endpoints

| Method | Path                                  | Description |
|--------|---------------------------------------|-------------|
| POST   | `/api/token/`                         | Obtain access + refresh (username or email in `username` field) |
| POST   | `/api/token/refresh/`                 | Refresh access token |
| GET    | `/api/login-attempts/analytics/`      | Admin-only aggregated attempt stats |
| POST   | `/api/login-attempts/manual-cleanup/` | Admin-only forced purge of stale attempts |

## Cleanup Logic

1. Every successful login calls a conditional cleanup (`check_attempts`) that:
   - Skips if a cleanup happened within last 24h (tracked via `LoginAttempt.last_cleanup_at`).
   - Otherwise deletes rows older than `RETENTION_DAYS` and stamps a marker attempt.
2. Admin manual cleanup endpoint bypasses the 24h interval.
3. Admin action in Django admin: "Ejecutar limpieza de intentos antiguos" triggers the same logic (interval-aware).

## Analytics Response Shape
```json
{
  "window_hours": 24,
  "total_attempts": 42,
  "failures": 30,
  "successes": 12,
  "failure_rate": 0.7142857,
  "top_identifiers": [{"identifier": "user@example.com", "fails": 5}],
  "top_ips": [{"ip_address": "203.0.113.10", "fails": 9}],
  "last_cleanup_at": "2025-09-25T12:34:56.789Z"
}
```

## Management Commands

| Command | Purpose |
|---------|---------|
| `python manage.py purge_login_attempts` | Force deletion of attempts older than retention days (independent of interval marker). |

## Migrations of Interest

| Migration | Purpose |
|-----------|---------|
| `0011_loginattempt` | Introduces `LoginAttempt` model |
| `0012_user_email_ci_unique` | Adds partial case-insensitive unique index on `auth_user.email` |
| `0013_loginattempt_last_cleanup_at` | Adds cleanup marker field |
| `0014_loginattempt_last_cleanup_at_index` | Adds index on `last_cleanup_at` |

## Admin Panel Enhancements

- `LoginAttemptAdmin` shows: identifier, IP, success flag, timestamps, `last_cleanup_at` if marker.
- Action: "Ejecutar limpieza de intentos antiguos".
- `TokenActivityAdmin` actions to activate/deactivate and cleanup old tokens.

## Testing

Run backend tests:
```
python manage.py test api -v 2
```
Current suites cover: auth flows, rate limiting, analytics structure, purge command, cleanup metadata exposure.

## Future Ideas
- Add IP + identifier combined throttling
- Expose lockout decay time in responses
- Paginate analytics / add time granularity
- Add health endpoint summarizing auth subsystem state

---
Maintained as part of the Gastos project. Update this file when backend behavior changes.
