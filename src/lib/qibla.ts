// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Calculate bearing from a point to the Kaaba.
 * Formula: atan2(sin(ΔL) * cos(φ2), cos(φ1) * sin(φ2) - sin(φ1) * cos(φ2) * cos(ΔL))
 * Returns bearing in degrees (0-360, clockwise from North).
 */
export function calculateQiblaBearing(lat: number, lng: number): number {
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA_LAT);
  const ΔL = toRad(KAABA_LNG - lng);

  const x = Math.sin(ΔL) * Math.cos(φ2);
  const y =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(ΔL);

  const bearing = toDeg(Math.atan2(x, y));
  return (bearing + 360) % 360;
}

/**
 * Calculate great-circle distance between a point and the Kaaba using Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateDistanceToMecca(lat: number, lng: number): number {
  const R = 6371; // Earth radius in km
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA_LAT);
  const Δφ = toRad(KAABA_LAT - lat);
  const ΔL = toRad(KAABA_LNG - lng);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(ΔL / 2) * Math.sin(ΔL / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Format bearing as compass direction (e.g., "295° NW")
 */
export function formatBearing(bearing: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(bearing / 45) % 8;
  return `${Math.round(bearing)}° ${directions[index]}`;
}

/**
 * Format distance in km with appropriate precision
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString()} km`;
}
