from extensions import db, bcrypt
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, nullable=False)

    warehouses = db.relationship('Warehouse', backref='owner', lazy=True)

    def __repr__(self):
        return f"<User {self.username}>"

    def set_password(self, plain_password):
        self.password = bcrypt.generate_password_hash(plain_password).decode('utf-8')

    def check_password(self, plain_password):
        return bcrypt.check_password_hash(self.password, plain_password)

class Warehouse(db.Model):
    __tablename__ = 'depo'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    ad = db.Column(db.String(100), nullable=False)
    konum = db.Column(db.Text)
    alan_verisi_3d = db.Column(JSONB)
    aciklama = db.Column(db.Text)
    tipi = db.Column(db.String(10), nullable=False)
    kapasite = db.Column(db.Integer, nullable=False)
    yukseklik = db.Column(db.Numeric)
    taban_alani = db.Column(db.Numeric)
    raf_sayisi = db.Column(db.Integer, default=0)
    aktif = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.TIMESTAMP, default=db.func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "ad": self.ad,
            "konum": self.konum,
            "alan_verisi_3d": self.alan_verisi_3d,
            "aciklama": self.aciklama,
            "tipi": self.tipi,
            "kapasite": self.kapasite,
            "yukseklik": float(self.yukseklik) if self.yukseklik is not None else None,
            "taban_alani": float(self.taban_alani) if self.taban_alani is not None else None,
            "raf_sayisi": self.raf_sayisi,
            "aktif": self.aktif,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user_id": self.user_id
        }