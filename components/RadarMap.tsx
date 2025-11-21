"use client";

import React from 'react';
import { Flight } from '@/lib/api';
import { Plane } from 'lucide-react';

interface RadarMapProps {
    flights: Flight[];
    selectedFlightId: string | null;
    onSelectFlight: (id: string) => void;
}

export default function RadarMap({ flights, selectedFlightId, onSelectFlight }: RadarMapProps) {
    const width = 800;
    const height = 400;

    // Fixed viewport for the demo (US-centric based on API default)
    // Lamin: 24.396308, Lomin: -125.000000, Lamax: 49.384358, Lomax: -66.934570
    const minLat = 24.396308;
    const maxLat = 49.384358;
    const minLng = -125.000000;
    const maxLng = -66.934570;

    const getPosition = (lat: number, lng: number) => {
        // Simple linear projection for this viewport
        const x = ((lng - minLng) / (maxLng - minLng)) * width;
        const y = height - ((lat - minLat) / (maxLat - minLat)) * height; // Invert Y
        return { x, y };
    };

    return (
        <div className="relative w-full h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl shadow-emerald-900/20">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            {/* Map Overlay (Optional: Could add a static SVG map of US here) */}

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                {flights.map((flight) => {
                    const pos = getPosition(flight.lat, flight.lng);

                    // Skip if out of bounds (though API should filter, good safety)
                    if (pos.x < 0 || pos.x > width || pos.y < 0 || pos.y > height) return null;

                    const isSelected = flight.id === selectedFlightId;

                    return (
                        <g key={flight.id} onClick={() => onSelectFlight(flight.id)} className="cursor-pointer transition-opacity hover:opacity-100 group">

                            {/* Heading Vector */}
                            <line
                                x1={pos.x}
                                y1={pos.y}
                                x2={pos.x + Math.sin(flight.heading * Math.PI / 180) * 20}
                                y2={pos.y - Math.cos(flight.heading * Math.PI / 180) * 20}
                                stroke={isSelected ? '#10b981' : '#334155'}
                                strokeWidth="1"
                                className="opacity-50"
                            />

                            {/* Aircraft Icon */}
                            <g transform={`translate(${pos.x - 10}, ${pos.y - 10})`}>
                                <foreignObject width="20" height="20">
                                    <div className={`flex items-center justify-center w-5 h-5 rounded-full ${isSelected ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800/80 text-emerald-400'} shadow-sm transition-all duration-300`}>
                                        <Plane
                                            className="w-3 h-3"
                                            style={{ transform: `rotate(${flight.heading}deg)` }}
                                        />
                                    </div>
                                </foreignObject>
                            </g>

                            {/* Label */}
                            {(isSelected || false) && (
                                <text x={pos.x + 12} y={pos.y} fill="#10b981" fontSize="10" fontWeight="bold" className="select-none">
                                    {flight.callsign}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Overlay Info */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur p-2 rounded border border-slate-700 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    LIVE RADAR (US VIEW)
                </div>
            </div>
        </div>
    );
}
