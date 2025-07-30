// components/map/DynamicMap.tsx
"use client";

import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-shadow.png';

// Import the Leaflet icon fix function
import { applyLeafletIconFix } from './helpers/leafletIconFix';

// Import the main map content component
import { MapContent } from './MapContent';

// Apply the fix once when the module is loaded
applyLeafletIconFix();

export interface DynamicMapProps {
    onAreaDrawn?: (geoJsonData: any) => void;
    initialCenter: [number, number];
    initialZoom?: number;
}

const DynamicMap: React.FC<DynamicMapProps> = ({ onAreaDrawn, initialCenter, initialZoom = 13 }) => {
    const featureGroupRef = useRef<L.FeatureGroup>(null);

    return (
        <MapContainer
            center={initialCenter}
            zoom={initialZoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapContent
                onAreaDrawn={onAreaDrawn}
                initialCenter={initialCenter}
                initialZoom={initialZoom}
                featureGroupRef={featureGroupRef}
            />
        </MapContainer>
    );
};

export default DynamicMap;