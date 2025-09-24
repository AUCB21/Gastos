#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

# Handle conflicting migrations
python manage.py makemigrations --merge --noinput

# Create new migration for TokenActivity model
python manage.py makemigrations

# Apply all migrations
python manage.py migrate