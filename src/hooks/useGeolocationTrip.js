import { useCallback, useEffect, useRef, useState } from 'react';
import { firebaseReady, publishBusLocation, setBusInactive, armOnDisconnect, cancelOnDisconnect, describeFirebaseError } from '../firebase';
import { settings } from '../config';

export function useGeolocationTrip() {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('Waiting for permission');
  const [firebaseStatus, setFirebaseStatus] = useState(firebaseReady ? 'Connected' : 'Not configured');
  const [trackingStatus, setTrackingStatus] = useState('Not started');
  const [lastLocation, setLastLocation] = useState(null);
  const [lastWriteResult, setLastWriteResult] = useState(null);
  const [lastWriteTime, setLastWriteTime] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [authError, setAuthError] = useState(null);
  const [wakeLock, setWakeLock] = useState(null);
  const [wakeLockSupported, setWakeLockSupported] = useState('wakeLock' in navigator);

  const watchIdRef = useRef(null);
  const lastWriteTimeRef = useRef(0);
  const lastWrittenLocationRef = useRef(null);
  const routeRef = useRef(null);

  const updateRoute = useCallback((route) => {
    if (!tracking) {
      setSelectedRoute(route);
      routeRef.current = route;
    }
  }, [tracking]);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const acquireWakeLock = async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);
    } catch { /* graceful fallback */ }
  };

  const releaseWakeLock = async () => {
    if (wakeLock) {
      try { await wakeLock.release(); } catch { /* noop */ }
      setWakeLock(null);
    }
  };

  const startTrip = useCallback(async () => {
    if (tracking) return;
    if (!routeRef.current) return;

    if (!window.isSecureContext) {
      setGpsStatus('GPS needs HTTPS. Open this page through your ngrok https link.');
      return;
    }

    if (!navigator.geolocation) {
      setGpsStatus('GPS is not available on this device');
      return;
    }

    setGpsStatus('Acquiring GPS signal…');
    setTrackingStatus('Tracking');

    await acquireWakeLock();

    const route = routeRef.current;
    armOnDisconnect(route.busId, route.id);

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const speedMs = pos.coords.speed ?? 0;
        const speedKmh = Math.max(0, Math.round(speedMs * 3.6));
        const accuracy = Math.max(0, Math.round(pos.coords.accuracy ?? 0));
        const next = {
          busId: route.busId,
          routeId: route.id,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          speed: speedKmh,
          accuracy,
          status: 'active',
          lastUpdated: Date.now(),
        };

        setLastLocation(next);
        setGpsStatus(accuracy > 50 ? 'Weak accuracy' : 'Good GPS lock');
        setTracking(true);

        const now = Date.now();
        const prev = lastWrittenLocationRef.current;
        const movedDist = prev
          ? Math.hypot(pos.coords.latitude - prev.latitude, pos.coords.longitude - prev.longitude) * 111000
          : Infinity;

        if (now - lastWriteTimeRef.current >= settings.gpsWriteIntervalSeconds * 1000 || movedDist > 10) {
          if (!navigator.onLine) {
            setFirebaseStatus('Offline');
            return;
          }

          try {
            setFirebaseStatus('Sending');
            await publishBusLocation(next);
            lastWriteTimeRef.current = now;
            lastWrittenLocationRef.current = next;
            setLastWriteResult('Success');
            setLastWriteTime(now);
            setFirebaseStatus('Connected');
          } catch (err) {
            setLastWriteResult(`Error: ${describeFirebaseError(err)}`);
            setFirebaseStatus('Error');
            if (err?.code?.includes('admin-restricted-operation') || err?.code?.includes('operation-not-allowed')) {
              setAuthError(describeFirebaseError(err));
            }
          }
        }
      },
      (error) => {
        if (error.code === 1) {
          setGpsStatus('Location permission denied. Enable location access in your browser settings.');
        } else if (error.code === 2) {
          setGpsStatus('Position unavailable. Retrying…');
        } else if (error.code === 3) {
          setGpsStatus('GPS timeout. Still watching…');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    watchIdRef.current = id;
  }, [tracking]);

  const stopTrip = useCallback(async () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setTracking(false);
    setTrackingStatus('Trip Stopped');
    setGpsStatus('Stopped');
    await releaseWakeLock();

    const route = routeRef.current;
    if (route) {
      cancelOnDisconnect(route.busId);
      try {
        if (lastLocation) {
          await publishBusLocation({ ...lastLocation, status: 'inactive', lastUpdated: Date.now() });
        } else {
          await setBusInactive(route.busId, route.id);
        }
        setFirebaseStatus('Connected');
      } catch (err) {
        setFirebaseStatus('Error');
        setLastWriteResult(`Error: ${describeFirebaseError(err)}`);
      }
    }
  }, [lastLocation]);

  // pagehide best-effort
  useEffect(() => {
    const handler = () => {
      const route = routeRef.current;
      if (route && tracking) {
        if (lastLocation) {
          publishBusLocation({ ...lastLocation, status: 'inactive', lastUpdated: Date.now() }).catch(() => {});
        } else {
          setBusInactive(route.busId, route.id).catch(() => {});
        }
      }
    };
    window.addEventListener('pagehide', handler);
    return () => window.removeEventListener('pagehide', handler);
  }, [tracking, lastLocation]);

  return {
    selectedRoute,
    updateRoute,
    tracking,
    gpsStatus,
    firebaseStatus,
    trackingStatus,
    lastLocation,
    lastWriteResult,
    lastWriteTime,
    online,
    authError,
    wakeLockSupported,
    startTrip,
    stopTrip,
  };
}
