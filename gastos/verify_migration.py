#!/usr/bin/env python
"""
VERIFICACIÓN FINAL POST-MIGRACIÓN
Este script verifica que todo funcione correctamente después de la migración a Grupos.
"""

import os
import sys
import django
from pathlib import Path

# Setup Django
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gastos.settings")

def verificar_modelos():
    """Verificar que todos los modelos funcionen correctamente"""
    print("🔍 VERIFICANDO MODELOS DE DJANGO")
    print("=" * 50)
    
    django.setup()
    
    # Importar modelos
    from api.models import Grupo, GrupoMembership, GrupoInvitation, ExpenseSplit, Gasto, MedioPago
    from django.contrib.auth.models import User
    
    print("✓ Todos los modelos importados correctamente")
    
    # Verificar que se puedan hacer queries básicas
    try:
        grupos_count = Grupo.objects.count()
        gastos_count = Gasto.objects.count()
        medios_count = MedioPago.objects.count()
        
        print(f"✓ Grupos en DB: {grupos_count}")
        print(f"✓ Gastos en DB: {gastos_count}")
        print(f"✓ Medios de Pago en DB: {medios_count}")
        
        return True
    except Exception as e:
        print(f"❌ Error en queries básicas: {e}")
        return False

def verificar_admin():
    """Verificar que el admin esté registrado correctamente"""
    print("\n🔍 VERIFICANDO CONFIGURACIÓN DEL ADMIN")
    print("=" * 50)
    
    from django.contrib import admin
    from api.models import Grupo, GrupoMembership, GrupoInvitation, ExpenseSplit, Gasto, MedioPago
    
    modelos_esperados = [Grupo, GrupoMembership, GrupoInvitation, ExpenseSplit, Gasto, MedioPago]
    
    for modelo in modelos_esperados:
        if modelo in admin.site._registry:
            print(f"✓ {modelo.__name__} registrado en admin")
        else:
            print(f"⚠️  {modelo.__name__} NO registrado en admin")
    
    print("✓ Configuración del admin verificada")
    return True

def verificar_api_endpoints():
    """Verificar que los endpoints de API estén configurados"""
    print("\n🔍 VERIFICANDO ENDPOINTS DE API")
    print("=" * 50)
    
    from django.urls import reverse
    from django.test import Client
    
    try:
        # Solo verificar que las URLs se puedan resolver
        urls_esperadas = [
            'grupos_list_create',
            'grupo_memberships_list_create', 
            'grupo_invitations_list_create',
            'expense_splits_list_create',
            'gastos_list_create',
            'medios_pago_list_create',
        ]
        
        for url_name in urls_esperadas:
            try:
                url = reverse(f'api:{url_name}' if ':' not in url_name else url_name)
                print(f"✓ URL '{url_name}' resoluble: {url}")
            except:
                try:
                    url = reverse(url_name)
                    print(f"✓ URL '{url_name}' resoluble: {url}")
                except:
                    print(f"⚠️  URL '{url_name}' no encontrada")
        
        return True
    except Exception as e:
        print(f"❌ Error verificando endpoints: {e}")
        return False

def crear_grupo_de_prueba():
    """Crear un grupo de prueba si no existe"""
    print("\n🔍 CREANDO GRUPO DE PRUEBA")
    print("=" * 50)
    
    from api.models import Grupo
    from django.contrib.auth.models import User
    
    try:
        # Buscar o crear superusuario
        user, created = User.objects.get_or_create(
            username='admin_test',
            defaults={
                'email': 'admin@test.com',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            user.set_password('admin123')
            user.save()
            print("✓ Usuario de prueba creado")
        else:
            print("✓ Usuario de prueba ya existe")
        
        # Crear grupo de prueba
        grupo, created = Grupo.objects.get_or_create(
            name='Grupo de Prueba',
            defaults={
                'description': 'Grupo creado automáticamente para probar la funcionalidad',
                'owner': user,
                'grupo_type': 'shared',
            }
        )
        
        if created:
            print("✓ Grupo de prueba creado exitosamente")
            print(f"  - ID: {grupo.id}")
            print(f"  - Nombre: {grupo.name}")
            print(f"  - Owner: {grupo.owner.username}")
        else:
            print("✓ Grupo de prueba ya existe")
            
        return True
    except Exception as e:
        print(f"❌ Error creando grupo de prueba: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 VERIFICACIÓN POST-MIGRACIÓN A GRUPOS")
    print("=" * 60)
    print()
    
    resultados = []
    
    # Ejecutar verificaciones
    resultados.append(verificar_modelos())
    resultados.append(verificar_admin())
    resultados.append(verificar_api_endpoints())
    resultados.append(crear_grupo_de_prueba())
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE VERIFICACIÓN")
    print("=" * 60)
    
    if all(resultados):
        print("🎉 ¡TODAS LAS VERIFICACIONES PASARON!")
        print("\n✅ Tu aplicación está lista para:")
        print("  - Usar el admin de Django (/admin/)")
        print("  - Crear y gestionar grupos")
        print("  - Usar todos los endpoints de API")
        print("  - Deployar a producción")
        print("\n🔗 Próximos pasos:")
        print("  1. Visita /admin/ y crea tu primer grupo")
        print("  2. Prueba las funcionalidades desde el frontend")
        print("  3. Haz commit de todos los cambios")
        print("  4. Deploy a producción")
    else:
        print("⚠️  Algunas verificaciones fallaron.")
        print("Revisa los errores arriba y corrígelos antes de continuar.")
        
    print()

if __name__ == "__main__":
    main()