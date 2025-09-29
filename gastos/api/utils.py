from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from django.db import transaction
from .models import LoginAttempt

CLEANUP_INTERVAL_HOURS = 24

def check_attempts():
    """Conditionally delete old LoginAttempt rows (older than retention days).

    Uses a single row marker pattern: we locate the most recent LoginAttempt
    that has a non-null last_cleanup_at timestamp. If it is within the last
    CLEANUP_INTERVAL_HOURS, we skip cleanup. Otherwise we perform deletion
    and stamp the current attempt with last_cleanup_at.

    Returns the number of rows deleted (0 if skipped).
    """
    now = timezone.now()
    retention_days = getattr(settings, 'AUTH_RATE_LIMIT', {}).get('RETENTION_DAYS', 30)
    cutoff = now - timedelta(days=retention_days)

    # Find last cleanup marker
    last_marker = LoginAttempt.objects.filter(last_cleanup_at__isnull=False).order_by('-last_cleanup_at').first()
    if last_marker and (now - last_marker.last_cleanup_at) < timedelta(hours=CLEANUP_INTERVAL_HOURS):
        return 0  # Skip; still within interval

    # Perform cleanup in a transaction
    with transaction.atomic():
        deleted, _ = LoginAttempt.objects.filter(created_at__lt=cutoff).delete()
        # Create a marker attempt (no identifier relevance) OR reuse latest success soon after login by stamping later in serializer
        marker = LoginAttempt.objects.create(identifier='__maintenance__', successful=True, last_cleanup_at=now)
    return deleted
