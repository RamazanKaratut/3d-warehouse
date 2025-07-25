// app/components/map/DynamicMap.tsx
"use client"; // Bu bileşenin bir Client Component olduğunu belirtir

import { MapContainer, TileLayer } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Leaflet ikonlarının doğru görünmesi için gerekli ayarlar ve importlar
import L from 'leaflet';
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/marker-icon.png';

// DynamicMap bileşeninin alacağı prop'ları tanımlayan arayüz
interface DynamicMapProps {
  onAreaDrawn?: (geoJsonData: any) => void; // onAreaDrawn prop'unu burada tanımlıyoruz
}

// Bu kısım, Next.js'deki "Map container is already initialized" ve ikon sorunlarını çözer.
// Leaflet'in varsayılan ikon yollarını yeniden tanımlıyoruz.
if (typeof window !== 'undefined') { // Sadece tarayıcı ortamında çalıştır
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/_next/static/media/marker-icon-2x.png',
    iconUrl: '/_next/static/media/marker-icon.png',
    shadowUrl: '/_next/static/media/marker-shadow.png',
  });
}

// DynamicMap bileşenini tanımlarken DynamicMapProps arayüzünü kullanıyoruz
const DynamicMap: React.FC<DynamicMapProps> = ({ onAreaDrawn }) => {
  // EditControl'den çizim olaylarını yakalamak için fonksiyon
  const onCreated = (e: any) => {
    const drawnLayer = e.layer;
    const geoJson = drawnLayer.toGeoJSON();
    console.log("Çizilen GeoJSON:", geoJson);
    
    // Eğer onAreaDrawn prop'u varsa, GeoJSON verisini geri gönder
    if (onAreaDrawn) {
      onAreaDrawn(geoJson);
    }
  };

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* EditControl'ü aktif ediyoruz ve onCreated event'ini bağlıyoruz */}
      <EditControl
        position="topright"
        onCreated={onCreated} // Çizim tamamlandığında onCreated'ı çağır
        draw={{
          polyline: false, // Çizim seçenekleri
          polygon: true,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
        }}
      />
    </MapContainer>
  );
};

export default DynamicMap;