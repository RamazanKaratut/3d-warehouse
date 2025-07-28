// app/components/map/DynamicMap.tsx
"use client";

import React, { useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import L from 'leaflet';
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/marker-icon.png';

import { DynamicMapProps } from '../../types/warehouse';

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
  
  L.Icon.Default.prototype._getIconUrl = function (this: L.Icon.Default) {
    return (this as any).options.iconUrl;
  };
}

const DynamicMap: React.FC<DynamicMapProps> = ({ onAreaDrawn }) => {
  const featureGroupRef = useRef<L.FeatureGroup>(null);

  const onCreated = (e: any) => {
    const drawnLayer = e.layer;
    const geoJson = drawnLayer.toGeoJSON();
    console.log("Çizilen GeoJSON:", geoJson);
    
    if (onAreaDrawn) {
      onAreaDrawn(geoJson);
    }
  };

  const onMounted = (drawControl: L.Control.Draw) => {
    if (featureGroupRef.current) {
      // Bu kısım genellikle otomatik halledilir ama burayı bırakmak sorun olmaz.
    }
  };

  return (
    <MapContainer 
      center={[38.7153, 35.4924]} // Kayseri'nin yaklaşık koordinatları
      zoom={13} 
      style={{ height: '100%', width: '100%' }} // Yüksekliği '100%' olarak ayarladık!
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      
      <FeatureGroup ref={featureGroupRef}>
        <EditControl
          position="topright"
          onCreated={onCreated}
          onMounted={onMounted}
          draw={{
            polyline: false,
            polygon: true,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false,
          }}
          edit={{
            featureGroup: featureGroupRef.current || undefined, 
            edit: true,
            remove: true,
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