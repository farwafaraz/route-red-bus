import { Zap } from 'lucide-react';

export function EtaPanel({ eta, selectedStop, nextStop, route, busData, demoMode, lastUpdated }) {
  const lastUpdatedLabel = lastUpdated
    ? `${Math.max(0, Math.floor((Date.now() - lastUpdated) / 1000))}s ago`
    : '—';

  return (
    <section className="trip-panel">
      <div className="panel-handle" />
      <div className="trip-summary">
        <div>
          <p className="eyebrow">Your selected stop</p>
          <h2>{selectedStop?.name ?? '—'}</h2>
        </div>
        <div className="eta-block">
          {eta ? (
            <>
              <strong>{eta.etaMinutes} min</strong>
              <span>approx. arrival</span>
            </>
          ) : (
            <>
              <strong>—</strong>
              <span>no live data</span>
            </>
          )}
        </div>
      </div>
      <div className="trip-facts">
        <div>
          <span>Bus ID</span>
          <strong>{route.busId}</strong>
        </div>
        <div>
          <span>Route</span>
          <strong>{route.id} — {route.name}</strong>
        </div>
        <div>
          <span>Distance</span>
          <strong>{eta ? `${eta.distanceKm.toFixed(1)} km` : '—'}</strong>
        </div>
        <div>
          <span>Speed</span>
          <strong>{busData?.speed != null ? `${busData.speed} km/h` : '—'}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{busData?.status ?? (demoMode ? 'Active' : 'Waiting')}</strong>
        </div>
        <div>
          <span>Updated</span>
          <strong>{demoMode ? 'Now' : lastUpdatedLabel}</strong>
        </div>
      </div>
      <div className="approx-note">
        <Zap size={15} />
        {eta?.usedFallbackSpeed
          ? 'Based on average bus speed · approximate, straight-line based.'
          : 'Estimated arrival — approximate, based on straight-line distance.'}
      </div>
      {nextStop && (
        <div className="next-stop">
          <div>
            <span className="live-dot" /> Next stop
          </div>
          <strong>{nextStop}</strong>
        </div>
      )}
    </section>
  );
}
