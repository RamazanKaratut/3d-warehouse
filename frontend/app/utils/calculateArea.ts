// utils/calculateArea.ts
import * as turf from '@turf/turf';

export function calculatePolygonArea(latlngs: [number, number][]) {
  const polygon = turf.polygon([[...latlngs, latlngs[0]]]); // kapalı alan
  const area = turf.area(polygon); // m² cinsinden
  return area;
}
