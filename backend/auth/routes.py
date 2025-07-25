# backend/auth/routes.py

from flask import request, jsonify, current_app, url_for
from . import auth_bp
from backend.models import User # Mutlak import
from backend.extensions import db, mail, bcrypt, jwt # <-- jwt de eklendi!
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, set_access_cookies, unset_jwt_cookies, get_jwt # <-- JWT importları eklendi
from datetime import datetime, timedelta

# Şifre Sıfırlama Tokenı Oluşturma
def generate_reset_token(email):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    # SECURITY_PASSWORD_SALT yerine JWT_SECRET_KEY veya farklı bir salt kullanabiliriz
    # Flask-JWT-Extended varsayılan olarak SECRET_KEY'i kullanır, bu yüzden bu salt gereksiz olabilir.
    # Ancak itsdangerous için bırakıyorum.
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

    # User modelinizin set_password metodunun bcrypt kullandığından emin olun
    new_user = User(username=username, email=email)
    new_user.set_password(password) # set_password metodu şifreyi hash'lemeli
    
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

    if user and user.check_password(password):
        # JWT Oluşturma
        # is_admin referansını buradan kaldırıyoruz
        additional_claims = {"username": user.username, "email": user.email} # <-- is_admin kaldırıldı
        access_token = create_access_token(identity=user.id, additional_claims=additional_claims)

        response = jsonify({'message': 'Giriş başarılı!', 'username': user.username})
        set_access_cookies(response, access_token)

        return response, 200
    else:
        return jsonify({'message': 'Geçersiz kullanıcı adı veya şifre.'}), 401

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({'message': 'Kullanıcı bulunamadı.'}), 404

    claims = get_jwt()

    return jsonify({
        'message': f'Merhaba {user.username}! Bu korumalı bir kaynak.',
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
        # 'is_admin': claims.get('is_admin') # <-- BU SATIRI DA SİLİN!
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        current_user = get_jwt_identity()
        current_app.logger.info(f"Logout isteği: Kullanıcı kimliği {current_user}") # << BU ÇIKTIYI GÖRMEK İSTİYORUM

        # Gelen isteğin başlıklarını ve çerezlerini de loglayalım (sadece debug için!)
        print("Gelen İstek Başlıkları:", request.headers) # << BUNU DA GÖRMEK İSTİYORUM
        print("Gelen İstek Çerezleri:", request.cookies) # << VE BUNU DA GÖRMEK İSTİYORUM

        response = jsonify({'message': 'Çıkış başarılı!'})
        unset_jwt_cookies(response)
        return response, 200
    except Exception as e:
        current_app.logger.error(f"Logout sırasında hata: {e}")
        return jsonify({'message': 'Çıkış sırasında bir hata oluştu.'}), 500

# Şifre sıfırlama rotaları aynı kalabilir, JWT ile doğrudan ilgili değiller
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
    reset_url = f"{current_app.config['FRONTEND_URL']}/reset-password?token={token}" # Frontend'deki doğru yolu kontrol edin

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

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id) # Veya username/email ile bulun

    if not user:
        return jsonify({'message': 'Kullanıcı bulunamadı.'}), 404

    # is_admin'i kaldırdığımız için, eğer hala referans varsa burayı da düzeltelim
    return jsonify({
        'message': f'Merhaba {user.username}! Bu korumalı bir kaynak.',
        'user_id': user.id,
        'username': user.username,
        'email': user.email
        # Eğer claims içinde başka bir şey döndürmek isterseniz buraya ekleyebilirsiniz.
    }), 200

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