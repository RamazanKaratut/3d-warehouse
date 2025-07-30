// src/app/contexts/WarehouseFormContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { LatLngExpression } from 'leaflet';
import * as turfArea from '@turf/area';
import * as turfCenter from '@turf/center';
import { polygon } from '@turf/helpers';

import { WarehouseFormState, WarehouseFormActions } from '@/app/types/warehouse';

const AKYAPI_LOGISTICS_COORDINATES: LatLngExpression = [38.734802, 35.467987];
const OCEAN_CENTER_COORDINATES: LatLngExpression = [0, 0];

const DEFAULT_MAP_ZOOM = 15;
const OCEAN_MAP_ZOOM = 18;

type WarehouseFormContextType = WarehouseFormState & WarehouseFormActions;

const WarehouseFormContext = createContext<WarehouseFormContextType | undefined>(undefined);

export function WarehouseFormProvider({ children }: { children: ReactNode }) {
    const [warehouseName, setWarehouseName] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [capacity, setCapacity] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [drawnAreaGeoJSON, setDrawnAreaGeoJSON] = useState<any | null>(null);
    const [calculatedAreaM2, setCalculatedAreaM2] = useState<number | null>(null);
    const [addMethod, setAddMethod] = useState<'map' | 'manual'>('map');
    const [warehouseType, setWarehouseType] = useState<'open' | 'closed' | ''>('');
    const [warehouseHeight, setWarehouseHeight] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    const [mapInitialCenter, setMapInitialCenter] = useState<[number, number]>(AKYAPI_LOGISTICS_COORDINATES as [number, number]);
    const [mapInitialZoom, setMapInitialZoom] = useState<number>(DEFAULT_MAP_ZOOM);

    const handleMapDrawn = (geoJsonData: any) => {
        setDrawnAreaGeoJSON(geoJsonData);

        if (geoJsonData && geoJsonData.geometry && geoJsonData.geometry.coordinates) {
            const feature = polygon(geoJsonData.geometry.coordinates);
            const area = turfArea.default(feature);
            setCalculatedAreaM2(area);

            const centerPoint = turfCenter.default(feature);
            setMapInitialCenter(centerPoint.geometry.coordinates.reverse() as [number, number]);
        } else {
            setCalculatedAreaM2(null);
        }
    };

    useEffect(() => {
        setCalculatedAreaM2(null);
        setDrawnAreaGeoJSON(null);

        if (addMethod === 'map') {
            setMapInitialCenter(AKYAPI_LOGISTICS_COORDINATES as [number, number]);
            setMapInitialZoom(DEFAULT_MAP_ZOOM);
        } else {
            setMapInitialCenter(OCEAN_CENTER_COORDINATES as [number, number]);
            setMapInitialZoom(OCEAN_MAP_ZOOM);
        }
        console.log("addMethod değişti. Yeni harita merkezi:", (addMethod === 'map' ? AKYAPI_LOGISTICS_COORDINATES : OCEAN_CENTER_COORDINATES), "Yeni zoom:", (addMethod === 'map' ? DEFAULT_MAP_ZOOM : OCEAN_MAP_ZOOM));
    }, [addMethod]);

    const resetForm = () => {
        setWarehouseName('');
        setLocation('');
        setCapacity('');
        setDescription('');
        setDrawnAreaGeoJSON(null);
        setCalculatedAreaM2(null);
        setAddMethod('map');
        setWarehouseType('');
        setWarehouseHeight('');
        setLoading(false);
        setMessage('');
        setMapInitialCenter(AKYAPI_LOGISTICS_COORDINATES as [number, number]);
        setMapInitialZoom(DEFAULT_MAP_ZOOM);
    };

    const value = {
        warehouseName, setWarehouseName,
        location, setLocation,
        capacity, setCapacity,
        description, setDescription,
        drawnAreaGeoJSON, setDrawnAreaGeoJSON,
        calculatedAreaM2, setCalculatedAreaM2,
        addMethod, setAddMethod,
        warehouseType, setWarehouseType,
        warehouseHeight, setWarehouseHeight,
        loading, setLoading,
        message, setMessage,
        mapInitialCenter,
        mapInitialZoom,
        handleMapDrawn,
        resetForm,
    };

    return (
        <WarehouseFormContext.Provider value={value}>
            {children}
        </WarehouseFormContext.Provider>
    );
}

export function useWarehouseForm() {
    const context = useContext(WarehouseFormContext);
    if (context === undefined) {
        throw new Error('useWarehouseForm must be used within a WarehouseFormProvider');
    }
    return context;
}