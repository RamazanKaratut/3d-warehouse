// components/map/helpers/calculateAngle.ts
import L from 'leaflet';

export function calculateAngle(prevPoint: L.LatLng, currPoint: L.LatLng, nextPoint: L.LatLng): number {
    const v1 = [prevPoint.lng - currPoint.lng, prevPoint.lat - currPoint.lat];
    const v2 = [nextPoint.lng - currPoint.lng, nextPoint.lat - currPoint.lat];

    const dotProduct = v1[0] * v2[0] + v1[1] * v2[1];
    const magnitude1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2);
    const magnitude2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2);

    console.log('calculateAngle inputs:', { prevPoint, currPoint, nextPoint });
    console.log('v1:', v1, 'v2:', v2);
    console.log('dotProduct:', dotProduct, 'magnitude1:', magnitude1, 'magnitude2:', magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
        console.warn('One of the magnitudes is zero, returning 0 angle.');
        return 0;
    }

    let cosAngle = dotProduct / (magnitude1 * magnitude2);
    cosAngle = Math.max(-1, Math.min(1, cosAngle));

    let angleRad = Math.acos(cosAngle);
    let angleDeg = angleRad * (180 / Math.PI);

    console.log('calculated angleDeg:', angleDeg);
    return angleDeg;
}