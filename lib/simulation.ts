import { Plane } from 'lucide-react';

export type FlightStatus = 'Scheduled' | 'On Time' | 'Delayed' | 'Landed' | 'In Air';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  status: FlightStatus;
  progress: number; // 0 to 100
  altitude: number; // ft
  speed: number; // kts
  coordinates: Coordinates;
  startCoordinates: Coordinates;
  endCoordinates: Coordinates;
}

const AIRPORTS = [
  { code: 'JFK', lat: 40.6413, lng: -73.7781, city: 'New York' },
  { code: 'LHR', lat: 51.4700, lng: -0.4543, city: 'London' },
  { code: 'HND', lat: 35.5494, lng: 139.7798, city: 'Tokyo' },
  { code: 'DXB', lat: 25.2532, lng: 55.3657, city: 'Dubai' },
  { code: 'LAX', lat: 33.9416, lng: -118.4085, city: 'Los Angeles' },
  { code: 'SYD', lat: -33.9399, lng: 151.1753, city: 'Sydney' },
  { code: 'SIN', lat: 1.3644, lng: 103.9915, city: 'Singapore' },
  { code: 'CDG', lat: 49.0097, lng: 2.5479, city: 'Paris' },
];

const AIRLINES = ['AA', 'BA', 'JL', 'EK', 'DL', 'QF', 'SQ', 'AF'];

// Helper to interpolate position along a great circle (simplified as linear for this demo, or slightly curved)
function interpolatePosition(start: Coordinates, end: Coordinates, progress: number): Coordinates {
  // Simple linear interpolation for demo purposes
  // In a real app, we'd use Haversine or similar for great circle path
  const lat = start.lat + (end.lat - start.lat) * progress;
  const lng = start.lng + (end.lng - start.lng) * progress;
  return { lat, lng };
}

export function generateFlight(): Flight {
  const startAirport = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
  let endAirport = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
  while (endAirport.code === startAirport.code) {
    endAirport = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
  }

  const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
  const flightNumber = `${airline}${Math.floor(Math.random() * 9000) + 1000}`;

  return {
    id: Math.random().toString(36).substr(2, 9),
    flightNumber,
    airline,
    origin: startAirport.code,
    destination: endAirport.code,
    status: 'In Air',
    progress: 0,
    altitude: 0,
    speed: 0,
    coordinates: { lat: startAirport.lat, lng: startAirport.lng },
    startCoordinates: { lat: startAirport.lat, lng: startAirport.lng },
    endCoordinates: { lat: endAirport.lat, lng: endAirport.lng },
  };
}

export function updateFlights(flights: Flight[]): Flight[] {
  return flights.map((flight) => {
    if (flight.status === 'Landed') return flight;

    let newProgress = flight.progress + 0.005; // Increment progress
    if (newProgress >= 1) {
      newProgress = 1;
      return {
        ...flight,
        progress: 1,
        status: 'Landed',
        altitude: 0,
        speed: 0,
        coordinates: flight.endCoordinates,
      };
    }

    // Simulate altitude profile (climb, cruise, descend)
    let altitude = flight.altitude;
    if (newProgress < 0.1) altitude += 500;
    else if (newProgress > 0.9) altitude -= 500;
    else altitude = 35000 + Math.random() * 100 - 50; // Cruise fluctuation

    // Simulate speed
    let speed = flight.speed;
    if (newProgress < 0.1) speed += 10;
    else if (newProgress > 0.9) speed -= 10;
    else speed = 500 + Math.random() * 20 - 10;

    return {
      ...flight,
      progress: newProgress,
      altitude: Math.max(0, altitude),
      speed: Math.max(0, speed),
      coordinates: interpolatePosition(flight.startCoordinates, flight.endCoordinates, newProgress),
    };
  });
}
