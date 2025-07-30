// app/utils/babylonCameraControls.ts
import * as BABYLON from '@babylonjs/core';
import { Scene } from '@babylonjs/core';

const WALL_THICKNESS = 0.1; // Bağımlılığı azaltmak için burada da tanımlanabilir veya merkezi bir sabitler dosyasından alınabilir.

export const setupCameraControls = (canvas: HTMLCanvasElement, scene: Scene) => {
    const camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    camera.speed = 250;
    camera.angularSensibility = 1000;
    camera.attachControl(canvas, true);
    camera.minZ = 0.01;

    // Varsayılan Babylon kamera tuşlarını devre dışı bırak
    camera.keysUp = [];
    camera.keysDown = [];
    camera.keysLeft = [];
    camera.keysRight = [];
    camera.keysUpward = [];
    camera.keysDownward = [];

    const keyMap: { [key: string]: boolean } = {};
    const onKeyDown = (event: KeyboardEvent) => {
        keyMap[event.key.toLowerCase()] = true;
    };
    const onKeyUp = (event: KeyboardEvent) => {
        keyMap[event.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const onBeforeRenderObserver = scene.onBeforeRenderObservable.add(() => {
        let moveVector = BABYLON.Vector3.Zero();

        const deltaTimeInSeconds = scene.getEngine().getDeltaTime() / 1000;
        const currentFrameSpeed = camera.speed * deltaTimeInSeconds;

        const forward = camera.getDirection(BABYLON.Vector3.Forward());
        const right = camera.getDirection(BABYLON.Vector3.Right());

        const flatForward = new BABYLON.Vector3(forward.x, 0, forward.z).normalize();
        const flatRight = new BABYLON.Vector3(right.x, 0, right.z).normalize();

        if (keyMap['w'] || keyMap['arrowup']) {
            moveVector.addInPlace(flatForward.scale(currentFrameSpeed));
        }
        if (keyMap['s'] || keyMap['arrowdown']) {
            moveVector.addInPlace(flatForward.scale(-currentFrameSpeed));
        }
        if (keyMap['a'] || keyMap['arrowleft']) {
            moveVector.addInPlace(flatRight.scale(-currentFrameSpeed));
        }
        if (keyMap['d'] || keyMap['arrowright']) {
            moveVector.addInPlace(flatRight.scale(currentFrameSpeed));
        }

        if (keyMap['e'] || keyMap[' ']) {
            moveVector.addInPlace(BABYLON.Vector3.Up().scale(currentFrameSpeed));
        }
        if (keyMap['q'] || keyMap['shift']) {
            moveVector.addInPlace(BABYLON.Vector3.Down().scale(currentFrameSpeed));
        }

        camera.position.addInPlace(moveVector);

        // Duvar görünürlüğü mantığı
        if ((scene as any).wallMeshes && (scene as any).wallMeshes.length > 0) {
            const cameraPosition = camera.position;
            (scene as any).wallMeshes.forEach((wall: BABYLON.Mesh) => {
                const wallLocalNormal = new BABYLON.Vector3(1, 0, 0);
                const wallWorldNormal = BABYLON.Vector3.TransformNormal(wallLocalNormal, wall.getWorldMatrix()).normalize();
                const outerSurfacePoint = wall.absolutePosition.add(wallWorldNormal.scale(WALL_THICKNESS / 2));
                const wallPlane = BABYLON.Plane.FromPositionAndNormal(outerSurfacePoint, wallWorldNormal);
                const signedDistance = wallPlane.signedDistanceTo(cameraPosition);
                const visibilityThreshold = -0.5;

                if (signedDistance < visibilityThreshold) {
                    wall.visibility = 0;
                } else {
                    wall.visibility = 1;
                }
            });
        }
    });

    const cleanupControls = () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        scene.onBeforeRenderObservable.remove(onBeforeRenderObserver);
        camera.dispose();
    };

    return { camera, cleanupControls };
};