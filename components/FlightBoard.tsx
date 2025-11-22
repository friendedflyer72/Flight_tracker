import React from 'react';
import { Flight } from '@/lib/api';
import { Plane, Navigation, ArrowUp, X } from 'lucide-react';

interface FlightBoardProps {
    flights: Flight[];
    selectedFlightId: string | null;
    onSelectFlight: (id: string) => void;
    onRemoveFlight?: (id: string) => void;
}

export default function FlightBoard({ flights, selectedFlightId, onSelectFlight, onRemoveFlight }: FlightBoardProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 h-full flex flex-col overflow-hidden shadow-2xl transition-colors duration-300">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Plane className="text-emerald-600 dark:text-emerald-500 w-5 h-5" />
                    LIVE FLIGHTS
                </h2>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
                    {flights.length} ACTIVE
                </span>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                {flights.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-8 text-center">
                        <Navigation className="w-12 h-12 mb-4 opacity-20" />
                        <p>No flights tracked.</p>
                        <p className="text-xs mt-2">Search to add flights.</p>
                    </div>
                ) : (
                    flights.map((flight) => (
                        <div
                            key={flight.id}
                            onClick={() => onSelectFlight(flight.id)}
                            className={`
                group p-4 rounded-lg border transition-all cursor-pointer relative
                ${selectedFlightId === flight.id
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                    : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                                }
              `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        {flight.callsign}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                                        {flight.country}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                                        {Math.round(flight.altitude)}m
                                    </div>
                                    <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                                        ALTITUDE
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                    <Navigation className="w-4 h-4" style={{ transform: `rotate(${flight.heading}deg)` }} />
                                    <span>{Math.round(flight.heading)}°</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-mono text-sm">
                                    <ArrowUp className="w-4 h-4 text-cyan-600 dark:text-cyan-500" />
                                    {Math.round(flight.velocity)} m/s
                                </div>
                            </div>

                            {/* Remove Button */}
                            {onRemoveFlight && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveFlight(flight.id);
                                    }}
                                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remove Flight"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
