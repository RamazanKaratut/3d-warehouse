// app/utils/babylonUtils.ts
import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';

if (!(window as any).earcut) {
    (window as any).earcut = earcut;
}

if (BABYLON.PolygonMeshBuilder) {
    if (!(BABYLON.PolygonMeshBuilder as any)._Earcut) {
        (BABYLON.PolygonMeshBuilder as any)._Earcut = earcut;
    }
} else if (BABYLON.Mesh) {
    if (!(BABYLON.Mesh as any)._Earcut) {
        (BABYLON.Mesh as any)._Earcut = earcut;
    }
}
export const getMetersPerDegreeAtLatitude = (latitude: number) => {
    const EARTH_RADIUS_METERS = 6371000; 
    const circumferenceAtEquator = 2 * Math.PI * EARTH_RADIUS_METERS;
    const metersPerLatDegree = circumferenceAtEquator / 360;
    const metersPerLonDegree = metersPerLatDegree * Math.cos(latitude * Math.PI / 180);
    if (isNaN(metersPerLatDegree) || isNaN(metersPerLonDegree) || !isFinite(metersPerLatDegree) || !isFinite(metersPerLonDegree)) {
        console.error("HATA: metersPerDegree hesaplamasında geçersiz değer (NaN veya sonsuz) oluştu. Latitude:", latitude);
        return { metersPerLatDegree: 0, metersPerLonDegree: 0 }; // Hatalı durumda sıfır döndür
    }
    
    return { metersPerLatDegree, metersPerLonDegree };
};