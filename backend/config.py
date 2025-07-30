import os
from datetime import timedelta
from database_baglanti import SQLALCHEMY_DATABASE_URI
from login_mail import sifre_mail

class Config:
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SECRET_KEY = os.environ.get('SECRET_KEY', 'bfe2a1c0d5e8f4a7b9c3d6e0f1a2b3c4d5e8f4a7b9c3d6e0f1a2b3c4')
    
    SECURITY_PASSWORD_SALT = os.environ.get('SECURITY_PASSWORD_SALT', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6')

    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('EMAIL_USER', 'akyapi.3d.depoyonetimi@gmail.com')
    MAIL_PASSWORD = os.environ.get('EMAIL_PASS', sifre_mail)
    MAIL_DEFAULT_SENDER = os.environ.get('EMAIL_USER', 'akyapi.3d.depoyonetimi@gmail.com')

    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

    SESSION_COOKIE_NAME = 'your_app_session'
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-jwt-super-secret-key-that-should-be-random-and-long')

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    JWT_TOKEN_LOCATION = ["cookies"]

    JWT_ACCESS_COOKIE_NAME = "access_token_cookie"

    JWT_COOKIE_SECURE = False
    JWT_COOKIE_HTTPONLY = True
    JWT_COOKIE_SAMESITE = 'Lax'

    JWT_COOKIE_CSRF_PROTECT = False

    JWT_REFRESH_LEEWAY_MINUTES = 30