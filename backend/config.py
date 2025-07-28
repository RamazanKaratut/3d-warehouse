from database_baglanti import SQLALCHEMY_DATABASE_URI
import os
from datetime import timedelta

class Config:
    # Veritabanı Ayarları
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Flask uygulamasının kendi SECRET_KEY'i (Çok Önemli!)
    # Flask formları, oturumları, itsdangerous (şifre sıfırlama tokenı) ve
    # Flask-JWT-Extended'ın bazı internal mekanizmaları için gereklidir.
    # Ortam değişkeninden alınmalı veya uzun, rastgele bir dize olmalı.
    SECRET_KEY = os.environ.get('SECRET_KEY', 'bfe2a1c0d5e8f4a7b9c3d6e0f1a2b3c4d5e8f4a7b9c3d6e0f1a2b3c4')

    # itsdangerous kütüphanesi için kullanılan salt (şifre sıfırlama tokenları için)
    SECURITY_PASSWORD_SALT = os.environ.get('SECURITY_PASSWORD_SALT', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6')

    # E-posta Ayarları (Gmail SMTP örneği)
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    # Bu değerleri üretim ortamında ortam değişkenlerinden almalısınız.
    MAIL_USERNAME = os.environ.get('EMAIL_USER', 'akyapi.3d.depoyonetimi@gmail.com')
    MAIL_PASSWORD = os.environ.get('EMAIL_PASS', 'rhkd ukpx bpfg plgg') # Uygulama şifresi kullanın
    MAIL_DEFAULT_SENDER = os.environ.get('EMAIL_USER', 'akyapi.3d.depoyonetimi@gmail.com')

    # Frontend URL'i (CORS ve şifre sıfırlama linki için)
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

    # Flask'ın kendi oturum yönetimi için çerez ayarları (JWT ile karıştırmayın)
    # Bu uygulama JWT kullandığı için Flask'ın oturum çerezleri genellikle kullanılmaz,
    # ancak tanımlanması genel iyi bir pratiktir.
    SESSION_COOKIE_NAME = 'your_app_session'
    SESSION_COOKIE_SECURE = False # Geliştirme ortamında HTTP olduğu için False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax' # 'Lax' CSRF korumasında iyi bir denge sağlar

    # Flask-JWT-Extended Ayarları
    # JWT'lerinizin imzalanması için kullanılan anahtar. Çok gizli ve rastgele olmalı!
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-jwt-super-secret-key-that-should-be-random-and-long')

    # JWT'lerin geçerlilik süresi (erişim tokenı)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)

    # JWT'nin nerede aranacağını belirtir. Biz çerezleri kullanıyoruz.
    JWT_TOKEN_LOCATION = ["cookies"]

    # Erişim tokenı çerezi için özel isim. Flask-JWT-Extended'ın varsayılanı 'access_token_cookie'dir.
    JWT_ACCESS_COOKIE_NAME = "access_token_cookie"
    # Eğer refresh token kullanıyorsanız onun da ismini belirleyebilirsiniz:
    # JWT_REFRESH_COOKIE_NAME = "refresh_token_cookie"

    # JWT çerezlerinin özellikleri (güvenlik, HttpOnly vs.)
    # Geliştirme ortamında (localhost ve HTTP) JWT_COOKIE_SECURE = False olmalı.
    # Üretimde (HTTPS) True olmalı.
    JWT_COOKIE_SECURE = False
    JWT_COOKIE_HTTPONLY = True # JavaScript'ten erişilemez, XSS saldırılarına karşı korur
    JWT_COOKIE_SAMESITE = 'Lax' # 'Strict', 'Lax', 'None'. 'Lax' çoğu durumda yeterlidir.

    # CSRF Koruması
    # Bu ayar, cross-site isteklerde CSRF token doğrulamasını kapatır.
    # Logout probleminde yaşadığımız sorunlardan biri bu olabilirdi.
    # Geliştirme aşamasında False tutmak sorunları gidermede yardımcı olur.
    # Üretimde True yapıp uygun CSRF token mekanizması uygulamak daha güvenlidir.
    JWT_COOKIE_CSRF_PROTECT = False

    # Token süresi dolmadan ne kadar önce yenilemeye çalışılacağını belirler (dakika cinsinden)
    # Bu, @app.after_request içinde kullanılacak token yenileme mekanizması için.
    JWT_REFRESH_LEEWAY_MINUTES = 30