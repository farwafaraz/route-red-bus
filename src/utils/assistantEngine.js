import { estimateEta } from './eta';
import { haversineDistance, nearestStopName, findStopIndexAhead } from './geo';
import { getRoute } from '../data/routes';
import { settings } from '../config';

export function answerQuestion(question, context) {
  const text = question.toLowerCase().trim();
  const { routes, buses, demoMode, now, savedBoarding, lastBus, lastRoute } = context;

  const activeBuses = Object.entries(buses)
    .filter(([, data]) => data && data.status === 'active' && (now - (data.lastUpdated ?? 0)) / 1000 < settings.staleAfterSeconds)
    .map(([id, data]) => ({ id, ...data }));

  const prefix = demoMode ? '(Demo Mode — simulated data) ' : '';

  if (/^(hi|hello|hey|salam|assalam)/i.test(text) || text === 'hi') {
    return `${prefix}Hi! I can help with bus locations, ETA, active buses, next stops, and route info.`;
  }

  if (/thank|thanks|shukria/i.test(text)) {
    return `${prefix}You're welcome! Let me know if you need anything else.`;
  }

  const isRouteQuery = /r\s*9|r\s*4|r\s*2|route/i.test(text);
  const routeIdMatch = text.match(/r\s*([492])/);
  const queriedRouteId = routeIdMatch ? `R${routeIdMatch[1]}` : null;
  const routeInfoId = queriedRouteId || lastRoute;

  if (isRouteQuery && routeInfoId) {
    const route = getRoute(routeInfoId);
    if (route) {
      const stopsList = route.stops.map((stop) => stop.name).join(' → ');
      return `${prefix}Route ${route.id} — ${route.name}. Runs from ${route.start} to ${route.destination}. Stops: ${stopsList}.`;
    }
  }

  const isWhere = /where|location|kahan|bus kahan/i.test(text);
  const isEta = /when|arrive|eta|kab|kitni|kitni der/i.test(text);
  const isActive = /active|available|chali|running|which bus/i.test(text);
  const isNextStop = /next stop|agla stop|next/i.test(text);

  if (isWhere || isEta) {
    const bus = isWhere
      ? activeBuses[0]
      : activeBuses.find((b) => b.id === (lastBus || activeBuses[0]?.id)) || activeBuses[0];

    if (!bus && !demoMode) {
      return 'Sorry, live bus location is currently unavailable.';
    }

    const simBus = demoMode && !bus ? activeBuses[0] : bus;
    const target = simBus || activeBuses[0];

    if (!target) {
      return `${prefix}Sorry, no live bus data is available right now.`;
    }

    const route = getRoute(target.routeId) || routes.find((r) => r.busId === target.id);

    if (isWhere) {
      const nearStop = route ? nearestStopName(route.stops, [target.latitude, target.longitude]) : 'unknown';
      return `${prefix}Bus ${target.id} on Route ${target.routeId} is currently near ${nearStop}.`;
    }

    if (isEta) {
      if (!route) return `${prefix}Bus ${target.id} is active but route data is unavailable for ETA.`;
      const boardingStop = savedBoarding
        ? route.stops.find((s) => s.name === savedBoarding)
        : route.stops[0];
      if (!boardingStop) return `${prefix}Bus ${target.id} is active but the boarding stop was not found.`;

      const eta = estimateEta({
        busPosition: [target.latitude, target.longitude],
        stopPosition: [boardingStop.lat, boardingStop.lng],
        gpsSpeedKmh: target.speed,
      });

      const speedNote = eta.usedFallbackSpeed ? 'based on average bus speed' : 'based on current GPS speed';
      return `${prefix}Bus ${target.id} is approximately ${eta.etaMinutes} minutes away from ${boardingStop.name} (${speedNote}, straight-line distance ${eta.distanceKm.toFixed(1)} km).`;
    }
  }

  if (isActive) {
    if (activeBuses.length === 0) {
      return `${prefix}No buses are currently active${demoMode ? '' : '. Live data is unavailable.'}`;
    }
    const list = activeBuses.map((b) => `${b.id} (${b.routeId})`).join(', ');
    return `${prefix}${activeBuses.length} bus${activeBuses.length > 1 ? 'es' : ''} active: ${list}.`;
  }

  if (isNextStop) {
    const bus = activeBuses[0];
    if (!bus && !demoMode) {
      return `${prefix}Sorry, live bus location is currently unavailable.`;
    }
    const target = bus || activeBuses[0];
    if (!target) return `${prefix}No active bus found.`;
    const route = getRoute(target.routeId);
    if (!route) return `${prefix}Route data is unavailable for bus ${target.id}.`;
    const nextIdx = findStopIndexAhead(route.stops, [target.latitude, target.longitude]);
    const nextStop = route.stops[nextIdx];
    return `${prefix}The next stop for bus ${target.id} on route ${route.id} is ${nextStop.name}.`;
  }

  return `${prefix}I can help with bus locations, arrival times, active buses, next stops, and route info (R9, R4, R2). Try asking "Where is my bus?" or "When will it arrive?".`;
}
