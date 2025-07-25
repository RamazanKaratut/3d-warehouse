# backend/models.py

from .extensions import db # extensions.py'den db'yi import edin
from datetime import datetime # created_at için datetime ekledik
from werkzeug.security import generate_password_hash, check_password_hash # bcrypt yerine werkzeug

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, nullable=False) # Varsayılan olarak UTC zamanı

    def __repr__(self):
        return f"<User {self.username}>"

    def set_password(self, plain_password): # 'password' argüman adını değiştirdim çakışmasın diye
        from .extensions import bcrypt
        # bcrypt ile hash'lenmiş şifreyi yeni 'password' sütununa atıyoruz
        self.password = bcrypt.generate_password_hash(plain_password).decode('utf-8')

    def check_password(self, plain_password):
        from .extensions import bcrypt
        # bcrypt ile hash'lenmiş şifreyi yeni 'password' sütunundan kontrol ediyoruz
        return bcrypt.check_password_hash(self.password, plain_password)