"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { Flight } from '@/lib/api';
import L from 'leaflet';

// Custom Plane Icon
const createPlaneIcon = (heading: number, isSelected: boolean) => {
    return L.divIcon({
        className: 'custom-plane-icon',
        html: `<div style="transform: rotate(${heading}deg); width: 32px; height: 32px; display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${isSelected ? '#10b981' : '#f8fafc'}" stroke="${isSelected ? '#064e3b' : '#0f172a'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
               <path d="M2 12h20"/>
               <path d="M13 2l9 10-9 10"/>
             </svg>
           </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

interface MapProps {
    flights: Flight[];
    selectedFlightId: string | null;
    onSelectFlight: (id: string) => void;
}

// Helper to fit bounds
function MapBounds({ flights }: { flights: Flight[] }) {
    const map = useMap();

    useEffect(() => {
        if (flights.length === 0) return;

        // Only fit bounds if we haven't manually moved? 
        // Or just fit on initial load? 
        // Let's fit bounds only when the flight list changes significantly (e.g. first add)
        // For now, let's keep it simple: fit bounds if only 1 flight, or on mount.
        // Actually, constant re-fitting is annoying. Let's disable auto-fit for now unless it's the first flight.
        if (flights.length === 1) {
            const f = flights[0];
            map.setView([f.lat, f.lng], 8);
        }
    }, [flights.length, map]);

    return null;
}

export default function Map({ flights, selectedFlightId, onSelectFlight }: MapProps) {
    return (
        <MapContainer
            center={[39.8283, -98.5795]}
            zoom={4}
            style={{ height: '100%', width: '100%', background: '#0f172a' }}
            className="rounded-xl z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {flights.map((flight) => (
                <React.Fragment key={flight.id}>
                    {/* Flight Path Trace */}
                    {flight.history.length > 1 && (
                        <Polyline
                            positions={[...flight.history, [flight.lat, flight.lng]]}
                            pathOptions={{
                                color: flight.id === selectedFlightId ? '#10b981' : '#334155',
                                weight: 2,
                                opacity: 0.6,
                                dashArray: '4 4'
                            }}
                        />
                    )}

                    <Marker
                        position={[flight.lat, flight.lng]}
                        icon={createPlaneIcon(flight.heading, flight.id === selectedFlightId)}
                        eventHandlers={{
                            click: () => onSelectFlight(flight.id),
                        }}
                    >
                        <Popup className="custom-popup">
                            <div className="text-slate-900 font-bold">
                                {flight.callsign}
                                <br />
                                <span className="text-xs font-normal text-slate-600">
                                    {Math.round(flight.altitude)}m | {Math.round(flight.velocity)}m/s
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                </React.Fragment>
            ))}

            <MapBounds flights={flights} />
        </MapContainer>
    );
}
