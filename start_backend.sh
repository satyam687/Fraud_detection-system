#!/bin/bash
echo "=== Starting FraudGuard Backend ==="
cd backend
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
python manage.py runserver
