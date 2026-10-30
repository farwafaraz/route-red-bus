import { useEffect, useState } from 'react';
import { Navigation, Play, Square, CircleAlert, Wifi, Signal, Radio } from 'lucide-react';
import { Shell } from '../components/Shell';
import { DiagnosticsPanel } from '../components/DiagnosticsPanel';
import { ErrorBanner } from '../components/ErrorBanner';
import { routes } from '../data/routes';
import { useGeolocationTrip } from '../hooks/useGeolocationTrip';
import { isFirebaseConfigured } from '../config';

export function Driver() {
  const trip = useGeolocationTrip();
  const [selectedId, setSelectedId] = useState(routes[0].id);
  const selectedRoute = routes.find((r) => r.id === selectedId) ?? routes[0];
  const [message, setMessage] = useState(null);

  useEffect(() => {
    trip.updateRoute(selectedRoute);
  }, [selectedRoute, trip.updateRoute]);

  useEffect(() => {
    if (trip.authError) setMessage(trip.authError);
  }, [trip.authError]);

  const handleStart = async () => {
    setMessage(null);
    await trip.startTrip();
  };

  return (
    <Shell title="Driver panel" subtitle="Your assigned routes">
      <main className="page driver-page">
        {!isFirebaseConfigured && (
          <div className="driver-warning"><CircleAlert size={16} /> Firebase not configured — location will NOT be shared with passengers</div>
        )}
        {message && <div className="driver-warning error"><CircleAlert size={16} /> {message}</div>}
        <div className="driver-welcome">
          <div>
            <p className="eyebrow">Good morning, driver</p>
            <h1>Ready for the road?</h1>
          </div>
          <span className={`driver-status ${trip.tracking ? 'on' : ''}`}>
            <span className="pulse-dot" /> {trip.tracking ? 'On trip' : 'Offline'}
          </span>
        </div>

        <label className="select-label">Select your assigned route
          <select disabled={trip.tracking} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {routes.map((route) => <option key={route.id} value={route.id}>{route.id} — {route.name}</option>)}
          </select>
        </label>

        <section className="assigned-card">
          <div className="assigned-card-top">
            <div><span className="route-number large">{selectedRoute.id}</span><h2>{selectedRoute.name}</h2></div>
            <span className="bus-badge">{selectedRoute.busId}</span>
          </div>
          <div className="route-journey">
            <div><span>Starting point</span><strong>{selectedRoute.start}</strong></div>
            <div className="journey-line" />
            <div><span>Destination</span><strong>{selectedRoute.destination}</strong></div>
          </div>
          <div className="driver-stops">
            {selectedRoute.stops.map((stop, index) => <span key={stop.name} className={index === 0 ? 'first' : ''}><i /> {stop.name}</span>)}
          </div>
        </section>

        <section className="gps-card">
          <div className="gps-card-heading">
            <div className="gps-icon"><Navigation size={19} /></div>
            <div><h3>GPS status</h3><p>{trip.gpsStatus}</p></div>
            <span className={`connection-dot ${trip.tracking ? 'connected' : ''}`} />
          </div>
          {trip.lastLocation && (
            <div className="coordinates">
              <span>Current coordinates</span>
              <strong>{trip.lastLocation.latitude.toFixed(5)}, {trip.lastLocation.longitude.toFixed(5)}</strong>
              <small>Accuracy ±{trip.lastLocation.accuracy}m · Speed {trip.lastLocation.speed} km/h</small>
            </div>
          )}
          <div className="status-grid">
            <div><Signal size={14} /><span>GPS</span><strong>{trip.gpsStatus}</strong></div>
            <div><Wifi size={14} /><span>Firebase</span><strong>{trip.online ? trip.firebaseStatus : 'Offline'}</strong></div>
            <div><Radio size={14} /><span>Tracking</span><strong>{trip.trackingStatus}</strong></div>
          </div>
          {!trip.tracking ? (
            <button className="primary-button full trip-button" onClick={handleStart} disabled={!trip.selectedRoute}>
              <Play size={18} fill="currentColor" /> Start Trip
            </button>
          ) : (
            <button className="stop-button full trip-button" onClick={() => trip.stopTrip()}>
              <Square size={16} fill="currentColor" /> Stop Trip
            </button>
          )}
        </section>
        <div className="driver-note"><CircleAlert size={16} /><span>Keep this screen open while driving. GPS works best over a secure HTTPS connection.{!trip.wakeLockSupported ? ' Screen wake lock is not supported on this device.' : ''}</span></div>
        <DiagnosticsPanel lastWriteResult={trip.lastWriteResult} lastSnapshotTime={trip.lastWriteTime} />
      </main>
    </Shell>
  );
}
