import { haversineDistance } from './geo';
import { settings } from '../config';

export function estimateEta({ busPosition, stopPosition, gpsSpeedKmh, routeMultiplier }) {
  const distance = haversineDistance(busPosition, stopPosition);
  const multiplier = routeMultiplier ?? settings.roadDistanceMultiplier;
  const distanceKm = distance * multiplier;

  const hasUsableGps = gpsSpeedKmh != null && gpsSpeedKmh >= settings.minUsableGpsSpeedKmh;
  const speedUsed = hasUsableGps ? gpsSpeedKmh : settings.averageBusSpeedKmh;

  const etaMinutes = speedUsed > 0 ? Math.max(1, Math.ceil((distanceKm / speedUsed) * 60)) : 0;

  return {
    distanceKm,
    etaMinutes,
    speedUsed,
    usedFallbackSpeed: !hasUsableGps,
    isApproximate: true,
  };
}
