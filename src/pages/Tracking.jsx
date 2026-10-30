import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Shell } from '../components/Shell';
import { MapControls } from '../components/MapControls';
import { StopList } from '../components/StopList';
import { EtaPanel } from '../components/EtaPanel';
import { DiagnosticsPanel } from '../components/DiagnosticsPanel';
import { ErrorBanner } from '../components/ErrorBanner';
import { getRouteByBusId } from '../data/routes';
import { useBusLocation } from '../hooks/useBusLocation';
import { useDemoSimulation } from '../hooks/useDemoSimulation';
import { estimateEta } from '../utils/eta';
import { buildSegments, findStopIndexAhead, haversineDistance } from '../utils/geo';
import { createBusIcon, createPassengerIcon } from '../components/BusMarker';
import { shouldStartInDemoMode, isFirebaseConfigured, settings } from '../config';

function FitRouteControl({ stops, followRef, setFollowBus }) {
  const map = useMap();
  const fitRef = useRef(null);

  useEffect(() => {
    const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
    fitRef.current = bounds;
  }, [map, stops]);

  useMapEvents({
    dragstart: () => { followRef.current = false; setFollowBus(false); },
    zoomstart: () => {},
  });

  return null;
}

function FollowBusControl({ position, follow }) {
  const map = useMap();
  useEffect(() => {
    if (follow && position) {
      map.panTo(position, { animate: true });
    }
  }, [position, follow, map]);
  return null;
}

export function Tracking() {
  const { busId = 'BUS001' } = useParams();
  const route = getRouteByBusId(busId) ?? getRouteByBusId('BUS001');
  const demoModeDefault = shouldStartInDemoMode();
  const [demoMode, setDemoMode] = useState(demoModeDefault);
  const [selectedStop, setSelectedStop] = useState(route?.stops[0] ?? null);
  const [followBus, setFollowBus] = useState(true);
  const [passengerPos, setPassengerPos] = useState(null);
  const followRef = useRef(true);
  const mapRef = useRef(null);
  const [authError, setAuthError] = useState(null);

  const { location, error: busError } = useBusLocation(busId, {
    onError: (err) => setAuthError(err),
  });

  const { position: demoPos } = useDemoSimulation(route, demoMode);

  const livePos = (!demoMode && location && location.status === 'active' &&
    (Date.now() - (location.lastUpdated ?? 0)) / 1000 < settings.staleAfterSeconds)
    ? [location.latitude, location.longitude] : null;

  const demoPosition = demoMode && demoPos ? [demoPos.latitude, demoPos.longitude] : null;
  const activePosition = livePos || demoPosition;

  const isLive = Boolean(livePos);
  const isWaiting = !activePosition;

  const { segments, totalDistance } = buildSegments(route.stops);
  const passedStopIndex = activePosition
    ? findStopIndexAhead(route.stops, activePosition)
    : 0;
  const nextStopName = route.stops[Math.min(passedStopIndex, route.stops.length - 1)]?.name;

  const eta = activePosition && selectedStop
    ? estimateEta({
        busPosition: activePosition,
        stopPosition: [selectedStop.lat, selectedStop.lng],
        gpsSpeedKmh: demoMode ? demoPos?.speed : location?.speed,
      })
    : null;

  const handleZoomIn = useCallback(() => mapRef.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => mapRef.current?.zoomOut(), []);
  const handleFitRoute = useCallback(() => {
    const bounds = L.latLngBounds(route.stops.map((s) => [s.lat, s.lng]));
    mapRef.current?.fitBounds(bounds, { padding: [40, 40] });
  }, [route]);
  const handleMyLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = [pos.coords.latitude, pos.coords.longitude];
        setPassengerPos(p);
        mapRef.current?.setView(p, 14, { animate: true });
      },
      () => { /* permission denied - graceful */ },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);
  const handleToggleFollow = useCallback(() => {
    setFollowBus((prev) => {
      const next = !followRef.current;
      followRef.current = next;
      return next;
    });
  }, []);

  return (
    <Shell title="Live tracking" subtitle={`Bus ${busId} · ${route.id} — ${route.name}`}>
      {!isFirebaseConfigured && <ErrorBanner type="demo" />}
      {authError && isFirebaseConfigured && <ErrorBanner type="auth" error={authError} onDismiss={() => setAuthError(null)} />}
      <main className="tracking-page">
        <div className="tracking-map-wrap">
          <MapContainer
            center={[route.stops[0].lat, route.stops[0].lng]}
            zoom={12}
            scrollWheelZoom
            className="tracking-map"
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline
              positions={route.stops.map((s) => [s.lat, s.lng])}
              pathOptions={{ color: '#126ac1', weight: 5, opacity: 0.8 }}
            />
            {route.stops.map((stop) => (
              <Marker
                key={stop.name}
                position={[stop.lat, stop.lng]}
                icon={L.divIcon({
                  className: 'stop-marker-icon',
                  html: `<div class="stop-marker-dot ${selectedStop?.name === stop.name ? 'selected' : ''}"></div>`,
                  iconSize: [14, 14],
                  iconAnchor: [7, 7],
                })}
                eventHandlers={{ click: () => setSelectedStop(stop) }}
              >
                <Tooltip>{stop.name}</Tooltip>
              </Marker>
            ))}
            {passengerPos && (
              <Marker position={passengerPos} icon={createPassengerIcon()} />
            )}
            {activePosition && (
              <Marker position={activePosition} icon={createBusIcon(isLive)} />
            )}
            <FitRouteControl stops={route.stops} followRef={followRef} setFollowBus={setFollowBus} />
            {activePosition && (
              <FollowBusControl position={activePosition} follow={followBus && followRef.current} />
            )}
          </MapContainer>

          <div className="map-top-label">
            {demoMode ? (
              <><span className="pulse-dot demo" /> Demo Mode — Simulated Bus Location</>
            ) : isLive ? (
              <><span className="pulse-dot" /> Live driver location · Updated {Math.max(0, Math.floor((Date.now() - (location?.lastUpdated ?? 0)) / 1000))}s ago</>
            ) : (
              <><span className="pulse-dot waiting" /> Waiting for Driver Location{location?.status === 'inactive' ? ' · Trip ended' : ''}</>
            )}
          </div>

          <div className="demo-toggle">
            <label>
              <input type="checkbox" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} />
              <span>Demo Mode</span>
            </label>
          </div>

          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onMyLocation={handleMyLocation}
            onFitRoute={handleFitRoute}
            followBus={followBus}
            onToggleFollow={handleToggleFollow}
          />
        </div>

        <EtaPanel
          eta={eta}
          selectedStop={selectedStop}
          nextStop={nextStopName}
          route={route}
          busData={demoMode ? demoPos : location}
          demoMode={demoMode}
          lastUpdated={!demoMode ? location?.lastUpdated : null}
        />

        <div className="stop-list-section">
          <h3 className="stop-list-heading">Route Stops</h3>
          <StopList
            stops={route.stops}
            selectedStop={selectedStop}
            onSelect={setSelectedStop}
            passedStopIndex={passedStopIndex}
          />
        </div>

        <div className="route-overview">
          <h3 className="stop-list-heading">Route Overview</h3>
          {route.stops.map((stop, i) => {
            if (i === route.stops.length - 1) return null;
            const dist = haversineDistance([stop.lat, stop.lng], [route.stops[i + 1].lat, route.stops[i + 1].lng]);
            return (
              <div key={stop.name} className="route-overview-row">
                <span>{stop.name} → {route.stops[i + 1].name}</span>
                <em>~{(dist * settings.roadDistanceMultiplier).toFixed(1)} km</em>
              </div>
            );
          })}
          <div className="route-overview-row total">
            <span>Total route distance</span>
            <em>~{(totalDistance * settings.roadDistanceMultiplier).toFixed(1)} km</em>
          </div>
        </div>

        <DiagnosticsPanel lastSnapshotTime={location?.lastUpdated} />
      </main>
    </Shell>
  );
}
