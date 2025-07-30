// components/map/components/SegmentDistanceDisplay.tsx
import React, { useEffect, useState } from 'react';
import L from 'leaflet';

interface SegmentDistanceDisplayProps {
    map: L.Map;
    segment: [L.LatLng, L.LatLng] | null;
}

export function SegmentDistanceDisplay({ map, segment }: SegmentDistanceDisplayProps) {
    const [marker, setMarker] = useState<L.Marker | null>(null);

    useEffect(() => {
        if (marker) {
            map.removeLayer(marker);
            setMarker(null);
        }
        if (segment) {
            const [p1, p2] = segment;
            const distance = map.distance(p1, p2);
            const mid = L.latLng((p1.lat + p2.lat) / 2, (p1.lng + p2.lng) / 2);

            const newMarker = L.marker(mid, {
                icon: L.divIcon({
                    className: 'distance-label',
                    html: `<div style="background-color: black; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75em;">${distance.toFixed(1)} m</div>`,
                    iconSize: [0, 0],
                }),
                interactive: false,
            }).addTo(map);

            setMarker(newMarker);
        }
        return () => {
            if (marker) {
                map.removeLayer(marker);
            }
        };
    }, [segment, map]);

    return null;
}