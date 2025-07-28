// contexts/WarehouseFormContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import area from '@turf/area';
import { WarehouseFormState, WarehouseFormActions } from '../types/warehouse';

interface WarehouseFormContextType extends WarehouseFormState, WarehouseFormActions {}

const WarehouseFormContext = createContext<WarehouseFormContextType | undefined>(undefined);

export function WarehouseFormProvider({ children }: { children: React.ReactNode }) {
  const [warehouseName, setWarehouseName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');
  const [drawnAreaGeoJSON, setDrawnAreaGeoJSON] = useState<any | null>(null);
  const [calculatedAreaM2, setCalculatedAreaM2] = useState<number | null>(null);
  const [addMethod, setAddMethod] = useState<'map' | 'manual'>('map');
  const [warehouseWidth, setWarehouseWidth] = useState('');
  const [warehouseLength, setWarehouseLength] = useState('');
  const [warehouseType, setWarehouseType] = useState<'open' | 'closed' | ''>('');
  const [warehouseHeight, setWarehouseHeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleMapDrawn = useCallback((geoJsonData: any) => {
    setDrawnAreaGeoJSON(geoJsonData);
    const calculated = area(geoJsonData);
    setCalculatedAreaM2(calculated);
  }, []);

  const calculateManualArea = useCallback(() => {
    const width = parseFloat(warehouseWidth);
    const length = parseFloat(warehouseLength);
    if (!isNaN(width) && !isNaN(length) && width > 0 && length > 0) {
      setCalculatedAreaM2(width * length);
    } else {
      setCalculatedAreaM2(null);
    }
  }, [warehouseWidth, warehouseLength]);

  // addMethod değiştiğinde alan hesaplamayı veya sıfırlamayı yönet
  useEffect(() => {
    if (addMethod === 'manual') {
      calculateManualArea();
    } else {
      setCalculatedAreaM2(null); // Harita moduna geçildiğinde manuel alanı sıfırla
      setWarehouseWidth('');
      setWarehouseLength('');
    }
  }, [addMethod, warehouseWidth, warehouseLength, calculateManualArea]);

  const resetForm = useCallback(() => {
    setWarehouseName('');
    setLocation('');
    setCapacity('');
    setDescription('');
    setDrawnAreaGeoJSON(null);
    setCalculatedAreaM2(null);
    setAddMethod('map'); // Varsayılan olarak harita yöntemine dön
    setWarehouseWidth('');
    setWarehouseLength('');
    setWarehouseType('');
    setWarehouseHeight('');
    setLoading(false);
    setMessage('');
  }, []);

  const value = {
    warehouseName, setWarehouseName,
    location, setLocation,
    capacity, setCapacity,
    description, setDescription,
    drawnAreaGeoJSON, setDrawnAreaGeoJSON,
    calculatedAreaM2, setCalculatedAreaM2,
    addMethod, setAddMethod: useCallback((method: 'map' | 'manual') => {
      setAddMethod(method);
      if (method === 'manual') {
        setDrawnAreaGeoJSON(null);
      }
    }, []), // addMethod'u değiştiren callback, harita geoJson'ı sıfırlar
    warehouseWidth, setWarehouseWidth,
    warehouseLength, setWarehouseLength,
    warehouseType, setWarehouseType,
    warehouseHeight, setWarehouseHeight,
    loading, setLoading,
    message, setMessage,
    handleMapDrawn,
    calculateManualArea,
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