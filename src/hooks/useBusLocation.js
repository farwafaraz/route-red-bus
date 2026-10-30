import { useEffect, useState, useRef } from 'react';
import { subscribeToBus } from '../firebase';
import { settings } from '../config';

export function useBusLocation(busId, { onError } = {}) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [hasReceivedData, setHasReceivedData] = useState(false);
  const errorRef = useRef(onError);
  errorRef.current = onError;

  useEffect(() => {
    setLocation(null);
    setHasReceivedData(false);
    const unsub = subscribeToBus(
      busId,
      (data) => {
        setLocation(data);
        setHasReceivedData(true);
      },
      (err) => {
        setError(err);
        errorRef.current?.(err);
      }
    );
    return unsub;
  }, [busId]);

  const isStale = (loc) => {
    if (!loc) return true;
    return (Date.now() - (loc.lastUpdated ?? 0)) / 1000 > settings.staleAfterSeconds;
  };

  const isLive = () => {
    if (!location || location.status !== 'active' || isStale(location)) return false;
    return true;
  };

  return { location, error, hasReceivedData, isStale, isLive };
}
