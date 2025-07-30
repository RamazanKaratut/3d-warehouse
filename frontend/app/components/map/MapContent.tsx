// components/map/MapContent.tsx
import React, { useRef, useEffect, useState } from 'react';
import { FeatureGroup, useMap, useMapEvents } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';

import { calculateAngle } from './helpers/calculateAngle';
import { AngleDisplay } from './components/AngleDisplay';
import { SegmentDistanceDisplay } from './components/SegmentDistanceDisplay';
import { ChangeView } from './components/ChangeView';
import { getEditorFromFeatureGroup, extractLatLngsFromEditor, computeAllAngles } from './helpers/drawingUtils';

interface MapContentProps {
    onAreaDrawn?: (geoJsonData: any) => void;
    initialCenter: [number, number];
    initialZoom: number;
    featureGroupRef: React.RefObject<L.FeatureGroup>;
}

export function MapContent({ onAreaDrawn, initialCenter, initialZoom, featureGroupRef }: MapContentProps) {
    const map = useMap();
    const [drawnLayers, setDrawnLayers] = useState<L.Layer[]>([]);
    const [angles, setAngles] = useState<{ latlng: L.LatLng, angle: number }[]>([]);
    const [segment, setSegment] = useState<[L.LatLng, L.LatLng] | null>(null);
    const [liveAngle, setLiveAngle] = useState<{ latlng: L.LatLng, angle: number } | null>(null);

    useMapEvents({
        // Örneğin:
        // click: (e) => console.log('Map clicked:', e.latlng),
    });

    useEffect(() => {
        const featureGroup = featureGroupRef.current;
        if (!featureGroup) return;

        featureGroup.on(L.Draw.Event.DRAWVERTEX, (e: any) => {
            const latlngs = extractLatLngsFromEditor(e.target.editor);
            setSegment(latlngs.length >= 2 ? [latlngs.at(-2), latlngs.at(-1)] : null);
            setAngles(computeAllAngles(latlngs));
        });

        featureGroup.on(L.Draw.Event.DRAWSTART, () => {
            setSegment(null);
            setAngles([]);
        });

        return () => {
            featureGroup.off(L.Draw.Event.DRAWVERTEX);
            featureGroup.off(L.Draw.Event.DRAWSTART);
        };
    }, [featureGroupRef, map]);

    useEffect(() => {
        const mapElement = map.getContainer();

        function handleMouseMove(e: MouseEvent) {
            const editor = getEditorFromFeatureGroup(featureGroupRef.current!);
            const latlngs = extractLatLngsFromEditor(editor);

            if (!editor || !editor._drawing || latlngs.length < 2) {
                setLiveAngle(null);
                return;
            }

            const prevPoint = latlngs.at(-2);
            const currPoint = latlngs.at(-1);
            const nextPoint = map.mouseEventToLatLng(e);

            const angle = calculateAngle(prevPoint, currPoint, nextPoint);
            setLiveAngle({ latlng: currPoint, angle });
        }

        mapElement.addEventListener('mousemove', handleMouseMove);
        return () => mapElement.removeEventListener('mousemove', handleMouseMove);
    }, [map, featureGroupRef]);

    return (
        <>
            <ChangeView center={initialCenter} zoom={initialZoom} />
            <FeatureGroup ref={featureGroupRef}>
                <EditControl
                    position="topright"
                    onCreated={(e: any) => {
                        const drawnLayer = e.layer;
                        const geoJson = drawnLayer.toGeoJSON();
                        setAngles([]);
                        setSegment(null);
                        setDrawnLayers(prev => [...prev, drawnLayer]);
                        if (onAreaDrawn) onAreaDrawn(geoJson);

                        if (drawnLayer instanceof L.Polygon) {
                            const latlngs = drawnLayer.getLatLngs()[0] as L.LatLng[];
                            const updatedAngles: { latlng: L.LatLng, angle: number }[] = [];
                            if (latlngs.length >= 3) {
                                for (let i = 0; i < latlngs.length; i++) {
                                    const prevPoint = latlngs[(i - 1 + latlngs.length) % latlngs.length];
                                    const currPoint = latlngs[i];
                                    const nextPoint = latlngs[(i + 1) % latlngs.length];
                                    const angle = calculateAngle(prevPoint, currPoint, nextPoint);
                                    updatedAngles.push({ latlng: currPoint, angle });
                                }
                            }
                            setAngles(updatedAngles);
                            console.log('DRAW:CREATED. Final angles:', updatedAngles);
                        }
                    }}
                    onEdited={(e: any) => {
                        const layers = e.layers;
                        const updatedAngles: { latlng: L.LatLng, angle: number }[] = [];
                        layers.eachLayer((layer: any) => {
                            if (layer instanceof L.Polygon) {
                                const latlngs = layer.getLatLngs()[0] as L.LatLng[];
                                if (latlngs.length >= 3) {
                                    for (let i = 0; i < latlngs.length; i++) {
                                        const prevPoint = latlngs[(i - 1 + latlngs.length) % latlngs.length];
                                        const currPoint = latlngs[i];
                                        const nextPoint = latlngs[(i + 1) % latlngs.length];
                                        const angle = calculateAngle(prevPoint, currPoint, nextPoint);
                                        updatedAngles.push({ latlng: currPoint, angle });
                                    }
                                }
                            }
                        });
                        setAngles(updatedAngles);
                        setSegment(null);
                        console.log('DRAW:EDITED. Updated angles:', updatedAngles);
                    }}
                    onDeleted={(e: any) => {
                        setAngles([]);
                        setSegment(null);
                        setDrawnLayers(prev => prev.filter(layer => !e.layers.hasLayer(layer)));
                        if (onAreaDrawn) onAreaDrawn(null);
                        console.log('DRAW:DELETED: Angles and segment cleared.');
                    }}
                    draw={{
                        polyline: false,
                        polygon: {
                            allowIntersection: false,
                            showArea: false,
                            showLength: true,
                            metric: true,
                            shapeOptions: { color: '#007bff' }
                        },
                        rectangle: false,
                        circle: false,
                        circlemarker: false,
                        marker: false,
                    }}
                    edit={{
                        featureGroup: featureGroupRef.current || undefined,
                        edit: true,
                        remove: true,
                        poly: { allowIntersection: false },
                    }}
                />
            </FeatureGroup>
            <AngleDisplay map={map} angles={angles} />
            <SegmentDistanceDisplay map={map} segment={segment} />
        </>
    );
}