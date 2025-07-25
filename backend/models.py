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

class Warehouse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    area_m2 = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    geo_json = db.Column(db.JSON) # GeoJSON verisi için JSON tipi
    type = db.Column(db.String(10), nullable=False) # 'open' veya 'closed'
    height_m = db.Column(db.Float, nullable=True) # Sadece kapalı depolar için

    # Kullanıcı ile ilişki
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "capacity": self.capacity,
            "area_m2": self.area_m2,
            "description": self.description,
            "geo_json": self.geo_json,
            "type": self.type,
            "height_m": self.height_m,
            "user_id": self.user_id
        }