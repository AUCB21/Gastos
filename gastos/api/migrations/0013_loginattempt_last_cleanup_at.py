from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0012_user_email_ci_unique'),
    ]

    operations = [
        migrations.AddField(
            model_name='loginattempt',
            name='last_cleanup_at',
            field=models.DateTimeField(blank=True, null=True, help_text='Marca cuándo se realizó la última limpieza de intentos antiguos'),
        ),
    ]
