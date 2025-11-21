import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const callsign = searchParams.get('callsign');
    const icao24s = searchParams.get('icao24s');

    // Base URL for all states (OpenSky doesn't support filtering by callsign directly on the free API efficiently without bounding box, 
    // but let's try to fetch a large area and filter, or use 'all' if allowed (often rate limited or heavy).
    // Better approach for demo: Fetch US region and filter.

    // Lamin: 24.396308, Lomin: -125.000000, Lamax: 49.384358, Lomax: -66.934570 (US)
    const lamin = '24.396308';
    const lomin = '-125.000000';
    const lamax = '49.384358';
    const lomax = '-66.934570';

    let apiUrl = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;

    // If we have specific IDs to track, we still have to fetch the region (or all) in the free API 
    // because the 'icao24' parameter is only for specific queries which might not give 'states' (live positions) easily 
    // without authentication or paid plans for the /states/all endpoint with icao24 filter?
    // Actually, /states/all supports ?icao24=... but only for authenticated users usually? 
    // Let's stick to fetching the region and filtering on server for simplicity and robustness as anonymous.

    try {
        const response = await fetch(apiUrl, {
            next: { revalidate: 5 } // Cache for 5 seconds
        });

        if (!response.ok) {
            throw new Error(`OpenSky API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.states) {
            return NextResponse.json({ states: [] });
        }

        let filteredStates = data.states;

        if (callsign) {
            const query = callsign.toUpperCase().trim();
            filteredStates = filteredStates.filter((state: any[]) =>
                state[1] && state[1].trim().includes(query)
            );
        } else if (icao24s) {
            const ids = icao24s.split(',');
            filteredStates = filteredStates.filter((state: any[]) =>
                ids.includes(state[0])
            );
        } else {
            // If no search and no tracking list, return empty (as per new requirement: "initial don't fetch any flight data")
            // But wait, the map needs to show something? No, user said "fetch only when user searches".
            // So if no params, return empty.
            return NextResponse.json({ states: [] });
        }

        return NextResponse.json({ states: filteredStates });
    } catch (error) {
        console.error('Failed to fetch flight data:', error);
        return NextResponse.json({ states: [] }, { status: 500 });
    }
}
