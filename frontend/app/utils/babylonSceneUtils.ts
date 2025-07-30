// app/utils/babylonSceneUtils.ts
import * as BABYLON from '@babylonjs/core';
import { Nullable } from '@babylonjs/core/types';
import '@babylonjs/loaders/glTF';
import { getMetersPerDegreeAtLatitude } from '@/app/utils/babylonUtils'; // Mevcut yardımcı
import { setupCameraControls } from './babylonCameraControls'; // Yeni kamera kontrol yardımcı
import { createWarehouseGeometry, createDefaultGround } from './babylonGeometryUtils'; // Yeni geometri yardımcı

const WALL_THICKNESS = 0.1; // Sabit değer

export const createBabylonScene = (canvas: HTMLCanvasElement, warehouseData: any): (() => void) => {
    console.log("createScene çağrıldı. warehouseData mevcut:", !!warehouseData);

    const engine = new BABYLON.Engine(canvas as Nullable<HTMLCanvasElement>, true);
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.9, 0.9, 0.9, 1);

    // Işıklar
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    light.diffuse = new BABYLON.Color3(1, 1, 1);

    const directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(0, -1, 1), scene);
    directionalLight.position = new BABYLON.Vector3(0, 20, -20);
    directionalLight.intensity = 0.8;
    directionalLight.diffuse = new BABYLON.Color3(1, 1, 0.9);
    directionalLight.specular = new BABYLON.Color3(0.5, 0.5, 0.5);

    let warehouseContainer: BABYLON.TransformNode | null = null;
    warehouseContainer = new BABYLON.TransformNode("warehouseContainer", scene);
    console.log("warehouseContainer oluşturuldu.");

    // Kamera kurulumu ve kontrolleri
    const { camera, cleanupControls } = setupCameraControls(canvas, scene);

    let cleanupGeometry: (() => void) | undefined;
    let centerPoint = BABYLON.Vector3.Zero();

    if (warehouseData && warehouseData.alan_verisi_3d && warehouseData.alan_verisi_3d.geojson_data &&
        warehouseData.alan_verisi_3d.geojson_data.geometry && warehouseData.alan_verisi_3d.geojson_data.geometry.coordinates) {

        console.log("GeoJSON veri yolu geçerli. İşleme başlıyor.");
        const geoJsonCoords = warehouseData.alan_verisi_3d.geojson_data.geometry.coordinates[0];
        const warehouseHeight = warehouseData.yukseklik || 5;

        // Geometri oluşturma işini yardımcı fonksiyona devret
        const { floorMesh, wallMeshes, minWorld, maxWorld } = createWarehouseGeometry(
            geoJsonCoords,
            warehouseHeight,
            WALL_THICKNESS,
            scene,
            warehouseContainer
        );

        if (floorMesh || (warehouseData.tipi === 'kapalı' && wallMeshes.length > 0)) {
            // Depo sınırları kontrolü ve kamera ayarlaması
            if (!isFinite(minWorld.x) || !isFinite(minWorld.y) || !isFinite(minWorld.z) ||
                !isFinite(maxWorld.x) || !isFinite(maxWorld.y) || !isFinite(maxWorld.z)) {
                console.error("HATA: Bounding box değerleri sonsuz veya NaN. Varsayılan zemin çiziliyor.");
                cleanupGeometry = createDefaultGround(scene, camera);
            } else {
                centerPoint = new BABYLON.Vector3(
                    (minWorld.x + maxWorld.x) / 2,
                    (minWorld.y + maxWorld.y) / 2,
                    (minWorld.z + maxWorld.z) / 2
                );
                console.log("Hesaplanan Center Point:", centerPoint);

                warehouseContainer.position.subtractInPlace(centerPoint);
                console.log("Depo konteyneri merkeze taşındı. Yeni pozisyon:", warehouseContainer.position);

                const bbWidth = maxWorld.x - minWorld.x;
                const bbDepth = maxWorld.z - minWorld.z;
                const bbHeight = maxWorld.y - minWorld.y;

                const maxDim = Math.max(bbWidth, bbDepth, bbHeight);
                console.log(`Hesaplanan Depo Boyutları: Genişlik=${bbWidth}, Uzunluk=${bbDepth}, Yükseklik=${bbHeight}. En Büyük Boyut: ${maxDim}`);

                if (!isFinite(maxDim) || maxDim <= 0) {
                    console.error("HATA: Max boyut değeri sonsuz, NaN veya sıfır. Kamera ayarlanması mümkün değil.");
                    cleanupGeometry = createDefaultGround(scene, camera);
                } else {
                    camera.position = new BABYLON.Vector3(
                        0,
                        maxDim * 0.8,
                        -maxDim * 1.5
                    );
                    camera.setTarget(BABYLON.Vector3.Zero());
                }
            }

            // Duvar görünürlüğü mantığını buraya taşıyoruz (eğer wallMeshes varsa)
            if (warehouseData.tipi === 'kapalı' && wallMeshes.length > 0) {
                (scene as any).wallMeshes = wallMeshes; // Kamera kontrolü için erişilebilir yap
            }
        } else {
            console.error("HATA: Hiçbir depo mesh'i (zemin veya duvar) oluşturulamadı. Varsayılan zemin çiziliyor.");
            cleanupGeometry = createDefaultGround(scene, camera);
        }

    } else {
        console.warn("warehouseData geçersiz veya eksik. Varsayılan zemin çiziliyor.");
        cleanupGeometry = createDefaultGround(scene, camera);
    }

    engine.runRenderLoop(() => {
        scene.render();
    });

    const resize = () => {
        engine.resize();
    };
    window.addEventListener('resize', resize);

    return () => {
        window.removeEventListener('resize', resize);
        cleanupControls(); // Kamera kontrollerini temizle
        if (cleanupGeometry) {
            cleanupGeometry(); // Geometri temizliğini yap
        }
        engine.dispose();
        if (warehouseContainer) {
            warehouseContainer.dispose(false, true);
        }
        (scene as any).wallMeshes = undefined; // Null olarak ayarla
        console.log("Babylon.js sahnesi ve ilgili kaynaklar temizlendi.");
    };
};