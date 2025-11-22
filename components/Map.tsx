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
        html: `<div style="transform: rotate(${heading}deg); width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6)); transition: all 0.3s ease;">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${isSelected ? '#10b981' : '#f8fafc'}" stroke="${isSelected ? '#064e3b' : '#0f172a'}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
               <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
             </svg>
           </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
};

// Origin Airport Icon
const createOriginIcon = (isDarkMode: boolean) => {
    return L.divIcon({
        className: 'custom-origin-icon',
        html: `<div style="width: 32px; height: 32px; display: flex; justify-content: center; align-items: center; background: ${isDarkMode ? '#0f172a' : '#ffffff'}; border-radius: 50%; border: 2px solid #10b981; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M2 22h20"/>
               <path d="M8 22v-2.87a6 6 0 0 1 2.18-4.85l.67-.51a6 6 0 0 0 2.15-4.85V3.5a1.5 1.5 0 0 0-3 0v3"/>
               <path d="M14 22v-2.87a6 6 0 0 0-2.18-4.85l-.67-.51a6 6 0 0 1-2.15-4.85V3.5"/>
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
    isDarkMode: boolean;
}

// Helper to fit bounds
function MapBounds({ flights }: { flights: Flight[] }) {
    const map = useMap();

    useEffect(() => {
        if (flights.length === 0) return;
        if (flights.length === 1) {
            const f = flights[0];
            map.setView([f.lat, f.lng], 8);
        }
    }, [flights.length, map]);

    return null;
}

export default function Map({ flights, selectedFlightId, onSelectFlight, isDarkMode }: MapProps) {
    return (
        <MapContainer
            center={[39.8283, -98.5795]}
            zoom={4}
            style={{ height: '100%', width: '100%', background: isDarkMode ? '#020617' : '#f1f5f9' }}
            className="rounded-xl z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url={isDarkMode
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                }
            />

            {flights.map((flight) => (
                <React.Fragment key={flight.id}>
                    {/* Flight Path Trace */}
                    {flight.history.length > 1 && (
                        <>
                            <Polyline
                                positions={[...flight.history, [flight.lat, flight.lng]]}
                                pathOptions={{
                                    color: flight.id === selectedFlightId ? '#10b981' : (isDarkMode ? '#334155' : '#94a3b8'),
                                    weight: 2,
                                    opacity: 0.6,
                                    dashArray: '4 4'
                                }}
                            />
                            {/* Origin Marker (Start of history) */}
                            <Marker
                                position={flight.history[0]}
                                icon={createOriginIcon(isDarkMode)}
                                zIndexOffset={-100} // Keep below plane
                            >
                                <Popup className="custom-popup">
                                    <div className="text-slate-900 font-bold">Origin</div>
                                </Popup>
                            </Marker>
                        </>
                    )}

                    <Marker
                        position={[flight.lat, flight.lng]}
                        icon={createPlaneIcon(flight.heading, flight.id === selectedFlightId)}
                        eventHandlers={{
                            click: () => onSelectFlight(flight.id),
                        }}
                        zIndexOffset={1000}
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
