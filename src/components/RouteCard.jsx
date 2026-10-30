import { UserRound, Clock3, MapPin, Navigation } from 'lucide-react';
import { StatusPill } from './StatusPill';
import { estimateEta } from '../utils/eta';
import { settings } from '../config';

export function RouteCard({ route, busData, boardingStop, onClick, demoMode, demoRouteIds }) {
  let status = 'Inactive';
  let isLive = false;

  if (demoMode && demoRouteIds?.includes(route.id)) {
    status = 'Live';
    isLive = true;
  } else if (busData && busData.status === 'active') {
    const ageSec = (Date.now() - (busData.lastUpdated ?? 0)) / 1000;
    if (ageSec < settings.staleAfterSeconds) {
      status = 'Live';
      isLive = true;
    }
  }

  if (status === 'Inactive' && route.departureMinutes > 0) {
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    if (route.departureMinutes > currentMin) {
      status = 'Scheduled';
    }
  }

  let etaLabel = 'No live data';
  if (isLive && busData && boardingStop) {
    const eta = estimateEta({
      busPosition: [busData.latitude, busData.longitude],
      stopPosition: [boardingStop.lat, boardingStop.lng],
      gpsSpeedKmh: busData.speed,
    });
    etaLabel = `~${eta.etaMinutes} min`;
  }

  const isDemo = demoMode && demoRouteIds?.includes(route.id);

  return (
    <button className="route-card" onClick={onClick} data-status={status.toLowerCase()}>
      <div className="route-line">
        <span className="route-number">{route.id}</span>
        <span className="route-name">{route.name}</span>
        <StatusPill status={status} extra={isDemo ? 'Demo' : null} />
      </div>
      <div className="route-meta">
        <span><UserRound size={13} /> {route.busId}</span>
        <span><Clock3 size={13} /> {route.departure}</span>
      </div>
      <div className="route-bottom">
        <span className="route-path">
          <MapPin size={12} /> {route.start} <i>→</i> {route.destination} <Navigation size={11} />
        </span>
        <span className={`eta ${status === 'Inactive' ? 'muted' : ''}`}>{etaLabel}</span>
      </div>
      <span className="view-link">View Live Tracking <span>↗</span></span>
    </button>
  );
}
