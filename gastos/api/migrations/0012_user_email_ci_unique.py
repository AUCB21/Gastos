from django.db import migrations
from django.db.models import Q
from django.contrib.auth import get_user_model


def enforce_email_lowercase_unique(apps, schema_editor):
    User = get_user_model()
    # Detect duplicates by lowercase email; keep lowest id, blank others to allow constraint
    seen = {}
    duplicates = []
    for u in User.objects.exclude(email='').only('id', 'email').order_by('id'):
        key = u.email.lower()
        if key in seen:
            duplicates.append(u.id)
        else:
            seen[key] = u.id
    if duplicates:
        # Null out duplicate emails (could also append suffix) so constraint can be created
        User.objects.filter(id__in=duplicates).update(email='')


def reverse_noop(apps, schema_editor):
    # Irreversible (can't restore trimmed emails)
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0011_loginattempt'),
    ]

    operations = [
        migrations.RunPython(enforce_email_lowercase_unique, reverse_noop),
        migrations.RunSQL(
            sql=(
                "CREATE UNIQUE INDEX IF NOT EXISTS auth_user_email_ci_unique "
                "ON auth_user (LOWER(email)) WHERE email <> '';"
            ),
            reverse_sql="DROP INDEX IF EXISTS auth_user_email_ci_unique;"
        ),
    ]
