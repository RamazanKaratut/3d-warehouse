// components/map/components/ChangeView.tsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface ChangeViewProps {
    center: [number, number];
    zoom: number;
}

export function ChangeView({ center, zoom }: ChangeViewProps) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}