from flask import request, jsonify, current_app, url_for, render_template, make_response
from . import auth_bp
from models import User
from extensions import db, mail, bcrypt, jwt
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies 
)
from datetime import datetime, timedelta

def generate_reset_token(email):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=current_app.config['SECURITY_PASSWORD_SALT'])

def verify_reset_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(
            token,
            salt=current_app.config['SECURITY_PASSWORD_SALT'],
            max_age=expiration
        )
    except (SignatureExpired, BadTimeSignature):
        return None
    return email

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'message': 'Tüm alanlar gerekli!'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Bu kullanıcı adı zaten kullanımda.'}), 409
    
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Bu e-posta adresi zaten kullanımda.'}), 409

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        current_app.logger.info(f"Yeni kullanıcı kaydedildi: {username} ({email})")
        return jsonify({'message': 'Kullanıcı başarıyla kaydedildi!'}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Kayıt sırasında veritabanı hatası: {e}")
        return jsonify({'message': 'Kayıt sırasında bir hata oluştu.', 'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Kullanıcı adı ve şifre gerekli!'}), 400

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        access_token_claims = {"username": user.username, "email": user.email}
        refresh_token_claims = {"username": user.username}

        access_token = create_access_token(identity=user.id, additional_claims=access_token_claims)
        refresh_token = create_refresh_token(identity=user.id, additional_claims=refresh_token_claims)

        response_body = {
            'message': 'Giriş başarılı!',
            'username': user.username,
            'user_id': user.id,
        }

        response = make_response(jsonify(response_body), 200)

        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)

        return response
    else:
        current_app.logger.warning(f"Başarısız giriş denemesi: {username}")
        return jsonify({'message': 'Geçersiz kullanıcı adı veya şifre.'}), 401
    
@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()

        user = User.query.get(current_user_id)

        if not user:
            current_app.logger.error(f"Refresh token ile kullanıcı bulunamadı: ID {current_user_id}")
            return jsonify({'message': 'Kullanıcı bulunamadı, yeniden giriş yapın.'}), 401

        new_access_token = create_access_token(
            identity=user.id,
            additional_claims={"username": user.username, "email": user.email}
        )
        current_app.logger.info(f"Access token yenilendi: Kullanıcı {user.username}")
        return jsonify({'access_token': new_access_token}), 200

    except Exception as e:
        current_app.logger.error(f"JWT yenileme sırasında hata: {e}")
        return jsonify({'message': 'JWT yenileme sırasında bir hata oluştu.'}), 500
    
@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({'message': 'Kullanıcı bulunamadı.'}), 404

    return jsonify({
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    current_user_id = get_jwt_identity()
    current_app.logger.info(f"Logout isteği alındı: Kullanıcı ID {current_user_id}")
    
    response = jsonify({'message': 'Başarılı bir şekilde çıkış yapıldı!'})
    
    unset_jwt_cookies(response)
    return response, 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'message': 'E-posta adresi gerekli.'}), 400

    user = User.query.filter_by(email=email).first()
    
    if not user:
        return jsonify({'message': 'Şifre sıfırlama linki e-posta adresinize gönderildi (Eğer kayıtlıysa).'}), 200

    token = generate_reset_token(user.email)
    
    reset_url = f"{current_app.config['FRONTEND_URL']}/pages/user/new-password?token={token}"

    msg = Message('Şifrenizi Sıfırlayın - Akyapı 3D Depo Yönetimi',
                  sender=current_app.config['MAIL_DEFAULT_SENDER'],
                  recipients=[user.email])

    msg.html = render_template(
        'password_reset_email.html',
        username=user.username,
        reset_url=reset_url
    )

    try:
        mail.send(msg)
        current_app.logger.info(f"'{email}' adresine şifre sıfırlama linki gönderildi.")
        return jsonify({'message': 'Şifre sıfırlama linki e-posta adresinize gönderildi.'}), 200
    except Exception as e:
        current_app.logger.error(f"'{email}' adresine e-posta gönderme hatası: {e}")
        return jsonify({'message': 'E-posta gönderme hatası oluştu.'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')

    if not token or not new_password:
        return jsonify({'message': 'Eksik bilgi (token veya yeni şifre).'}), 400

    email = verify_reset_token(token)
    if not email:
        return jsonify({'message': 'Geçersiz veya süresi dolmuş sıfırlama linki.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'Kullanıcı bulunamadı.'}), 404

    try:
        user.set_password(new_password)
        db.session.commit()
        current_app.logger.info(f"Kullanıcı {user.username} için şifre başarıyla sıfırlandı.")
        return jsonify({'message': 'Şifreniz başarıyla sıfırlandı.'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Şifre sıfırlama sırasında veritabanı hatası: {e}")
        return jsonify({'message': 'Şifre sıfırlanırken bir hata oluştu.'}), 500

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        current_app.logger.error(f"Protected route: Kullanıcı bulunamadı, ID: {current_user_id}")
        return jsonify({'message': 'Kullanıcı bulunamadı.'}), 404

    return jsonify({
        'message': f"Hoş geldiniz, {user.username}! Bu korumalı bir içeriktir.",
        'user_id': user.id,
        'username': user.username,
        'email': user.email
    }), 200