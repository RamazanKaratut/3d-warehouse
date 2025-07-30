import L from 'leaflet';
import { calculateAngle } from './calculateAngle';

export function getEditorFromFeatureGroup(featureGroup: L.FeatureGroup): any {
    const layers = (featureGroup as any)._layers;
    const firstKey = Object.keys(layers)[0];
    return layers[firstKey]?.editor;
}

export function extractLatLngsFromEditor(editor: any): L.LatLng[] {
    if (!editor || !editor._vertices) return [];
    return editor._vertices.map((v: any) => v.latlng);
}

export function computeAllAngles(latlngs: L.LatLng[]): { latlng: L.LatLng; angle: number }[] {
    const angles: { latlng: L.LatLng; angle: number }[] = [];
    if (latlngs.length < 3) return angles;

    for (let i = 1; i < latlngs.length - 1; i++) {
        const prevPoint = latlngs[i - 1];
        const currPoint = latlngs[i];
        const nextPoint = latlngs[i + 1];
        const angle = calculateAngle(prevPoint, currPoint, nextPoint);
        angles.push({ latlng: currPoint, angle });
    }

    return angles;
}

export function computePolygonAngles(latlngs: L.LatLng[]): { latlng: L.LatLng; angle: number }[] {
    const angles: { latlng: L.LatLng; angle: number }[] = [];
    const len = latlngs.length;

    if (len < 3) return angles;

    for (let i = 0; i < len; i++) {
        const prev = latlngs[(i - 1 + len) % len];
        const curr = latlngs[i];
        const next = latlngs[(i + 1) % len];
        const angle = calculateAngle(prev, curr, next);
        angles.push({ latlng: curr, angle });
    }

    return angles;
}
