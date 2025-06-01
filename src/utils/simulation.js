// Logic for modeling passenger and traffic flows
import { airports, generateRoutes } from './synthGenerators.js';

/**
 * Returns synthetic flows (ground traffic or air routes) for a given hour and day type.
 * @param {number} hour - Hour of day [0–23]
 * @param {string} dayType - 'weekday' or 'weekend'
 */
export function simulateFlows(hour = 8, dayType = 'weekday') {
  const baseIntensity = dayType === 'weekday' ? 1.0 : 0.8;
  const peakBoost = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18) ? 1.3 : 1.0;
  const routes = generateRoutes();

  return routes.map(route => {
    const { origin, destination, airportCode, label } = route;
    return {
      origin,
      destination,
      airportCode,
      label,
      mode: 'air',
      passengers: Math.floor(100 + Math.random() * 400 * baseIntensity * peakBoost),
      hour,
      distance: route.distance
    };
  });
}

/**
 * Simulate real-time modal split percentages for each airport.
 */
export function getModalSplit(airportCode) {
  if (airportCode === 'DCA') {
    return { car: 0.45, metro: 0.35, taxi: 0.1, other: 0.1 };
  } else if (airportCode === 'IAD') {
    return { car: 0.7, metro: 0.1, taxi: 0.15, other: 0.05 };
  } else if (airportCode === 'BWI') {
    return { car: 0.6, rail: 0.2, taxi: 0.1, other: 0.1 };
  } else {
    return { car: 0.8, other: 0.2 };
  }
}
