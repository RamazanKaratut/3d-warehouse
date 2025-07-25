# backend/config.py

from database_baglanti import SQLALCHEMY_DATABASE_URI
import os

class Config:
    # Veritabanı Ayarları
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Güvenlik Ayarları
    # BURAYI ÇOK GÜÇLÜ VE RASTGELE BİR ANAHTAR İLE DEĞİŞTİRİN!
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'bfe2a1c0d5e8f4a7b9c3d6e0f1a2b3c4d5e8f4a7b9c3d6e0f1a2b3c4'
    # itsdangerous için ek bir salt (tuz)
    SECURITY_PASSWORD_SALT = os.environ.get('SECURITY_PASSWORD_SALT') or 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'

    # E-posta Ayarları (Gmail SMTP örneği)
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'senin_e-posta_adresin@gmail.com'  # Kendi Gmail adresiniz
    MAIL_PASSWORD = 'senin_gmail_uygulama_sifren'     # Gmail uygulama şifresi (UYGULAMA ŞİFRESİ KULLANIN!)
    MAIL_DEFAULT_SENDER = 'senin_e-posta_adresin@gmail.com'

    # Frontend URL'i (şifre sıfırlama linkinin gideceği adres)
    FRONTEND_URL = 'http://localhost:3000' # Frontend uygulamanızın çalıştığı adres

    # Oturum için çerez adı
    SESSION_COOKIE_NAME = 'your_app_session'
    SESSION_COOKIE_SECURE = True # HTTPS kullanıyorsanız True yapın
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax' # 'None' ise SESSION_COOKIE_SECURE True olmalı