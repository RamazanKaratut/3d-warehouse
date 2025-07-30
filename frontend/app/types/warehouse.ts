// src/app/contexts/types/warehouse.ts

export interface Warehouse {
    id: number;
    ad: string;
    konum: string | null;
    alan_verisi_3d: any | null;
    aciklama: string | null;
    tipi: 'açık' | 'kapalı';
    kapasite: number;
    yukseklik: number | null;
    taban_alani: number | null;
    raf_sayisi: number;
    aktif: boolean;
    created_at: string;
}

export interface WarehouseFormProps {
    warehouseName: string;
    setWarehouseName: (value: string) => void;
    location: string;
    setLocation: (value: string) => void;
    addMethod: 'map' | 'manual';
    setAddMethod: (method: 'map' | 'manual') => void;
    capacity: string;
    setCapacity: (value: string) => void;
    description: string;
    setDescription: (value: string) => void;
    warehouseType: 'open' | 'closed' | '';
    setWarehouseType: (type: 'open' | 'closed' | '') => void;
    warehouseHeight: string;
    setWarehouseHeight: (value: string) => void;
    calculatedAreaM2: number | null;
    loading: boolean;
    message: string;
    onSubmit: (e: React.FormEvent) => void;
}

export interface WarehouseFormState {
    warehouseName: string;
    location: string;
    capacity: string;
    description: string;
    drawnAreaGeoJSON: any | null;
    calculatedAreaM2: number | null;
    addMethod: 'map' | 'manual';
    warehouseType: 'open' | 'closed' | '';
    warehouseHeight: string;
    loading: boolean;
    message: string;
    mapInitialCenter: [number, number];
    mapInitialZoom: number;
}

export interface WarehouseFormActions {
    setWarehouseName: (value: string) => void;
    setLocation: (value: string) => void;
    setCapacity: (value: string) => void;
    setDescription: (value: string) => void;
    setDrawnAreaGeoJSON: (data: any | null) => void;
    setCalculatedAreaM2: (value: number | null) => void;
    setAddMethod: (method: 'map' | 'manual') => void;
    setWarehouseType: (type: 'open' | 'closed' | '') => void;
    setWarehouseHeight: (value: string) => void;
    setLoading: (value: boolean) => void;
    setMessage: (value: string) => void;
    handleMapDrawn: (geoJsonData: any) => void;
    resetForm: () => void;
}

export interface DynamicMapProps {
    onAreaDrawn?: (geoJsonData: any) => void;
    initialCenter: [number, number];
    initialZoom?: number;
}

declare global {
  interface HTMLCanvasElement {
    __cleanupFn?: () => void;
  }
}

export interface UseWarehouseDataResult {
    warehouse: Warehouse | null;
    loading: boolean;
    error: string | null;
}

export interface GeoJSONGeometry {
    type: string;
    coordinates: number[][][];
}

export interface GeoJSONData {
    type: string;
    geometry: GeoJSONGeometry;
    properties: Record<string, any>;
}

export interface AlanVerisi3D {
    method: string;
    width_m: number;
    length_m: number;
    geojson_data: GeoJSONData;
    calculated_area_m2: number;
}