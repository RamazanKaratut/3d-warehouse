import React, { useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import area from '@turf/area';

// Leaflet ikon düzeltmesi
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
  iconUrl: '/leaflet/images/marker-icon.png',
  shadowUrl: '/leaflet/images/marker-shadow.png',
});

interface DynamicMapProps {
  setDrawnArea: (area: any) => void;
  setCalculatedArea: (area: number | null) => void;
}

export default function DynamicMap({ setDrawnArea, setCalculatedArea }: DynamicMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const defaultCenter: [number, number] = [38.7208, 35.498]; // Kayseri koordinatları

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FeatureGroup>
        <EditControl
          position="topright"
          draw={{
            rectangle: false,
            circle: false,
            marker: false,
            polyline: false,
            circlemarker: false,
            polygon: {
              allowIntersection: false,
              drawError: {
                color: '#e1e100',
                message: 'İç içe poligon çizemezsiniz!',
              },
              shapeOptions: {
                color: '#ff7800',
              },
            },
          }}
          edit={{ remove: true }}
          onCreated={(e) => {
            const { layer, layerType } = e;
            if (layerType === 'polygon') {
              const geojson = layer.toGeoJSON();
              setDrawnArea(geojson);

              const calculated = area(geojson);
              setCalculatedArea(calculated);

              console.log('Çizilen Alan GeoJSON:', geojson);
              console.log('Hesaplanan Alan (Metrekare):', calculated.toFixed(2));
            }
          }}
          onEdited={(e) => {
            const { layers } = e;
            layers.eachLayer((layer: any) => {
              const geojson = layer.toGeoJSON();
              setDrawnArea(geojson);

              const calculated = area(geojson);
              setCalculatedArea(calculated);

              console.log('Düzenlenen Alan GeoJSON:', geojson);
              console.log('Hesaplanan Alan (Metrekare):', calculated.toFixed(2));
            });
          }}
          onDeleted={() => {
            setDrawnArea(null);
            setCalculatedArea(null);
            console.log('Çizilen Alan Silindi.');
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
}
