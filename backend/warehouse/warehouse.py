from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Warehouse

warehouse_bp = Blueprint('warehouse', __name__)

@warehouse_bp.route('/warehouses', methods=['GET'])
@jwt_required()
def get_warehouses():
    current_user_id = get_jwt_identity()
    try:
        warehouses = Warehouse.query.filter_by(user_id=current_user_id).all()
        return jsonify([warehouse.to_dict() for warehouse in warehouses]), 200
    except Exception as e:
        current_app.logger.error(f"Depolar listelenirken hata: {e}")
        return jsonify({"msg": "Depolar listelenirken bir hata oluştu.", "error": str(e)}), 500

@warehouse_bp.route('/warehouses', methods=['POST'])
@jwt_required()
def add_warehouse():
    current_user_id = get_jwt_identity()
    data = request.json

    name = data.get('name')
    konum = data.get('location')
    kapasite = data.get('capacity')
    aciklama = data.get('description')
    taban_alani = data.get('taban_alani')
    alan_verisi_3d = data.get('alan_verisi_3d')
    tipi = data.get('type')
    yukseklik = data.get('yukseklik')
    
    required_fields = {
        'name': name,
        'location': konum,
        'capacity': kapasite,
        'taban_alani': taban_alani,
        'alan_verisi_3d': alan_verisi_3d,
        'type': tipi
    }
    for field_name, value in required_fields.items():
        if value is None:
            return jsonify({"msg": f"Zorunlu alan eksik: '{field_name}'"}), 400
        if isinstance(value, str) and not value.strip():
            return jsonify({"msg": f"Zorunlu alan boş: '{field_name}'"}), 400
    
    try:
        kapasite = int(kapasite)
    except (ValueError, TypeError):
        return jsonify({"msg": "Kapasite geçerli bir tam sayı olmalı."}), 400
    if kapasite <= 0:
        return jsonify({"msg": "Kapasite pozitif bir sayı olmalı."}), 400

    try:
        taban_alani = float(taban_alani)
    except (ValueError, TypeError):
        return jsonify({"msg": "Taban alanı geçerli bir sayı olmalı."}), 400
    if taban_alani <= 0:
        return jsonify({"msg": "Taban alanı pozitif bir sayı olmalı."}), 400

    if tipi not in ['açık', 'kapalı']:
        return jsonify({"msg": "Geçerli bir depo tipi seçin ('açık' veya 'kapalı')."}), 400

    if tipi == 'kapalı':
        if yukseklik is None:
            return jsonify({"msg": "Kapalı depolar için yükseklik zorunludur."}), 400
        try:
            yukseklik = float(yukseklik)
        except (ValueError, TypeError):
            return jsonify({"msg": "Yükseklik geçerli bir sayı olmalı."}), 400
        if yukseklik <= 0:
            return jsonify({"msg": "Yükseklik pozitif bir sayı olmalı."}), 400
    else:
        yukseklik = None

    if not isinstance(alan_verisi_3d, dict):
        return jsonify({"msg": "Alan verisi geçersiz formatta (JSON objesi bekleniyor)."}), 400

    try:
        new_warehouse = Warehouse(
            ad=name,
            konum=konum,
            kapasite=kapasite,
            aciklama=aciklama,
            taban_alani=taban_alani,
            alan_verisi_3d=alan_verisi_3d,
            tipi=tipi,
            yukseklik=yukseklik,
            user_id=current_user_id,
        )
        db.session.add(new_warehouse)
        db.session.commit()
        return jsonify({"msg": "🎉 Depo başarıyla eklendi!", "id": new_warehouse.id}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Depo ekleme sırasında veritabanı hatası: {e}")
        return jsonify({"msg": "Depo eklenirken bir sunucu hatası oluştu.", "error": str(e)}), 500


@warehouse_bp.route('/warehouses/<int:warehouse_id>', methods=['GET'])
@jwt_required()
def get_warehouse(warehouse_id):
    current_user_id = get_jwt_identity()
    try:
        warehouse = Warehouse.query.filter_by(id=warehouse_id, user_id=current_user_id).first()
        if not warehouse:
            return jsonify({"msg": "Depo bulunamadı veya bu depoya erişim izniniz yok."}), 404
        return jsonify(warehouse.to_dict()), 200
    except Exception as e:
        current_app.logger.error(f"Depo getirilirken hata: {e}")
        return jsonify({"msg": "Depo getirilirken bir hata oluştu.", "error": str(e)}), 500

@warehouse_bp.route('/warehouses/<int:warehouse_id>', methods=['PUT'])
@jwt_required()
def update_warehouse(warehouse_id):
    current_user_id = get_jwt_identity()
    data = request.json
    try:
        warehouse = Warehouse.query.filter_by(id=warehouse_id, user_id=current_user_id).first()
        if not warehouse:
            return jsonify({"msg": "Depo bulunamadı veya bu depoyu güncelleme izniniz yok."}), 404

        if 'name' in data:
            warehouse.ad = data['name']
        if 'location' in data:
            warehouse.konum = data['location']
        if 'capacity' in data:
            warehouse.kapasite = int(data['capacity'])
        if 'description' in data:
            warehouse.aciklama = data['description']
        if 'taban_alani' in data:
            warehouse.taban_alani = float(data['taban_alani'])
        if 'alan_verisi_3d' in data:
            if not isinstance(data['alan_verisi_3d'], dict):
                return jsonify({"msg": "Alan verisi geçersiz formatta (JSON objesi bekleniyor)."}), 400
            warehouse.alan_verisi_3d = data['alan_verisi_3d']
        if 'type' in data:
            if data['type'] not in ['açık', 'kapalı']:
                return jsonify({"msg": "Geçerli bir depo tipi seçin ('açık' veya 'kapalı')."}), 400
            warehouse.tipi = data['type']
            if data['type'] == 'açık':
                warehouse.yukseklik = None # Açık depolarda yükseklik olmamalı
        if 'yukseklik' in data:
            if warehouse.tipi == 'kapalı':
                try:
                    yukseklik = float(data['yukseklik'])
                    if yukseklik <= 0:
                        return jsonify({"msg": "Yükseklik pozitif bir sayı olmalı."}), 400
                    warehouse.yukseklik = yukseklik
                except (ValueError, TypeError):
                    return jsonify({"msg": "Yükseklik geçerli bir sayı olmalı."}), 400
            else:
                return jsonify({"msg": "Açık depolar için yükseklik belirtilemez."}), 400
        
        db.session.commit()
        return jsonify({"msg": "Depo başarıyla güncellendi!", "warehouse": warehouse.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Depo güncellenirken hata: {e}")
        return jsonify({"msg": "Depo güncellenirken bir hata oluştu.", "error": str(e)}), 500


@warehouse_bp.route('/warehouses/<int:warehouse_id>', methods=['DELETE'])
@jwt_required()
def delete_warehouse(warehouse_id):
    current_user_id = get_jwt_identity()
    try:
        warehouse = Warehouse.query.filter_by(id=warehouse_id, user_id=current_user_id).first()
        if not warehouse:
            return jsonify({"msg": "Depo bulunamadı veya bu depoyu silme izniniz yok."}), 404

        db.session.delete(warehouse)
        db.session.commit()
        return jsonify({"msg": "Depo başarıyla silindi!"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Depo silinirken hata: {e}")
        return jsonify({"msg": "Depo silinirken bir hata oluştu.", "error": str(e)}), 500