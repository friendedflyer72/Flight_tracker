import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const callsign = searchParams.get('callsign');
    const icao24s = searchParams.get('icao24s');

    let apiUrl = 'https://opensky-network.org/api/states/all';

    // Construct OpenSky API URL based on request type
    if (icao24s) {
        // Efficient tracking: Fetch only specific flights
        // OpenSky expects multiple 'icao24' parameters: ?icao24=abc&icao24=xyz
        const params = new URLSearchParams();
        const ids = icao24s.split(',');
        ids.forEach(id => params.append('icao24', id.trim()));
        apiUrl = `${apiUrl}?${params.toString()}`;
    } else if (callsign) {
        // Global Search: Fetch all states and filter on server
        // No parameters needed for global fetch
    } else {
        // No search or tracking -> return empty
        return NextResponse.json({ states: [] });
    }

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

        // If searching by callsign, we need to filter the global list here
        if (callsign) {
            const query = callsign.toUpperCase().trim();
            filteredStates = filteredStates.filter((state: any[]) =>
                state[1] && state[1].trim().includes(query)
            );
        }
        // If tracking (icao24s), the API already filtered for us, so we just return the result.
        // However, strictly speaking, we might want to double check or just pass through.
        // The API response for ?icao24=... contains only the requested flights.

        return NextResponse.json({ states: filteredStates });
    } catch (error) {
        console.error('Failed to fetch flight data:', error);
        return NextResponse.json({ states: [] }, { status: 500 });
    }
}
