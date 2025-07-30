// components/map/helpers/leafletIconFix.ts
import L from 'leaflet';

declare module 'leaflet' {
    namespace Icon {
        interface Default {
            _getIconUrl?: () => string;
        }
    }
}
export const applyLeafletIconFix = () => {
    if (typeof window !== 'undefined') {
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/images/marker-icon-2x.png',
            iconUrl: '/images/marker-icon.png',
            shadowUrl: '/images/marker-shadow.png',
        });
        L.Icon.Default.prototype._getIconUrl = function (this: L.Icon.Default) {
            return (this as any).options.iconUrl;
        };
    }
};