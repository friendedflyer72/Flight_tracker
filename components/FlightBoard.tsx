"use client";

import React from 'react';
import { Flight } from '@/lib/api';
import { Plane } from 'lucide-react';

interface FlightBoardProps {
    flights: Flight[];
    selectedFlightId: string | null;
    onSelectFlight: (id: string) => void;
}

export default function FlightBoard({ flights, selectedFlightId, onSelectFlight }: FlightBoardProps) {
    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col h-full shadow-2xl shadow-emerald-900/10">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex justify-between items-center">
                <h2 className="text-emerald-400 font-mono text-lg tracking-wider flex items-center gap-2">
                    <Plane className="w-5 h-5" /> FLIGHT BOARD
                </h2>
                <span className="text-xs text-slate-500 font-mono">{flights.length} ACTIVE</span>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950 text-slate-500 font-mono text-xs uppercase sticky top-0 z-10">
                        <tr>
                            <th className="p-3 font-normal">Callsign</th>
                            <th className="p-3 font-normal">Country</th>
                            <th className="p-3 font-normal text-right">Alt (m)</th>
                            <th className="p-3 font-normal text-right">Vel (m/s)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-mono">
                        {flights.map((flight) => (
                            <tr
                                key={flight.id}
                                onClick={() => onSelectFlight(flight.id)}
                                className={`cursor-pointer transition-colors hover:bg-slate-800/50 ${selectedFlightId === flight.id ? 'bg-slate-800/80 border-l-2 border-emerald-500' : 'border-l-2 border-transparent'}`}
                            >
                                <td className="p-3 font-bold text-slate-200">
                                    {flight.callsign}
                                </td>
                                <td className="p-3">
                                    <span className="text-xs text-slate-500">{flight.country}</span>
                                </td>
                                <td className="p-3 text-right text-slate-300">{Math.round(flight.altitude).toLocaleString()}</td>
                                <td className="p-3 text-right text-slate-300">{Math.round(flight.velocity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
