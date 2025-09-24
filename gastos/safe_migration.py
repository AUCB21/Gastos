#!/usr/bin/env python
"""
SAFE Database Migration Tool
This script helps you safely migrate from PostgreSQL to SQLite without losing data.
"""

import os
import sys
import django
import datetime
from pathlib import Path

# Add the project root to the path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gastos.settings")

def create_backup_from_postgresql():
    """
    Step 1: Export data from PostgreSQL (requires PostgreSQL config in settings.py)
    """
    
    print("🗄️  EXPORTACIÓN SEGURA DESDE POSTGRESQL")
    print("=" * 50)
    print()
    
    print("VERIFICACIÓN PREVIA:")
    print("1. ¿Está settings.py configurado para PostgreSQL? (DATABASE_URL)")
    print("2. ¿Tienes conexión a tu base de datos remota?")
    print()
    
    response = input("¿Continuar con la exportación? (y/n): ").lower()
    if response not in ['y', 'yes']:
        print("Exportación cancelada.")
        return False
    
    try:
        django.setup()
        from django.core.management import call_command
        
        # Check database connection
        from django.db import connection
        current_db = connection.settings_dict['ENGINE']
        
        if 'postgresql' not in current_db:
            print(f"⚠️  ADVERTENCIA: No estás conectado a PostgreSQL")
            print(f"   Base de datos actual: {current_db}")
            print("   Necesitas cambiar settings.py para conectar a PostgreSQL")
            return False
        
        print(f"✓ Conectado a PostgreSQL: {connection.settings_dict.get('NAME', 'unknown')}")
        
        # Create timestamped backup
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"postgresql_backup_{timestamp}.json"
        
        print(f"📤 Exportando datos a: {backup_filename}")
        
        with open(backup_filename, "w", encoding="utf-8") as f:
            call_command("dumpdata", 
                        "--natural-primary", 
                        "--natural-foreign",
                        "--exclude=auth.permission",
                        "--exclude=contenttypes", 
                        "--exclude=admin.logentry",
                        "--exclude=sessions.session",
                        "--exclude=token_blacklist.blacklistedtoken",
                        "--exclude=token_blacklist.outstandingtoken",
                        stdout=f,
                        verbosity=2)
        
        # Verify backup
        backup_size = os.path.getsize(backup_filename) / 1024
        print(f"✅ Backup creado exitosamente!")
        print(f"   Archivo: {backup_filename}")
        print(f"   Tamaño: {backup_size:.1f} KB")
        
        # Also create a generic backup name for easy reference
        import shutil
        shutil.copy2(backup_filename, "latest_postgresql_backup.json")
        print(f"✓ Copia creada: latest_postgresql_backup.json")
        
        return backup_filename
        
    except Exception as e:
        print(f"❌ Error durante la exportación: {e}")
        import traceback
        traceback.print_exc()
        return False


def import_to_sqlite(backup_filename=None):
    """
    Step 2: Import data to SQLite (requires SQLite config in settings.py)
    """
    
    print("📥 IMPORTACIÓN SEGURA A SQLITE")
    print("=" * 40)
    print()
    
    # Find backup file
    if not backup_filename:
        backup_files = []
        for file in os.listdir('.'):
            if ('postgresql_backup' in file or 'database_backup' in file) and file.endswith('.json'):
                backup_files.append(file)
        
        if not backup_files:
            print("❌ No se encontraron archivos de backup")
            print("   Archivos buscados: postgresql_backup_*.json, database_backup*.json")
            return False
        
        if len(backup_files) == 1:
            backup_filename = backup_files[0]
        else:
            print("📁 Archivos de backup encontrados:")
            for i, file in enumerate(backup_files):
                size = os.path.getsize(file) / 1024
                print(f"   {i+1}. {file} ({size:.1f} KB)")
            
            choice = int(input("Selecciona el archivo a importar (número): "))
            backup_filename = backup_files[choice-1]
    
    print(f"📂 Usando archivo: {backup_filename}")
    
    # Verify backup file exists
    if not os.path.exists(backup_filename):
        print(f"❌ El archivo {backup_filename} no existe")
        return False
    
    try:
        django.setup()
        from django.core.management import call_command
        from django.db import connection
        
        # Check database configuration
        current_db = connection.settings_dict['ENGINE']
        if 'sqlite3' not in current_db:
            print(f"⚠️  ADVERTENCIA: No estás usando SQLite")
            print(f"   Base de datos actual: {current_db}")
            print("   Necesitas cambiar settings.py para usar SQLite")
            response = input("¿Continuar de todas formas? (y/n): ").lower()
            if response not in ['y', 'yes']:
                return False
        
        db_path = connection.settings_dict.get('NAME')
        print(f"📍 Base de datos SQLite: {db_path}")
        
        # Backup existing SQLite database if it exists
        if os.path.exists(db_path):
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_db_name = f"db_backup_{timestamp}.sqlite3"
            import shutil
            shutil.copy2(db_path, backup_db_name)
            print(f"🔄 Base de datos existente respaldada como: {backup_db_name}")
            
            # Remove current database
            os.remove(db_path)
            print("🗑️  Base de datos anterior eliminada")
        
        # Create new database
        print("🔨 Creando nueva base de datos SQLite...")
        call_command("migrate", verbosity=1, interactive=False)
        print("✅ Base de datos creada con todas las tablas")
        
        # Import data
        print("📥 Importando datos...")
        backup_size = os.path.getsize(backup_filename) / 1024
        print(f"   Archivo: {backup_filename} ({backup_size:.1f} KB)")
        
        call_command("loaddata", backup_filename, verbosity=2)
        print("✅ Datos importados exitosamente")
        
        # Verify import
        print("🔍 Verificando importación...")
        from django.contrib.auth.models import User
        from api.models import Gasto, MedioPago
        
        user_count = User.objects.count()
        gasto_count = Gasto.objects.count()
        medio_count = MedioPago.objects.count()
        
        print(f"📊 Usuarios: {user_count}")
        print(f"📊 Gastos: {gasto_count}")
        print(f"📊 Medios de pago: {medio_count}")
        
        if user_count > 0 or gasto_count > 0:
            print("🎉 IMPORTACIÓN EXITOSA!")
            print(f"💾 Base de datos SQLite lista en: {db_path}")
        else:
            print("⚠️  No se importaron datos. Verifica el archivo de backup.")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error durante la importación: {e}")
        import traceback
        traceback.print_exc()
        return False


def show_instructions():
    """
    Show step-by-step instructions
    """
    print("📋 INSTRUCCIONES PARA MIGRACIÓN SEGURA")
    print("=" * 50)
    print()
    print("PASO A: EXPORTAR DESDE POSTGRESQL")
    print("1. Configura settings.py para PostgreSQL:")
    print("   DATABASES = {")
    print("       'default': dj_database_url.config(")
    print("           default=os.getenv('DATABASE_URL')")
    print("       )")
    print("   }")
    print("2. Ejecuta: python safe_migration.py --export")
    print()
    print("PASO B: IMPORTAR A SQLITE")
    print("1. Configura settings.py para SQLite:")
    print("   DATABASES = {")
    print("       'default': {")
    print("           'ENGINE': 'django.db.backends.sqlite3',")
    print("           'NAME': BASE_DIR / 'db.sqlite3',")
    print("       }")
    print("   }")
    print("2. Ejecuta: python safe_migration.py --import")
    print()
    print("💡 TIP: Mantén siempre los archivos de backup hasta verificar que todo funciona")


if __name__ == "__main__":
    print("🔒 HERRAMIENTA DE MIGRACIÓN SEGURA")
    print("   PostgreSQL → SQLite")
    print()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--export":
            backup_file = create_backup_from_postgresql()
            if backup_file:
                print()
                print("✅ Exportación completada!")
                print("📋 Próximos pasos:")
                print("1. Cambia settings.py para usar SQLite")
                print("2. Ejecuta: python safe_migration.py --import")
        
        elif sys.argv[1] == "--import":
            success = import_to_sqlite()
            if success:
                print()
                print("🎉 MIGRACIÓN COMPLETADA!")
                print("📋 Próximos pasos:")
                print("1. Ejecuta: python manage.py runserver") 
                print("2. Verifica que tu aplicación funcione correctamente")
        
        elif sys.argv[1] == "--help":
            show_instructions()
            
    else:
        show_instructions()
        print()
        print("💻 OPCIONES:")
        print("  python safe_migration.py --export   (Exportar desde PostgreSQL)")
        print("  python safe_migration.py --import   (Importar a SQLite)")
        print("  python safe_migration.py --help     (Ver instrucciones detalladas)")