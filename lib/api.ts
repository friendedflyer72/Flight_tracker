export interface Flight {
    id: string; // icao24
    callsign: string;
    country: string;
    lat: number;
    lng: number;
    altitude: number; // meters
    velocity: number; // m/s
    heading: number; // degrees
    onGround: boolean;
    history: [number, number][]; // [lat, lng][]
}

export async function searchFlights(query: string): Promise<Flight[]> {
    if (!query) return [];
    try {
        const response = await fetch(`/api/flights?callsign=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to search flights');
        const data = await response.json();
        return parseStates(data.states);
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function updateTrackedFlights(icao24s: string[]): Promise<Flight[]> {
    if (icao24s.length === 0) return [];
    try {
        const response = await fetch(`/api/flights?icao24s=${icao24s.join(',')}`);
        if (!response.ok) throw new Error('Failed to update flights');
        const data = await response.json();
        return parseStates(data.states);
    } catch (error) {
        console.error(error);
        return [];
    }
}

function parseStates(states: any[]): Flight[] {
    if (!states || !Array.isArray(states)) return [];

    return states.map((state: any[]) => ({
        id: state[0],
        callsign: state[1]?.trim() || 'N/A',
        country: state[2],
        lng: state[5],
        lat: state[6],
        altitude: state[7] || 0,
        onGround: state[8],
        velocity: state[9] || 0,
        heading: state[10] || 0,
        history: [], // Initialize empty history
    })).filter((f: Flight) => f.lat !== null && f.lng !== null && !f.onGround);
}
