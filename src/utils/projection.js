// Projection utilities for DC area
import * as d3 from "d3";

/**
 * Returns a D3 geoMercator projection centered on the DC metro area.
 */
export function getDCProjection(width, height) {
  return d3.geoMercator()
    .center([-77.0369, 38.9072]) // Washington, D.C.
    .scale(Math.min(width, height) * 100)
    .translate([width / 2, height / 2]);
}
