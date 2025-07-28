export interface Warehouse {
  id: string; // Backend'den gelen ID string olabilir veya number olabilir, modelinize göre ayarlayın
  name: string;
  location: string;
  capacity: number;
  area_m2: number;
  description: string;
  type: string; // 'open' veya 'closed'
  height_m: number | null; // Kapalı depolarda null olabilir
  // Diğer alanlar (GeoJSON gibi) burada gösterilmeyebilir veya daha detaylı bir sayfada gösterilebilir
}

export interface WarehouseFormProps {
  warehouseName: string;
  setWarehouseName: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  capacity: string;
  setCapacity: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  addMethod: 'map' | 'manual';
  setAddMethod: (method: 'map' | 'manual') => void;
  warehouseWidth: string;
  setWarehouseWidth: (value: string) => void;
  warehouseLength: string;
  setWarehouseLength: (value: string) => void;
  warehouseType: 'open' | 'closed' | '';
  setWarehouseType: (type: 'open' | 'closed' | '') => void;
  warehouseHeight: string;
  setWarehouseHeight: (value: string) => void;
  calculatedAreaM2: number | null;
  loading: boolean;
  message: string;
  onSubmit: (e: React.FormEvent) => void;
}

// Tip tanımları
export interface WarehouseFormState {
  warehouseName: string;
  location: string;
  capacity: string;
  description: string;
  drawnAreaGeoJSON: any | null;
  calculatedAreaM2: number | null;
  addMethod: 'map' | 'manual';
  warehouseWidth: string;
  warehouseLength: string;
  warehouseType: 'open' | 'closed' | '';
  warehouseHeight: string;
  loading: boolean;
  message: string;
}

export interface WarehouseFormActions {
  setWarehouseName: (value: string) => void;
  setLocation: (value: string) => void;
  setCapacity: (value: string) => void;
  setDescription: (value: string) => void;
  setDrawnAreaGeoJSON: (data: any | null) => void;
  setCalculatedAreaM2: (value: number | null) => void;
  setAddMethod: (method: 'map' | 'manual') => void;
  setWarehouseWidth: (value: string) => void;
  setWarehouseLength: (value: string) => void;
  setWarehouseType: (type: 'open' | 'closed' | '') => void;
  setWarehouseHeight: (value: string) => void;
  setLoading: (value: boolean) => void;
  setMessage: (value: string) => void;
  handleMapDrawn: (geoJsonData: any) => void;
  calculateManualArea: () => void;
  resetForm: () => void; // Formu sıfırlamak için
}

export interface DynamicMapProps {
  onAreaDrawn?: (geoJsonData: any) => void;
}
