import sys
import os
from datetime import datetime, timedelta, timezone

# Proje kök dizinini Python yoluna ekle
# Bu, backend/app.py'nin çalıştığı dizinden bir üst dizine (proje kök dizinine) gitmesini sağlar
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from flask import Flask, jsonify, request, make_response
from flask_cors import CORS

from flask_jwt_extended import get_jwt_identity, create_access_token, set_access_cookies, get_jwt, unset_jwt_cookies

# Kendi özel uzantılarınızı, blueprint'lerinizi ve yapılandırmanızı import edin
from backend.extensions import db, bcrypt, mail, migrate, jwt # 'jwt' burada Flask-JWT-Extended nesnesi
from backend.auth import auth_bp
from backend.warehouse.warehouse import warehouse_bp
from backend.config import Config


def create_app():
    """
    Flask uygulamasını oluşturan ve yapılandıran ana fonksiyon.
    Veritabanı, güvenlik uzantıları ve blueprint'leri başlatır.
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS ayarları
    # FRONTEND_URL, Config.py içinde tanımlanmalı (örn: http://localhost:3000)
    CORS(app, resources={r"/*": {"origins": app.config['FRONTEND_URL']}}, supports_credentials=True)

    # Veritabanı ve diğer Flask uzantılarını başlatma
    db.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app) # Flask-JWT-Extended uzantısını uygulamaya bağlama

    # JWT Hata İşleyicileri (jwt nesnesi app'e init edildikten sonra tanımlanmalı)
    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return jsonify({"message": "Giriş yapmanız gerekiyor."}), 401

    @jwt.invalid_token_loader
    def invalid_token_response(callback):
        return jsonify({"message": "Geçersiz token."}), 401

    @jwt.expired_token_loader
    def expired_token_response(callback):
        # Süresi dolan token'da çerezi temizle ve kullanıcıyı tekrar giriş yapmaya yönlendir
        response = jsonify({"message": "Token süresi doldu. Lütfen tekrar giriş yapın."})
        unset_jwt_cookies(response)
        return response, 401

    # JWT'nin çerezde nasıl yenileceğini yapılandır (HttpOnly çerezler için)
    # Bu hook, her başarılı istekten sonra çalışır ve token'ın süresi dolmak üzereyse yeniler.
    @app.after_request
    def refresh_expiring_jwts(response):
        try:
            # Sadece geçerli bir JWT varsa ve token süresi dolmak üzereyse yenile
            claims = get_jwt()
            # Eğer claims yoksa (yani token gönderilmemiş veya geçersizse) veya "exp" alanı yoksa
            if claims is None or "exp" not in claims:
                return response

            exp_timestamp = claims["exp"]
            identity = claims["sub"] # Token'ın identity'si (kullanıcı adı)

            now = datetime.now(timezone.utc)
            # Token'ın ne kadar süre önce yenilenmesi gerektiğini belirleyen eşik
            # JWT_REFRESH_LEEWAY_MINUTES, Config.py'de tanımlanmalı (örn: 15 dakika)
            target_timestamp = datetime.timestamp(now + timedelta(minutes=app.config['JWT_REFRESH_LEEWAY_MINUTES']))

            if target_timestamp > exp_timestamp:
                # Yeni bir erişim token'ı oluştur
                access_token = create_access_token(identity=identity)
                # Yanıta yeni token içeren çerezi ekle
                set_access_cookies(response, access_token)
            return response
        except Exception as e:
            # Geliştirme ortamında hataları görmek faydalı olabilir
            app.logger.error(f"JWT yenileme sırasında hata: {e}") # Loglama için app.logger kullanın
            return response

    # Blueprint'leri kaydetme
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(warehouse_bp, url_prefix='/api') # '/api' prefixi ile erişilecek

    # Uygulama bağlamında veritabanı işlemleri
    with app.app_context():
        # db.create_all() # Eğer migrate kullanıyorsanız bu satırı yorum satırı yapın veya silin.
        # Genellikle 'flask db upgrade' komutu ile migration'ları yönetirsiniz.
        pass

    return app

# Uygulamayı doğrudan çalıştırmak için (geliştirme)
# use_reloader=False, debug=True ile birlikte kullanıldığında iki kez çalıştırmayı önler.
# Geliştirmede True, üretimde False olmalı.
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000, use_reloader=False)