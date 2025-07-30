# backend/map/map.py (Yeni bir dosya olabilir)
from flask import Blueprint, jsonify, request, current_app # current_app import edildi
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from tools import maps_navigation # maps_navigation aracını import edin

map_bp = Blueprint('map_bp', __name__)

@map_bp.route('/get-map-directions', methods=['POST'])
@jwt_required()
def get_map_directions():
    data = request.json
    destination = data.get('destination') # Frontend'den gelen konum

    if not destination:
        return jsonify({"msg": "Hedef konumu belirtmelisiniz."}), 400

    try:
        # maps_navigation aracını kullanarak yol tarifi bulun
        # Origin'i belirtmezseniz varsayılan olarak kullanıcının mevcut konumu alınır.
        # Veya origin olarak "MY_LOCATION" kullanabilirsiniz.
        directions_summary = maps_navigation.Google_Maps( # Burası düzeltildi!
            destination=destination,
            travel_mode=maps_navigation.TravelMode.DRIVING # Varsayılan olarak sürüş modu
        )

        # Dönüş tipi kontrolü düzeltildi, DirectionsSummary nesnesini bekliyoruz.
        # strings_summary'nin bir string olma ihtimali ortadan kaldırıldı
        if directions_summary and directions_summary.routes:
            route_url = directions_summary.routes[0].url
            return jsonify({"mapUrl": route_url, "message": "Yol tarifi başarıyla alındı."}), 200
        else:
            return jsonify({"msg": "Belirtilen konuma yol tarifi bulunamadı."}), 404

    except Exception as e:
        # Hata durumunda loglama ve genel hata mesajı döndürme
        current_app.logger.error(f"Harita yönlendirme sırasında hata: {e}")
        return jsonify({"msg": "Harita yönlendirme sırasında bir sunucu hatası oluştu.", "error": str(e)}), 500