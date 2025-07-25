# backend/app.py

import sys
import os

# Proje kök dizinini Python yoluna ekle
# 'backend' klasörünün bir üst dizini
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from flask import Flask
from flask_cors import CORS

# Mutlak import'ları kullan
from backend.extensions import db, bcrypt, mail, migrate
from backend.auth import auth_bp
from backend.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS ayarları
    CORS(app, resources={r"/*": {"origins": app.config['FRONTEND_URL']}}, supports_credentials=True)

    # Veritabanı ve diğer uzantıları başlatma
    db.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)

    # Blueprint'leri kaydetme
    # BURADA auth_bp'nin nasıl kaydedildiğini kontrol edin!
    app.register_blueprint(auth_bp, url_prefix='/auth') # Örnek: auth_bp için /auth öneki


    # Debug modunda tablo oluşturma (sadece geliştirme için)
    with app.app_context():
        # Eğer alembic (flask migrate) kullanıyorsanız, db.create_all() yerine migrate komutlarını kullanın
        # db.create_all() # Geliştirme aşamasında otomatik tablo oluşturmak için kullanılabilir

        # Flask-Migrate kullanıyorsanız, terminalden `flask db init`, `flask db migrate`, `flask db upgrade` yapın.
        pass
    return app

# Uygulamayı doğrudan çalıştırmak için (geliştirme)
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000, use_reloader=False)