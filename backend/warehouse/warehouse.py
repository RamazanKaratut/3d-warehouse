# backend/warehouse.py (Son Hal)

from flask import Blueprint, request, jsonify, current_app # current_app loglama için eklendi
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db # db uzantısını import edin
from backend.models import Warehouse # Depo modeliniz (artık models.py'den geliyor)

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


@warehouse_bp.route('/add-warehouse', methods=['POST'])
@jwt_required()
def add_warehouse():
    current_user_id = get_jwt_identity()
    data = request.json

    name = data.get('name')
    location_description = data.get('locationDescription')
    area_coordinates = data.get('areaCoordinates')
    calculated_area_m2 = data.get('calculatedAreaM2')

    if not name or not location_description or not area_coordinates or calculated_area_m2 is None:
        return jsonify({"msg": "Eksik alanlar var."}), 400

    try:
        new_warehouse = Warehouse(
            name=name,
            location_description=location_description,
            area_coordinates=area_coordinates,
            calculated_area_m2=float(calculated_area_m2),
            user_id=current_user_id
        )
        db.session.add(new_warehouse)
        db.session.commit()
        return jsonify({"msg": "Depo başarıyla eklendi!", "id": new_warehouse.id}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Depo ekleme sırasında veritabanı hatası: {e}")
        return jsonify({"msg": "Depo eklenirken bir hata oluştu.", "error": str(e)}), 500


@warehouse_bp.route('/warehouses/<int:warehouse_id>', methods=['GET'])
@jwt_required()
def get_warehouse(warehouse_id):
    current_user_id = get_jwt_identity()
    try:
        # Sadece mevcut kullanıcıya ait ve belirtilen ID'ye sahip depoyu bul
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

        # Güncellenecek alanları kontrol et ve ata
        if 'name' in data:
            warehouse.name = data['name']
        if 'locationDescription' in data:
            warehouse.location_description = data['locationDescription']
        if 'areaCoordinates' in data:
            warehouse.area_coordinates = data['areaCoordinates']
        if 'calculatedAreaM2' in data:
            warehouse.calculated_area_m2 = float(data['calculatedAreaM2'])

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