from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from api.models import LoginAttempt


class Command(BaseCommand):
    help = 'Purge old LoginAttempt rows beyond retention window.'

    def handle(self, *args, **options):
        rl = getattr(settings, 'AUTH_RATE_LIMIT', {})
        retention_days = rl.get('RETENTION_DAYS', 30)
        cutoff = timezone.now() - timedelta(days=retention_days)
        deleted, _ = LoginAttempt.objects.filter(created_at__lt=cutoff).delete()
        self.stdout.write(self.style.SUCCESS(f'Purged {deleted} login attempt rows older than {retention_days} days.'))