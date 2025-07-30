// components/map/components/AngleDisplay.tsx
import React, { useEffect, useState } from 'react';
import L from 'leaflet';

interface AngleDisplayProps {
    map: L.Map;
    angles: { latlng: L.LatLng, angle: number }[];
    liveAngle?: { latlng: L.LatLng, angle: number } | null;
}

export function AngleDisplay({ map, angles, liveAngle }: AngleDisplayProps) {
    const [markers, setMarkers] = useState<L.Marker[]>([]);

    useEffect(() => {
        markers.forEach(marker => map.removeLayer(marker));
        const newMarkers: L.Marker[] = [];

        angles.forEach(angleData => {
            const marker = L.marker(angleData.latlng, {
                icon: L.divIcon({
                    className: 'angle-label',
                    html: `<div style="background-color: #007bff; color: white; padding: 2px 5px; border-radius: 3px; font-size: 0.7em;">${angleData.angle.toFixed(1)}°</div>`,
                    iconSize: [0, 0],
                }),
                interactive: false,
            }).addTo(map);
            newMarkers.push(marker);
        });

        if (liveAngle) {
            const liveMarker = L.marker(liveAngle.latlng, {
                icon: L.divIcon({
                    className: 'angle-label',
                    html: `<div style="background-color: orange; color: white; padding: 2px 5px; border-radius: 3px; font-size: 0.7em;">${liveAngle.angle.toFixed(1)}°</div>`,
                    iconSize: [0, 0],
                }),
                interactive: false,
            }).addTo(map);
            newMarkers.push(liveMarker);
        }

        setMarkers(newMarkers);

        return () => {
            newMarkers.forEach(marker => map.removeLayer(marker));
        };
    }, [angles, liveAngle, map]);


    return null;
}