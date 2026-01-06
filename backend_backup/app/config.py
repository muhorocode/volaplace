import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'volaplace.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    LOGIN_VIEW = 'auth.login'
    LOGIN_MESSAGE_CATEGORY = 'info'
    DEFAULT_GEOFENCE_RADIUS = 100
