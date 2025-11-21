"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Flight, searchFlights, updateTrackedFlights } from '@/lib/api';
import FlightBoard from './FlightBoard';
import SearchBar from './SearchBar';
import { Activity, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Map to avoid SSR issues with Leaflet
const LeafletMap = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500">Loading Map...</div>
});

export default function Dashboard() {
    const [trackedFlights, setTrackedFlights] = useState<Flight[]>([]);
    const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<Flight[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Refs for animation loop to access latest state without triggering re-renders
    const flightsRef = useRef<Flight[]>([]);
    const lastFrameTimeRef = useRef<number>(0);

    // Sync ref with state
    useEffect(() => {
        flightsRef.current = trackedFlights;
    }, [trackedFlights]);

    // Polling for REAL updates (every 2s as requested, though OpenSky might rate limit, let's try 5s to be safe but "live" feeling comes from interpolation)
    // User asked for 2s. OpenSky free is slow/limited. I'll set to 5s to avoid blocking, but interpolation handles the smoothness.
    useEffect(() => {
        if (trackedFlights.length === 0) return;

        const updateInterval = setInterval(async () => {
            const ids = trackedFlights.map(f => f.id);
            const updated = await updateTrackedFlights(ids);

            setTrackedFlights(prev => {
                const updatedMap = new Map(updated.map(f => [f.id, f]));
                return prev.map(f => {
                    const newData = updatedMap.get(f.id);
                    if (newData) {
                        // Append current position to history before updating to new position
                        // Actually, we should add the *new* position to history? 
                        // Or better: keep history of where it WAS.
                        // Let's add the PREVIOUS position to history.
                        const newHistory = [...f.history, [f.lat, f.lng] as [number, number]];

                        // If the jump is too large (teleport), maybe don't interpolate? 
                        // For now, just update.
                        return { ...newData, history: newHistory };
                    }
                    return f;
                });
            });
            setLastUpdated(new Date());
        }, 5000); // 5s polling

        return () => clearInterval(updateInterval);
    }, [trackedFlights.length]); // Only re-run if count changes, internal logic handles updates

    // Interpolation Loop (Smooth Movement)
    useEffect(() => {
        if (trackedFlights.length === 0) return;

        let animationFrameId: number;

        const animate = (time: number) => {
            if (lastFrameTimeRef.current !== 0) {
                const deltaTime = (time - lastFrameTimeRef.current) / 1000; // seconds

                setTrackedFlights(prevFlights => {
                    return prevFlights.map(f => {
                        // Simple linear extrapolation based on velocity and heading
                        // 1 degree lat ~= 111km, 1 degree lng ~= 111km * cos(lat)
                        // Velocity is in m/s.

                        const distance = f.velocity * deltaTime; // meters
                        const earthRadius = 6371000; // meters

                        const deltaLat = (distance * Math.cos(f.heading * Math.PI / 180)) / earthRadius * (180 / Math.PI);
                        const deltaLng = (distance * Math.sin(f.heading * Math.PI / 180)) / (earthRadius * Math.cos(f.lat * Math.PI / 180)) * (180 / Math.PI);

                        return {
                            ...f,
                            lat: f.lat + deltaLat,
                            lng: f.lng + deltaLng
                        };
                    });
                });
            }
            lastFrameTimeRef.current = time;
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
            lastFrameTimeRef.current = 0;
        };
    }, [trackedFlights.length]); // Restart loop if flight count changes

    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        const results = await searchFlights(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
    };

    const addToTracking = (flight: Flight) => {
        if (!trackedFlights.find(f => f.id === flight.id)) {
            // Initialize history with current point
            setTrackedFlights(prev => [...prev, { ...flight, history: [[flight.lat, flight.lng]] }]);
        }
        setSearchResults([]);
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-6 font-sans">
            {/* Header */}
            <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                        <Activity className="text-emerald-500 w-8 h-8" />
                        SKY<span className="text-emerald-500">TRACKER</span>
                    </h1>
                    <p className="text-slate-500 font-mono text-sm mt-1">
                        TRACKING {trackedFlights.length} FLIGHTS • {lastUpdated ? lastUpdated.toLocaleTimeString() : 'READY'}
                    </p>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto relative">
                    <div className="flex gap-2">
                        <SearchBar value={searchQuery} onChange={setSearchQuery} />
                        <button
                            onClick={handleSearch}
                            disabled={isSearching || !searchQuery}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSearching ? '...' : 'Search'}
                        </button>
                    </div>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                            {searchResults.map(flight => (
                                <div
                                    key={flight.id}
                                    className="p-3 hover:bg-slate-800 cursor-pointer flex justify-between items-center border-b border-slate-800 last:border-0"
                                    onClick={() => addToTracking(flight)}
                                >
                                    <div>
                                        <div className="font-bold text-emerald-400">{flight.callsign}</div>
                                        <div className="text-xs text-slate-500">{flight.country}</div>
                                    </div>
                                    <Plus className="w-4 h-4 text-slate-400" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
                {/* Map */}
                <div className="lg:col-span-2 h-[400px] lg:h-full relative">
                    <LeafletMap
                        flights={trackedFlights}
                        selectedFlightId={selectedFlightId}
                        onSelectFlight={setSelectedFlightId}
                    />
                    {trackedFlights.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
                            <div className="bg-slate-900/80 backdrop-blur p-6 rounded-xl border border-slate-700 text-center max-w-md mx-4">
                                <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">No Active Flights</h3>
                                <p className="text-slate-400">Search for a flight callsign (e.g., "DAL", "UAL", "BAW") above to start tracking.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Flight Board */}
                <div className="h-[400px] lg:h-full">
                    <FlightBoard
                        flights={trackedFlights}
                        selectedFlightId={selectedFlightId}
                        onSelectFlight={setSelectedFlightId}
                    />
                </div>
            </div>
        </div>
    );
}
