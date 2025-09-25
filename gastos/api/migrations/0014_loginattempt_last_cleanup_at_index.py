from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0013_loginattempt_last_cleanup_at'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='loginattempt',
            index=models.Index(fields=['last_cleanup_at'], name='api_login_attempt_lastcleanup_idx'),
        ),
    ]
