export function haversineDistance(from, to) {
  const earthRadius = 6371;
  const latDelta = ((to[0] - from[0]) * Math.PI) / 180;
  const lngDelta = ((to[1] - from[1]) * Math.PI) / 180;
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos((from[0] * Math.PI) / 180) *
      Math.cos((to[0] * Math.PI) / 180) *
      Math.sin(lngDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatCoord(value, digits = 5) {
  return Number(value).toFixed(digits);
}

export function buildSegments(stops) {
  const segments = [];
  let cumulative = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    const from = [stops[i].lat, stops[i].lng];
    const to = [stops[i + 1].lat, stops[i + 1].lng];
    const dist = haversineDistance(from, to);
    segments.push({ from, to, dist, cumulative });
    cumulative += dist;
  }
  return { segments, totalDistance: cumulative };
}

export function interpolateAlongRoute(segments, totalDistance, progressKm) {
  const target = Math.max(0, Math.min(progressKm, totalDistance));
  for (const seg of segments) {
    const segEnd = seg.cumulative + seg.dist;
    if (target <= segEnd) {
      const frac = seg.dist > 0 ? (target - seg.cumulative) / seg.dist : 0;
      return [
        seg.from[0] + (seg.to[0] - seg.from[0]) * frac,
        seg.from[1] + (seg.to[1] - seg.from[1]) * frac,
      ];
    }
  }
  const last = segments[segments.length - 1];
  return last ? last.to : [0, 0];
}

export function findStopIndexAhead(stops, position) {
  for (let i = 0; i < stops.length; i++) {
    const dist = haversineDistance(position, [stops[i].lat, stops[i].lng]);
    if (dist > 0.15) return i;
  }
  return stops.length - 1;
}

export function nearestStopName(stops, position) {
  let nearest = stops[0];
  let minDist = Infinity;
  for (const stop of stops) {
    const dist = haversineDistance(position, [stop.lat, stop.lng]);
    if (dist < minDist) {
      minDist = dist;
      nearest = stop;
    }
  }
  return nearest.name;
}
