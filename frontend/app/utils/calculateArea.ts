// utils/calculateArea.ts
import * as turf from '@turf/turf';

export function calculatePolygonArea(latlngs: [number, number][]) {
  const polygon = turf.polygon([[...latlngs, latlngs[0]]]);
  const area = turf.area(polygon);
  return area;
}
