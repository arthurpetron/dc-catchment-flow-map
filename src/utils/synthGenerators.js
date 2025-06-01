// Synthetic data generators for flow simulation
/**
 * Synthetic data generators for catchment zones, airline routes, and flows.
 * Used in initial simulation when no real data is connected.
 */

// Coordinates for major metro DC airports
export const airports = [
  { code: "DCA", name: "Reagan National", lat: 38.8521, lon: -77.0377, color: "#ff6b6b" },
  { code: "IAD", name: "Dulles International", lat: 38.9445, lon: -77.4558, color: "#4ecdc4" },
  { code: "BWI", name: "Baltimore/Washington", lat: 39.1754, lon: -76.6684, color: "#45b7d1" }
];

// Generate circular catchment zones (placeholder, warped later)
export function generateCatchmentAreas(radiusDegrees = 0.15, steps = 32) {
  return airports.map(airport => {
    const points = [];
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      const dx = radiusDegrees * Math.cos(angle);
      const dy = radiusDegrees * Math.sin(angle);
      points.push([airport.lon + dx, airport.lat + dy]);
    }
    return {
      code: airport.code,
      polygon: points,
      center: [airport.lon, airport.lat],
      color: airport.color
    };
  });
}

// Destinations with approximate coords (domestic US)
const destinations = [
  { code: "ATL", name: "Atlanta", lat: 33.6407, lon: -84.4277 },
  { code: "ORD", name: "Chicago", lat: 41.9742, lon: -87.9073 },
  { code: "LAX", name: "Los Angeles", lat: 33.9425, lon: -118.4081 },
  { code: "JFK", name: "New York", lat: 40.6413, lon: -73.7781 },
  { code: "MIA", name: "Miami", lat: 25.7959, lon: -80.2870 },
  { code: "DFW", name: "Dallas", lat: 32.8998, lon: -97.0403 },
  { code: "BOS", name: "Boston", lat: 42.3656, lon: -71.0096 },
];

// Generate synthetic airline route arcs
export function generateRoutes() {
  const routes = [];
  airports.forEach(airport => {
    destinations.forEach(dest => {
      routes.push({
        origin: [airport.lon, airport.lat],
        destination: [dest.lon, dest.lat],
        airportCode: airport.code,
        label: `${airport.code} → ${dest.code}`,
        intensity: Math.random() * 0.5 + 0.5,
        distance: Math.sqrt(
          Math.pow(dest.lat - airport.lat, 2) + Math.pow(dest.lon - airport.lon, 2)
        )
      });
    });
  });
  return routes;
}
