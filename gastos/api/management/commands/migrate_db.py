import os
import django
from django.conf import settings
from django.core.management import call_command
from django.db import connections

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gastos.settings")  # 🔹 cambia "tu_proyecto"

def migrate_pg_to_sqlite():
    print("🔹 Exportando datos desde PostgreSQL remoto...")
    # Dump en JSON usando la DB default (Render)
    with open("data.json", "w", encoding="utf-8") as f:
        call_command("dumpdata", "--natural-primary", "--natural-foreign", stdout=f)

    print("🔹 Cambiando conexión a SQLite...")
    # Sobreescribir DATABASES en runtime
    settings.DATABASES["default"] = {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": "db.sqlite3",
    }
    connections.databases = settings.DATABASES

    print("🔹 Aplicando migraciones en SQLite...")
    call_command("migrate", interactive=False)

    print("🔹 Importando datos en SQLite...")
    call_command("loaddata", "data.json")

    print("✅ Migración completa: PostgreSQL → SQLite (db.sqlite3)")


if __name__ == "__main__":
    django.setup()
    migrate_pg_to_sqlite()
