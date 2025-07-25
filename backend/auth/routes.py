# backend/auth/routes.py

from flask import request, jsonify, session, current_app, url_for
from . import auth_bp # Bu hala auth paketi içindeki göreceli import kalabilir
from backend.models import User # Mutlak import
from backend.extensions import db, mail, bcrypt # Mutlak import
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature
from datetime import datetime, timedelta

# Şifre Sıfırlama Tokenı Oluşturma
def generate_reset_token(email):
    # Serializer, uygulamanın SECRET_KEY ve SECURITY_PASSWORD_SALT değerlerini kullanır.
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=current_app.config['SECURITY_PASSWORD_SALT'])

# Şifre Sıfırlama Tokenı Doğrulama
def verify_reset_token(token, expiration=3600): # Varsayılan: 1 saat (3600 saniye)
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(
            token,
            salt=current_app.config['SECURITY_PASSWORD_SALT'],
            max_age=expiration
        )
    except (SignatureExpired, BadTimeSignature):
        return None # Token süresi dolmuş veya geçersiz
    return email


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'message': 'Tüm alanlar gerekli!'}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'message': 'Kullanıcı adı veya e-posta zaten kullanımda.'}), 409

    # bcrypt ile şifreyi hash'le
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    new_user = User(username=username, email=email) # Sadece username ve email ile başlat
    new_user.set_password(password)
    try:
        db.session.add(new_user)
        db.session.commit()
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

    # bcrypt ile şifre kontrolü
    if user and user.check_password(password):
        session['user_id'] = user.id
        session['username'] = user.username
        return jsonify({'message': 'Giriş başarılı!', 'username': user.username}), 200
    else:
        return jsonify({'message': 'Geçersiz kullanıcı adı veya şifre.'}), 401

@auth_bp.route('/protected', methods=['GET'])
def protected():
    if 'user_id' in session:
        user_id = session['user_id']
        user = User.query.get(user_id)
        if user:
            return jsonify({'message': f'Merhaba {user.username}! Bu korumalı bir kaynak.'}), 200
        else:
            return jsonify({'message': 'Kullanıcı bulunamadı.'}), 401
    else:
        return jsonify({'message': 'Yetkilendirme gerekli. Lütfen giriş yapın.'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    return jsonify({'message': 'Başarıyla çıkış yapıldı.'}), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'message': 'E-posta adresi gerekli.'}), 400

    user = User.query.filter_by(email=email).first()
    # Güvenlik için, kullanıcı mevcut olmasa bile aynı mesajı döndürün.
    # Böylece e-posta adreslerinin varlığı tahmin edilemez.
    if not user:
        return jsonify({'message': 'Şifre sıfırlama linki e-posta adresinize gönderildi (Eğer kayıtlıysa).'}), 200

    token = generate_reset_token(user.email)
    reset_url = f"{current_app.config['FRONTEND_URL']}/pages/reset-password?token={token}"

    msg = Message('Şifrenizi Sıfırlayın',
                  sender=current_app.config['MAIL_DEFAULT_SENDER'],
                  recipients=[user.email])
    msg.body = f"""Merhaba {user.username},

        Şifrenizi sıfırlamak için aşağıdaki bağlantıyı tıklayın:
        {reset_url}
        
        Bu link 1 saat içinde sona erecektir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı dikkate almayın.
        
        Saygılarımızla,
        Akyapı Destek Ekibi
        """
    try:
        mail.send(msg)
        return jsonify({'message': 'Şifre sıfırlama linki e-posta adresinize gönderildi.'}), 200
    except Exception as e:
        current_app.logger.error(f"E-posta gönderme hatası: {e}")
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
        user.set_password(new_password) # User modelinizdeki set_password metodunu kullanır
        db.session.commit()
        return jsonify({'message': 'Şifreniz başarıyla sıfırlandı.'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Şifre sıfırlama sırasında veritabanı hatası: {e}")
        return jsonify({'message': 'Şifre sıfırlanırken bir hata oluştu.'}), 500