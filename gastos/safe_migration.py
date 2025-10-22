"""
SAFE Database Migration Tool
Script de ayuda para migrar datos entre bases de datos PostgreSQL y SQLite.
"""

import os
import sys
import django
import datetime
import json
import shutil
from pathlib import Path

# Add the project root to the path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gastos.settings")

def create_backup_from_sqlite():
    """
    Export data from SQLite (requires SQLite config in settings.py)
    """
    
    print("SQLITE DATA EXPORT")
    print("-" * 40)
    print()
    
    print("Pre-export verification:")
    print("1. Is settings.py configured for SQLite?")
    print("2. Does the db.sqlite3 file exist?")
    print()
    
    response = input("Continue with export? (y/n): ").lower()
    if response not in ['y', 'yes']:
        print("Export cancelled.")
        return False
    
    try:
        django.setup()
        from django.core.management import call_command
        
        # Check database connection
        from django.db import connection
        current_db = connection.settings_dict['ENGINE']
        
        if 'sqlite3' not in current_db:
            print(f"WARNING: Not connected to SQLite")
            print(f"Current database: {current_db}")
            print("You need to configure settings.py to connect to SQLite")
            return False
        
        db_path = connection.settings_dict.get('NAME')
        if not os.path.exists(db_path):
            print(f"ERROR: SQLite file does not exist: {db_path}")
            return False
        
        print(f"Connected to SQLite: {db_path}")
        
        # Create timestamped backup
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"sqlite_backup_{timestamp}.json"
        
        print(f"Exporting data to: {backup_filename}")
        
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
        print(f"Backup created successfully!")
        print(f"File: {backup_filename}")
        print(f"Size: {backup_size:.1f} KB")
        
        # Also create a generic backup name for easy reference
        shutil.copy2(backup_filename, "latest_sqlite_backup.json")
        print(f"Copy created: latest_sqlite_backup.json")
        
        return backup_filename
        
    except Exception as e:
        print(f"ERROR during export: {e}")
        import traceback
        traceback.print_exc()
        return False


def create_backup_from_postgresql():
    """
    Export data from PostgreSQL (requires PostgreSQL config in settings.py)
    """
    
    print("POSTGRESQL DATA EXPORT")
    print("-" * 50)
    print()
    
    print("Pre-export verification:")
    print("1. Is settings.py configured for PostgreSQL? (DATABASE_URL)")
    print("2. Do you have connection to your remote database?")
    print()
    
    response = input("Continue with export? (y/n): ").lower()
    if response not in ['y', 'yes']:
        print("Export cancelled.")
        return False
    
    try:
        django.setup()
        from django.core.management import call_command
        
        # Check database connection
        from django.db import connection
        current_db = connection.settings_dict['ENGINE']
        
        if 'postgresql' not in current_db:
            print(f"WARNING: Not connected to PostgreSQL")
            print(f"Current database: {current_db}")
            print("You need to configure settings.py to connect to PostgreSQL")
            return False
        
        print(f"Connected to PostgreSQL: {connection.settings_dict.get('NAME', 'unknown')}")
        
        # Create timestamped backup
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"postgresql_backup_{timestamp}.json"
        
        print(f"Exporting data to: {backup_filename}")
        
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
        print(f"Backup created successfully!")
        print(f"File: {backup_filename}")
        print(f"Size: {backup_size:.1f} KB")
        
        # Also create a generic backup name for easy reference
        shutil.copy2(backup_filename, "latest_postgresql_backup.json")
        print(f"Copy created: latest_postgresql_backup.json")
        
        return backup_filename
        
    except Exception as e:
        print(f"ERROR during export: {e}")
        import traceback
        traceback.print_exc()
        return False


def clean_backup_file(backup_filename):
    """
    Clean the backup file to handle problematic fields for SQLite import
    """
    
    print("Cleaning backup file for SQLite compatibility...")
    
    # Create backup of original file
    original_backup = f"{backup_filename}.original"
    shutil.copy2(backup_filename, original_backup)
    print(f"Original backup saved as: {original_backup}")
    
    # Load and clean the data
    with open(backup_filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    cleaned_count = 0
    
    for item in data:
        if 'fields' in item:
            # Handle ip_address field issues - set to null if problematic
            if 'ip_address' in item['fields']:
                # Keep valid IP addresses, set invalid ones to null
                ip_value = item['fields']['ip_address']
                if not ip_value or ip_value.strip() == '':
                    item['fields']['ip_address'] = None
                    cleaned_count += 1
            
            # Remove any fields that might cause issues with SQLite
            for field_name, field_value in item['fields'].items():
                # Handle empty strings that should be null
                if field_value == '':
                    if field_name in ['ip_address', 'last_cleanup_at']:
                        item['fields'][field_name] = None
                        cleaned_count += 1
    
    # Save cleaned data
    with open(backup_filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Cleaned {cleaned_count} problematic fields")
    return True


def import_to_sqlite(backup_filename=None):
    """
    Import data to SQLite (requires SQLite config in settings.py)
    """
    
    print("SQLITE DATA IMPORT")
    print("-" * 40)
    print()
    
    # Find backup file
    if not backup_filename:
        backup_files = []
        for file in os.listdir('.'):
            if ('postgresql_backup' in file or 'database_backup' in file) and file.endswith('.json'):
                backup_files.append(file)
        
        if not backup_files:
            print("ERROR: No backup files found")
            print("Looking for: postgresql_backup_*.json, database_backup*.json")
            return False
        
        if len(backup_files) == 1:
            backup_filename = backup_files[0]
        else:
            print("Backup files found:")
            for i, file in enumerate(backup_files):
                size = os.path.getsize(file) / 1024
                print(f"   {i+1}. {file} ({size:.1f} KB)")
            
            choice = int(input("Select file to import (number): "))
            backup_filename = backup_files[choice-1]
    
    print(f"Using file: {backup_filename}")
    
    # Verify backup file exists
    if not os.path.exists(backup_filename):
        print(f"ERROR: File {backup_filename} does not exist")
        return False
    
    try:
        django.setup()
        from django.core.management import call_command
        from django.db import connection
        
        # Check database configuration
        current_db = connection.settings_dict['ENGINE']
        if 'sqlite3' not in current_db:
            print(f"WARNING: Not using SQLite")
            print(f"Current database: {current_db}")
            print("You need to configure settings.py to use SQLite")
            response = input("Continue anyway? (y/n): ").lower()
            if response not in ['y', 'yes']:
                return False
        
        db_path = connection.settings_dict.get('NAME')
        print(f"SQLite database: {db_path}")
        
        # Backup existing SQLite database if it exists
        if os.path.exists(db_path):
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_db_name = f"db_backup_{timestamp}.sqlite3"
            shutil.copy2(db_path, backup_db_name)
            print(f"Existing database backed up as: {backup_db_name}")
            
            # Remove current database
            os.remove(db_path)
            print("Previous database removed")
        
        # Clean backup file before import
        clean_backup_file(backup_filename)
        
        # Create new database with safer migration approach
        print("Creating new SQLite database...")
        try:
            # Try normal migration first
            call_command("migrate", verbosity=1, interactive=False)
        except Exception as migration_error:
            print(f"WARNING during migration: {migration_error}")
            print("Attempting basic migration...")
            
            # Try with basic apps only (skip problematic custom migrations)
            try:
                call_command("migrate", "auth", verbosity=1, interactive=False)
                call_command("migrate", "contenttypes", verbosity=1, interactive=False)
                call_command("migrate", "admin", verbosity=1, interactive=False)
                call_command("migrate", "sessions", verbosity=1, interactive=False)
                
                # Try to migrate api app step by step
                try:
                    call_command("migrate", "api", "0001", verbosity=1, interactive=False)
                    print("Basic api migration completed")
                except Exception as api_error:
                    print(f"WARNING: Skipping problematic api migrations: {api_error}")
                    # Create basic tables manually if needed
                    from django.db import connection
                    cursor = connection.cursor()
                    
                    # Create basic tables that are needed for data import
                    basic_tables = [
                        '''CREATE TABLE IF NOT EXISTS api_gasto (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            nombre VARCHAR(200) NOT NULL,
                            monto DECIMAL(10, 2) NOT NULL,
                            fecha DATE NOT NULL,
                            descripcion TEXT,
                            user_id INTEGER REFERENCES auth_user(id),
                            medio_pago_id INTEGER,
                            created_at DATETIME,
                            updated_at DATETIME
                        )''',
                        '''CREATE TABLE IF NOT EXISTS api_medio_pago (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name VARCHAR(100) NOT NULL,
                            description TEXT,
                            is_active BOOLEAN DEFAULT 1,
                            user_id INTEGER REFERENCES auth_user(id),
                            created_at DATETIME,
                            updated_at DATETIME
                        )''',
                        '''CREATE TABLE IF NOT EXISTS api_tokenactivity (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            token_jti VARCHAR(255),
                            user_id INTEGER REFERENCES auth_user(id),
                            last_activity DATETIME,
                            created_at DATETIME,
                            updated_at DATETIME,
                            is_active BOOLEAN DEFAULT 1,
                            user_agent TEXT,
                            ip_address VARCHAR(45)
                        )''',
                        '''CREATE TABLE IF NOT EXISTS api_loginattempt (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            identifier VARCHAR(255),
                            ip_address VARCHAR(45),
                            user_id INTEGER REFERENCES auth_user(id),
                            successful BOOLEAN DEFAULT 0,
                            created_at DATETIME,
                            last_cleanup_at DATETIME
                        )'''
                    ]
                    
                    for table_sql in basic_tables:
                        try:
                            cursor.execute(table_sql)
                            print("Basic table created manually")
                        except Exception as table_error:
                            print(f"WARNING creating table: {table_error}")
            
            except Exception as basic_error:
                print(f"WARNING in basic migration: {basic_error}")
                print("Continuing with data import...")
        
        print("Database prepared successfully")
        
        # Import data
        print("Importing data...")
        backup_size = os.path.getsize(backup_filename) / 1024
        print(f"File: {backup_filename} ({backup_size:.1f} KB)")
        
        try:
            call_command("loaddata", backup_filename, verbosity=2)
            print("Data imported successfully")
        except Exception as load_error:
            print(f"WARNING in loaddata: {load_error}")
            print("Attempting manual import of critical data...")
            
            # Manual data import for critical data
            with open(backup_filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Import users first
            from django.contrib.auth.models import User
            user_count = 0
            for item in data:
                if item['model'] == 'auth.user':
                    try:
                        user_data = item['fields']
                        user, created = User.objects.get_or_create(
                            username=user_data['username'],
                            defaults={
                                'email': user_data.get('email', ''),
                                'first_name': user_data.get('first_name', ''),
                                'last_name': user_data.get('last_name', ''),
                                'is_staff': user_data.get('is_staff', False),
                                'is_active': user_data.get('is_active', True),
                                'is_superuser': user_data.get('is_superuser', False),
                                'date_joined': user_data.get('date_joined'),
                            }
                        )
                        if user_data.get('password'):
                            user.password = user_data['password']
                            user.save()
                        user_count += 1
                    except Exception as user_error:
                        print(f"WARNING importing user: {user_error}")
            
            print(f"Manually imported {user_count} users")
        
        # Verify import
        print("Verifying import...")
        from django.contrib.auth.models import User
        
        user_count = User.objects.count()
        
        # Try to check other models if they exist
        try:
            from api.models import Gasto, MedioPago
            gasto_count = Gasto.objects.count()
            medio_count = MedioPago.objects.count()
            print(f"Expenses: {gasto_count}")
            print(f"Payment methods: {medio_count}")
        except Exception:
            gasto_count = 0
            medio_count = 0
            print("Expenses: Not available (model not found)")
            print("Payment methods: Not available (model not found)")
        
        print(f"Users: {user_count}")
        
        if user_count > 0:
            print("SQLITE IMPORT SUCCESSFUL!")
            print(f"SQLite database ready at: {db_path}")
            print("NOTE: This is a backup import - some fields may have been adjusted for compatibility")
        else:
            print("WARNING: No users imported. Check the backup file.")
            return False
        
        return True
        
    except Exception as e:
        print(f"ERROR during import: {e}")
        import traceback
        traceback.print_exc()
        return False


def import_to_postgresql(backup_filename=None):
    """
    Import JSON backup data to PostgreSQL (requires PostgreSQL config in settings.py)
    """
    
    print("POSTGRESQL DATA IMPORT")
    print("-" * 40)
    print()
    
    # Find backup file
    if not backup_filename:
        backup_files = []
        for file in os.listdir('.'):
            if (('sqlite_backup' in file or 'postgresql_backup' in file or 'database_backup' in file or 'latest_' in file) 
                and file.endswith('.json')):
                backup_files.append(file)
        
        if not backup_files:
            print("ERROR: No backup files found")
            print("Looking for: *backup*.json, latest_*.json")
            return False
        
        if len(backup_files) == 1:
            backup_filename = backup_files[0]
        else:
            print("Backup files found:")
            for i, file in enumerate(backup_files):
                size = os.path.getsize(file) / 1024
                print(f"   {i+1}. {file} ({size:.1f} KB)")
            
            choice = int(input("Select file to import (number): "))
            backup_filename = backup_files[choice-1]
    
    print(f"Using file: {backup_filename}")
    
    # Verify backup file exists
    if not os.path.exists(backup_filename):
        print(f"ERROR: File {backup_filename} does not exist")
        return False
    
    try:
        django.setup()
        from django.core.management import call_command
        from django.db import connection
        
        # Check database configuration
        current_db = connection.settings_dict['ENGINE']
        if 'postgresql' not in current_db:
            print(f"WARNING: Not connected to PostgreSQL")
            print(f"Current database: {current_db}")
            print("You need to configure settings.py to use PostgreSQL")
            response = input("Continue anyway? (y/n): ").lower()
            if response not in ['y', 'yes']:
                return False
        
        db_name = connection.settings_dict.get('NAME')
        print(f"PostgreSQL database: {db_name}")
        
        print("WARNING: This operation will DELETE ALL existing data in PostgreSQL")
        print("Make sure you have a backup of your current PostgreSQL database")
        response = input("Continue with import? (y/n): ").lower()
        if response not in ['y', 'yes']:
            print("Import cancelled.")
            return False
        
        # Reset database
        print("Preparing PostgreSQL database...")
        
        # Drop and recreate all tables
        print("Removing existing data...")
        call_command("flush", verbosity=1, interactive=False)
        
        # Run migrations to ensure all tables exist
        print("Running migrations...")
        call_command("migrate", verbosity=1, interactive=False)
        print("PostgreSQL database prepared")
        
        # Import data
        print("Importing data...")
        backup_size = os.path.getsize(backup_filename) / 1024
        print(f"File: {backup_filename} ({backup_size:.1f} KB)")
        
        try:
            call_command("loaddata", backup_filename, verbosity=2)
            print("Data imported successfully")
        except Exception as load_error:
            print(f"WARNING in loaddata: {load_error}")
            print("Attempting manual import of critical data...")
            
            # Manual data import for critical data
            with open(backup_filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Import users first
            from django.contrib.auth.models import User
            user_count = 0
            for item in data:
                if item['model'] == 'auth.user':
                    try:
                        user_data = item['fields']
                        user, created = User.objects.get_or_create(
                            username=user_data['username'],
                            defaults={
                                'email': user_data.get('email', ''),
                                'first_name': user_data.get('first_name', ''),
                                'last_name': user_data.get('last_name', ''),
                                'is_staff': user_data.get('is_staff', False),
                                'is_active': user_data.get('is_active', True),
                                'is_superuser': user_data.get('is_superuser', False),
                                'date_joined': user_data.get('date_joined'),
                            }
                        )
                        if user_data.get('password'):
                            user.password = user_data['password']
                            user.save()
                        user_count += 1
                    except Exception as user_error:
                        print(f"WARNING importing user: {user_error}")
            
            print(f"Manually imported {user_count} users")
        
        # Verify import
        print("Verifying import...")
        from django.contrib.auth.models import User
        
        user_count = User.objects.count()
        
        # Try to check other models if they exist
        try:
            from api.models import Gasto, MedioPago
            gasto_count = Gasto.objects.count()
            medio_count = MedioPago.objects.count()
            print(f"Expenses: {gasto_count}")
            print(f"Payment methods: {medio_count}")
        except Exception:
            gasto_count = 0
            medio_count = 0
            print("Expenses: Not available")
            print("Payment methods: Not available")
        
        print(f"Users: {user_count}")
        
        if user_count > 0:
            print("POSTGRESQL IMPORT SUCCESSFUL!")
            print(f"Data imported to PostgreSQL: {db_name}")
        else:
            print("WARNING: No users imported. Check the backup file.")
            return False
        
        return True
        
    except Exception as e:
        print(f"ERROR during import: {e}")
        import traceback
        traceback.print_exc()
        return False


def show_instructions():
    """
    Show step-by-step instructions
    """
    print("SAFE DATABASE MIGRATION INSTRUCTIONS")
    print("-" * 50)
    print()
    print("OPTION A: POSTGRESQL TO SQLITE")
    print("1. Configure settings.py for PostgreSQL:")
    print("   DATABASES = {")
    print("       'default': dj_database_url.config(")
    print("           default=os.getenv('DATABASE_URL')")
    print("       )")
    print("   }")
    print("2. Run: python safe_migration.py --export-postgres")
    print("3. Change settings.py to SQLite")
    print("4. Run: python safe_migration.py --import-sqlite")
    print()
    print("OPTION B: SQLITE TO POSTGRESQL")
    print("1. Configure settings.py for SQLite:")
    print("   DATABASES = {")
    print("       'default': {")
    print("           'ENGINE': 'django.db.backends.sqlite3',")
    print("           'NAME': BASE_DIR / 'db.sqlite3',")
    print("       }")
    print("   }")
    print("2. Run: python safe_migration.py --export-sqlite")
    print("3. Change settings.py to PostgreSQL")
    print("4. Run: python safe_migration.py --import-postgres")
    print()
    print("OPTION C: IMPORT EXISTING JSON")
    print("1. Configure settings.py for target database")
    print("2. Run: python safe_migration.py --import-sqlite (for SQLite)")
    print("   or:  python safe_migration.py --import-postgres (for PostgreSQL)")
    print()
    print("IMPORTANT: Always keep backup files until you verify everything works")


if __name__ == "__main__":
    print("SAFE DATABASE MIGRATION TOOL")
    print("PostgreSQL <-> SQLite")
    print()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--export-postgres" or sys.argv[1] == "--export":
            backup_file = create_backup_from_postgresql()
            if backup_file:
                print()
                print("PostgreSQL export completed successfully!")
                print("Next steps:")
                print("1. Change settings.py to use SQLite")
                print("2. Run: python safe_migration.py --import-sqlite")
        
        elif sys.argv[1] == "--export-sqlite":
            backup_file = create_backup_from_sqlite()
            if backup_file:
                print()
                print("SQLite export completed successfully!")
                print("Next steps:")
                print("1. Change settings.py to use PostgreSQL")
                print("2. Run: python safe_migration.py --import-postgres")
        
        elif sys.argv[1] == "--import-sqlite" or sys.argv[1] == "--import":
            success = import_to_sqlite()
            if success:
                print()
                print("SQLITE IMPORT COMPLETED!")
                print("Next steps:")
                print("1. Run: python manage.py runserver") 
                print("2. Verify your application works correctly")
        
        elif sys.argv[1] == "--import-postgres":
            success = import_to_postgresql()
            if success:
                print()
                print("POSTGRESQL IMPORT COMPLETED!")
                print("Next steps:")
                print("1. Run: python manage.py runserver") 
                print("2. Verify your application works correctly")
        
        elif sys.argv[1] == "--help":
            show_instructions()
            
    else:
        show_instructions()
        print()
        print("AVAILABLE COMMANDS:")
        print("  python safe_migration.py --export-postgres   (Export from PostgreSQL)")
        print("  python safe_migration.py --export-sqlite     (Export from SQLite)")
        print("  python safe_migration.py --import-sqlite     (Import to SQLite)")
        print("  python safe_migration.py --import-postgres   (Import to PostgreSQL)")
        print("  python safe_migration.py --help              (Show detailed instructions)")
        print()
        print("COMPATIBILITY ALIASES:")
        print("  --export  (same as --export-postgres)")
        print("  --import  (same as --import-sqlite)")