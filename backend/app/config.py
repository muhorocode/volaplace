import os
from datetime import timedelta

class Config:
    # Basic Flask config
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-for-today-please-change-in-production'
    
    # Database config
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///volaplace.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Flask-Login config
    REMEMBER_COOKIE_DURATION = timedelta(days=7)
    SESSION_PROTECTION = 'strong'
    
    # CORS config
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')
    CORS_SUPPORTS_CREDENTIALS = True
    
    # M-Pesa config (to be added later)
    MPESA_CONSUMER_KEY = os.environ.get('MPESA_CONSUMER_KEY', '')
    MPESA_CONSUMER_SECRET = os.environ.get('MPESA_CONSUMER_SECRET', '')
    MPESA_ENVIRONMENT = os.environ.get('MPESA_ENVIRONMENT', 'sandbox')
