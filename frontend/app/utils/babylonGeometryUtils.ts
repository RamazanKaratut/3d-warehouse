// app/utils/babylonGeometryUtils.ts
import * as BABYLON from '@babylonjs/core';
import { Nullable, Scene } from '@babylonjs/core';
import { getMetersPerDegreeAtLatitude } from '@/app/utils/babylonUtils';

/**
 * Varsayılan bir zemin oluşturur ve kamerayı buna göre konumlandırır.
 * @param scene Babylon.js sahnesi.
 * @param camera Babylon.js kamerası.
 * @returns Temizleme fonksiyonu.
 */
export const createDefaultGround = (scene: Scene, camera: BABYLON.UniversalCamera): (() => void) => {
    console.warn("GeoJSON verisi geçersiz veya eksik. Varsayılan zemin çiziliyor.");
    const defaultFloor = BABYLON.MeshBuilder.CreateGround('defaultFloor', { width: 10, height: 10 }, scene);
    const defaultFloorMaterial = new BABYLON.StandardMaterial("defaultFloorMaterial", scene);
    defaultFloorMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    defaultFloor.material = defaultFloorMaterial;
    console.log("Varsayılan zemin başarıyla oluşturuldu.");

    camera.position = new BABYLON.Vector3(0, 10, -10);
    camera.setTarget(BABYLON.Vector3.Zero());
    console.log("Kamera varsayılan zemine göre ayarlandı.");

    return () => {
        defaultFloor.dispose();
        console.log("Varsayılan zemin dispose edildi.");
    };
};

/**
 * GeoJSON verilerinden depo zeminini ve duvarlarını oluşturur.
 * @param geoJsonCoords GeoJSON koordinatları.
 * @param warehouseHeight Depo yüksekliği.
 * @param WALL_THICKNESS Duvar kalınlığı.
 * @param scene Babylon.js sahnesi.
 * @param warehouseContainer Depo mesh'lerinin ekleneceği TransformNode.
 * @returns Oluşturulan zemin ve duvar mesh'leri ile bounding box bilgileri.
 */
export const createWarehouseGeometry = (
    geoJsonCoords: number[][],
    warehouseHeight: number,
    WALL_THICKNESS: number,
    scene: Scene,
    warehouseContainer: BABYLON.TransformNode
) => {
    console.log("geoJsonCoords (koordinatların ilk dizisi):", geoJsonCoords);

    if (!Array.isArray(geoJsonCoords) || geoJsonCoords.length < 3) {
        console.error("HATA: GeoJSON koordinatları eksik, geçersiz veya bir dizi değil. Minimum 3 nokta gerekir. geoJsonCoords:", geoJsonCoords);
        return { floorMesh: null, wallMeshes: [], minWorld: BABYLON.Vector3.Zero(), maxWorld: BABYLON.Vector3.Zero() };
    }

    const allLon = geoJsonCoords.map((c: number[]) => c[0]);
    const allLat = geoJsonCoords.map((c: number[]) => c[1]);

    console.log("Tüm Longitude değerleri:", allLon);
    console.log("Tüm Latitude değerleri:", allLat);

    const areAllLonNumbers = allLon.every((val: any) => typeof val === 'number' && isFinite(val));
    const areAllLatNumbers = allLat.every((val: any) => typeof val === 'number' && isFinite(val));

    if (!areAllLonNumbers || !areAllLatNumbers) {
        console.error("HATA: Longitude veya Latitude değerleri sayı değil veya sonsuz!");
        return { floorMesh: null, wallMeshes: [], minWorld: BABYLON.Vector3.Zero(), maxWorld: BABYLON.Vector3.Zero() };
    }

    const minLon = Math.min(...allLon);
    const maxLon = Math.max(...allLon);
    const minLat = Math.min(...allLat);
    const maxLat = Math.max(...allLat);

    console.log(`minLon: ${minLon}, maxLon: ${maxLon}, minLat: ${minLat}, maxLat: ${maxLat}`);

    if (!isFinite(minLon) || !isFinite(maxLon) || !isFinite(minLat) || !isFinite(maxLat)) {
        console.error("HATA: min/max enlem/boylam değerleri sonsuz veya NaN!");
        return { floorMesh: null, wallMeshes: [], minWorld: BABYLON.Vector3.Zero(), maxWorld: BABYLON.Vector3.Zero() };
    }

    const avgLat = (minLat + maxLat) / 2;
    const { metersPerLatDegree, metersPerLonDegree } = getMetersPerDegreeAtLatitude(avgLat);

    console.log(`avgLat: ${avgLat}, metersPerLatDegree: ${metersPerLatDegree}, metersPerLonDegree: ${metersPerLonDegree}`);

    if (!isFinite(metersPerLatDegree) || !isFinite(metersPerLonDegree) || metersPerLatDegree === 0 || metersPerLonDegree === 0) {
        console.error("HATA: metersPerDegree değerleri geçersiz (sonsuz, NaN veya sıfır)! Hesaplama yapılamıyor.");
        return { floorMesh: null, wallMeshes: [], minWorld: BABYLON.Vector3.Zero(), maxWorld: BABYLON.Vector3.Zero() };
    }

    const offsetX = minLon;
    const offsetZ = minLat;

    let path: BABYLON.Vector3[];
    try {
        path = geoJsonCoords.map((coord: number[]) => {
            const x = (coord[0] - offsetX) * metersPerLonDegree;
            const z = (coord[1] - offsetZ) * metersPerLatDegree;

            if (!isFinite(x) || !isFinite(z)) {
                console.error(`HATA: Koordinat dönüştürme sonrası x veya z değeri sonsuz/NaN oldu! Orijinal: [${coord[0]}, ${coord[1]}], Offset: [${offsetX}, ${offsetZ}], Derece: [${metersPerLonDegree}, ${metersPerLatDegree}], Sonuç: [${x}, ${z}]`);
                throw new Error("Invalid coordinate transformation result");
            }
            return new BABYLON.Vector3(x, 0, z);
        });
    } catch (e) {
        console.error("HATA: Yol (path) oluşturulurken bir istisna oluştu (muhtemelen geçersiz koordinat):", e);
        return { floorMesh: null, wallMeshes: [], minWorld: BABYLON.Vector3.Zero(), maxWorld: BABYLON.Vector3.Zero() };
    }

    console.log("Oluşturulan Babylon Path (Vektörler):", path);

    if (path.length === 0) {
        console.error("HATA: Path boş kaldı. GeoJSON koordinatlarını tekrar kontrol edin.");
        return { floorMesh: null, wallMeshes: [], minWorld: BABYLON.Vector3.Zero(), maxWorld: BABYLON.Vector3.Zero() };
    }

    const widthInMeters = (maxLon - minLon) * metersPerLonDegree;
    const lengthInMeters = (maxLat - minLat) * metersPerLatDegree;
    console.log(`Hesaplanan Genişlik: ${widthInMeters}m, Uzunluk: ${lengthInMeters}m`);

    if (widthInMeters <= 0.001 || lengthInMeters <= 0.001) {
        console.error("HATA: Hesaplanan genişlik veya uzunluk çok küçük veya sıfır. GeoJSON verisini kontrol edin.");
        return { floorMesh: null, wallMeshes: [], minWorld: BABYLON.Vector3.Zero(), maxWorld: BABYLON.Vector3.Zero() };
    }

    let floorMesh: Nullable<BABYLON.Mesh> = null;
    try {
        floorMesh = BABYLON.MeshBuilder.CreatePolygon('depoZemin', {
            shape: path,
            depth: 0.1,
            updatable: false,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene);
        console.log("Depo Zemini (floorMesh) başarıyla oluşturuldu.");
        const floorMaterial = new BABYLON.StandardMaterial("floorMaterial", scene);
        floorMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.25, 0.1);
        floorMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        floorMesh.material = floorMaterial;
        floorMesh.parent = warehouseContainer;
    } catch (e) {
        console.error("HATA: Depo Zemini oluşturulurken bir istisna oluştu (muhtemelen earcut):", e);
        return { floorMesh: null, wallMeshes: [], minWorld: BABYLON.Vector3.Zero(), maxWorld: BABYLON.Vector3.Zero() };
    }

    console.log("Depo Yüksekliği:", warehouseHeight);
    if (warehouseHeight <= 0 || !isFinite(warehouseHeight)) {
        console.error("HATA: Geçersiz depo yüksekliği:", warehouseHeight);
        return { floorMesh, wallMeshes: [], minWorld: BABYLON.Vector3.Zero(), maxWorld: BABYLON.Vector3.Zero() }; // Zemin oluşturulduysa onu döndür
    }

    const wallMeshes: BABYLON.Mesh[] = [];

    // Duvar oluşturma
    // warehouseData.tipi kontrolü çağrı yerinde yapılmalı, burada sadece mesh oluşturulur.
    const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
    wallMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    wallMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    wallMaterial.roughness = 0.8;

    for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];

        const wallName = `wall_${i}`;
        let wallLength = BABYLON.Vector3.Distance(p1, p2);
        wallLength += WALL_THICKNESS; // Duvar kalınlığını uzunluğa ekleyerek köşelerde boşlukları kapatmaya yardımcı olabilir.

        const wallMidpoint = BABYLON.Vector3.Lerp(p1, p2, 0.5);
        const wallDirection = p2.subtract(p1).normalize();
        let wallRotationY = Math.atan2(wallDirection.x, wallDirection.z);

        try {
            const wall = BABYLON.MeshBuilder.CreateBox(wallName, {
                width: WALL_THICKNESS,
                height: warehouseHeight,
                depth: wallLength
            }, scene);

            wall.material = wallMaterial;
            wall.position = new BABYLON.Vector3(wallMidpoint.x, warehouseHeight / 2, wallMidpoint.z);
            wall.rotation.y = wallRotationY;
            wall.parent = warehouseContainer; // Konteynere ekle
            wallMeshes.push(wall);
            console.log(`Duvar ${i} başarıyla oluşturuldu. Rotasyon Y: ${wallRotationY * (180 / Math.PI)} derece`);
        } catch (e) {
            console.error(`HATA: Duvar ${i} oluşturulurken bir istisna oluştu:`, e);
        }
    }

    // Konteynerin bounding box'unu hesapla
    const bounds = warehouseContainer.getHierarchyBoundingVectors(true);
    const minWorld = bounds.min;
    const maxWorld = bounds.max;
    console.log("Warehouse Bounding Box - Min:", minWorld, "Max:", maxWorld);

    return { floorMesh, wallMeshes, minWorld, maxWorld };
};