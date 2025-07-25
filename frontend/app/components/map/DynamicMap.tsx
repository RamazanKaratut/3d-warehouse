// app/components/map/DynamicMap.tsx
"use client";

import React, { useRef } from 'react'; // useRef'i import etmeyi unutmayın!
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet'; // FeatureGroup'u import edin!
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import L from 'leaflet';
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/marker-icon.png';

interface DynamicMapProps {
  onAreaDrawn?: (geoJsonData: any) => void;
}

// Leaflet ikon sorunu çözümü ve TypeScript hatası için düzeltme
declare module 'leaflet' {
  namespace Icon {
    interface Default {
      _getIconUrl?: () => string;
    }
  }
}

if (typeof window !== 'undefined') {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/_next/static/media/marker-icon-2x.png',
    iconUrl: '/_next/static/media/marker-icon.png',
    shadowUrl: '/_next/static/media/marker-shadow.png',
  });
  
  // Bu, _getIconUrl hatasını doğrudan çözen override metodudur.
  L.Icon.Default.prototype._getIconUrl = function (this: L.Icon.Default) {
    return (this as any).options.iconUrl;
  };
}


const DynamicMap: React.FC<DynamicMapProps> = ({ onAreaDrawn }) => {
  // FeatureGroup'a erişmek için bir ref oluşturuyoruz
  const featureGroupRef = useRef<L.FeatureGroup>(null);

  const onCreated = (e: any) => {
    const drawnLayer = e.layer;
    const geoJson = drawnLayer.toGeoJSON();
    console.log("Çizilen GeoJSON:", geoJson);
    
    if (onAreaDrawn) {
      onAreaDrawn(geoJson);
    }
  };

  // Eğer `edit` veya `remove` özelliklerini kullanmayacaksanız bile
  // `EditControl`'ün doğru çalışması için `featureGroup` prop'unu sağlamak önemlidir.
  // Varsayılan olarak Leaflet-draw'ın dahili mekanizmaları bu `featureGroup`'a güvenir.
  const onMounted = (drawControl: L.Control.Draw) => {
    if (featureGroupRef.current) {
      // Çizim kontrolünü featureGroup'a bağlamak için kullanılır
      // Leaflet-draw'ın iç mekanizmaları bunu zaten yapabilir, ancak bu bir güvenlik adımıdır.
      // drawControl.setDrawingOptions({ polygon: { featureGroup: featureGroupRef.current } });
    }
  };


  return (
    <MapContainer 
      center={[38.7153, 35.4924]} // Kayseri'nin yaklaşık koordinatları
      zoom={13} 
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* FeatureGroup'u buraya sarıyoruz */}
      <FeatureGroup ref={featureGroupRef}>
        <EditControl
          position="topright"
          onCreated={onCreated}
          onMounted={onMounted} // Optional: If you need to do something when EditControl mounts
          draw={{
            polyline: false,
            polygon: true,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false,
          }}
          // edit prop'unu aktif ederseniz, featureGroup'u doğrudan tanımlamanız gerekir.
          // Çünkü EditControl, düzenlenecek/silinecek katmanları bu gruptan bulur.
          edit={{
            featureGroup: featureGroupRef.current || undefined, 
            edit: true,    // Bu satır doğru şekilde bir nesnenin özelliği olarak tanımlandı
            remove: true,  // Bu satır doğru şekilde bir nesnenin özelliği olarak tanımlandı
            poly: {
              allowIntersection: false 
            }
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
};

export default DynamicMap;