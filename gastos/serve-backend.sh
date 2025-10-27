#!/bin/bash
# Linux/Mac script to serve Django backend on LAN

echo "Activating virtual environment..."
source ../env/bin/activate

echo "Running migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo ""
echo "Starting Django backend on http://0.0.0.0:8000"
echo "Access from clients at: http://YOUR_PC_IP:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Using Django's development server (or use waitress for production)
python manage.py runserver 0.0.0.0:8000

# For production, uncomment this instead:
# pip install waitress
# waitress-serve --host=0.0.0.0 --port=8000 gastos.wsgi:application
