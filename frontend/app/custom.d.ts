// src/custom.d.ts veya types/leaflet.d.ts
import 'leaflet';
import 'leaflet-draw';

declare module 'leaflet' {
  namespace LeafletEventHandlerFnMap {
    interface LeafletEventHandlerFnMap {
      'draw:created'?: (e: L.DrawEvents.Created) => void;
      'draw:edited'?: (e: L.DrawEvents.Edited) => void;
      'draw:deleted'?: (e: L.DrawEvents.Deleted) => void;
    }
  }
}