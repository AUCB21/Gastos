from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import TokenActivity


class Command(BaseCommand):
    help = 'Cleanup expired token activities and blacklisted tokens'

    def add_arguments(self, parser):
        parser.add_argument(
            '--timeout-minutes',
            type=int,
            default=60,
            help='Timeout in minutes for token expiration (default: 60)',
        )
        parser.add_argument(
            '--delete-old',
            action='store_true',
            help='Delete old token records instead of just marking as inactive',
        )
        parser.add_argument(
            '--days-to-keep',
            type=int,
            default=7,
            help='Number of days to keep old records before deletion (default: 7)',
        )

    def handle(self, *args, **options):
        timeout_minutes = options['timeout_minutes']
        delete_old = options['delete_old']
        days_to_keep = options['days_to_keep']

        self.stdout.write(
            self.style.SUCCESS(
                f'Starting cleanup with {timeout_minutes} minute timeout...'
            )
        )

        # Mark expired tokens as inactive
        expired_count = self._mark_expired_tokens(timeout_minutes)
        self.stdout.write(
            self.style.SUCCESS(
                f'Marked {expired_count} tokens as inactive due to timeout'
            )
        )

        # Optionally delete old records
        if delete_old:
            deleted_count = self._delete_old_records(days_to_keep)
            self.stdout.write(
                self.style.SUCCESS(
                    f'Deleted {deleted_count} old token records (older than {days_to_keep} days)'
                )
            )

        # Show statistics
        self._show_statistics()

    def _mark_expired_tokens(self, timeout_minutes):
        """Mark expired tokens as inactive."""
        timeout_delta = timedelta(minutes=timeout_minutes)
        cutoff_time = timezone.now() - timeout_delta
        
        expired_count = TokenActivity.objects.filter(
            last_activity__lt=cutoff_time,
            is_active=True
        ).update(is_active=False)
        
        return expired_count

    def _delete_old_records(self, days_to_keep):
        """Delete old token activity records."""
        cutoff_date = timezone.now() - timedelta(days=days_to_keep)
        
        deleted_count, _ = TokenActivity.objects.filter(
            created_at__lt=cutoff_date
        ).delete()
        
        return deleted_count

    def _show_statistics(self):
        """Show current token activity statistics."""
        total_tokens = TokenActivity.objects.count()
        active_tokens = TokenActivity.objects.filter(is_active=True).count()
        inactive_tokens = total_tokens - active_tokens
        
        self.stdout.write('\n' + '='*50)
        self.stdout.write('TOKEN ACTIVITY STATISTICS')
        self.stdout.write('='*50)
        self.stdout.write(f'Total token records: {total_tokens}')
        self.stdout.write(f'Active tokens: {active_tokens}')
        self.stdout.write(f'Inactive tokens: {inactive_tokens}')
        
        # Show most active users
        from django.db.models import Count
        top_users = TokenActivity.objects.filter(is_active=True).values(
            'user__username'
        ).annotate(
            token_count=Count('id')
        ).order_by('-token_count')[:5]
        
        if top_users:
            self.stdout.write('\nMost active users:')
            for user_data in top_users:
                username = user_data['user__username']
                count = user_data['token_count']
                self.stdout.write(f'  {username}: {count} active tokens')
        
        self.stdout.write('='*50)