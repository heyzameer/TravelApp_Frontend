import React, { useEffect, useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to fix Leaflet size after modal animation
const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 300);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

interface MapPopupProps {
    isOpen: boolean;
    onClose: () => void;
    lat: number;
    lng: number;
    propertyName: string;
    address: string;
}

const MapPopup: React.FC<MapPopupProps> = ({ isOpen, onClose, lat, lng, propertyName, address }) => {
    // Force re-render when opening to ensure map initializes correctly
    const [renderKey, setRenderKey] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setRenderKey(prev => prev + 1);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const position: [number, number] = [lat, lng];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                <div className="p-6 md:p-8 flex flex-col h-full overflow-hidden">
                    <div className="flex items-start justify-between mb-6 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Property Location</h3>
                                <p className="text-sm text-slate-500 font-medium">{propertyName}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="relative flex-1 min-h-[400px] w-full bg-slate-100 rounded-[1.5rem] overflow-hidden border border-slate-100 z-10">
                        <MapContainer
                            key={`${lat}-${lng}-${renderKey}`}
                            center={position}
                            zoom={15}
                            scrollWheelZoom={true}
                            style={{ height: '400px', minHeight: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={position}>
                                <Popup>
                                    <div className="font-bold">{propertyName}</div>
                                    <div className="text-xs">{address}</div>
                                </Popup>
                            </Marker>
                            <MapResizer />
                        </MapContainer>
                    </div>

                    <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Full Address</p>
                        <p className="text-sm font-medium text-slate-700">{address}</p>
                        <div className="mt-2 text-[10px] font-mono text-slate-400">
                            GPS: {lat.toFixed(6)}, {lng.toFixed(6)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapPopup;
