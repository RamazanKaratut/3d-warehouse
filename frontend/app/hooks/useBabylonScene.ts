// app/hooks/useBabylonScene.ts
"use client";

import { useEffect, useRef } from 'react';
import { createBabylonScene } from '@/app/utils/babylonSceneUtils'; // Yeni utility dosyasından içe aktar

export const useBabylonScene = (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    warehouseData: any
) => {
    useEffect(() => {
        console.log("useEffect (canvas ve warehouse bağımlılığı) tetiklendi. Canvas:", !!canvasRef.current, "Warehouse Data:", !!warehouseData);

        let cleanupFn: (() => void) | undefined;

        if (canvasRef.current) {
            canvasRef.current.focus();
            cleanupFn = createBabylonScene(canvasRef.current, warehouseData);
        } else {
            console.log("Canvas elementi henüz mevcut değil (ref.current null).");
        }

        return () => {
            if (cleanupFn) {
                console.log("Babylon.js sahnesi temizleniyor.");
                cleanupFn();
            }
        };
    }, [canvasRef, warehouseData]);
};