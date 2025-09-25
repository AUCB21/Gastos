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
