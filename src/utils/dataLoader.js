// Functions for loading GeoJSON, GTFS, and flight data
/**
 * Utility for loading GeoJSON or TopoJSON files.
 * These should be stored in `src/data/` or `public/` and fetched at runtime.
 */

export async function loadGeoJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load GeoJSON from ${url}`);
  return res.json();
}
