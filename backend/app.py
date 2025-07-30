import os
from datetime import datetime, timedelta, timezone

from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from flask_jwt_extended import get_jwt_identity, create_access_token, get_jwt

from extensions import db, bcrypt, mail, migrate, jwt
from models import User
from auth import auth_bp
from warehouse.warehouse import warehouse_bp
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/*": {"origins": app.config['FRONTEND_URL']}}, supports_credentials=True)

    db.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return User.query.filter_by(id=identity).one_or_none()

    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return jsonify({"message": "Giriş yapmanız gerekiyor."}), 401

    @jwt.invalid_token_loader
    def invalid_token_response(callback):
        return jsonify({"message": "Geçersiz token."}), 401

    @jwt.expired_token_loader
    def expired_token_response(jwt_header, jwt_payload):
        return jsonify({"message": "Token süresi doldu. Lütfen tekrar giriş yapın."}), 401

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(warehouse_bp, url_prefix='/api')

    with app.app_context():
        pass

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000, use_reloader=False)