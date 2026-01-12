#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Run database migrations
flask db upgrade

# Create admin account if it doesn't exist (safe to run multiple times)
python create_admin.py

echo "Build complete!"
