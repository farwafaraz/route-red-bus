import { useEffect, useState, useRef } from 'react';
import { subscribeToAllBuses } from '../firebase';
import { settings } from '../config';

export function useAllBuses() {
  const [buses, setBuses] = useState({});
  const [error, setError] = useState(null);
  const errorRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeToAllBuses(
      (data) => setBuses(data),
      (err) => setError(err)
    );
    return unsub;
  }, []);

  const freshActiveBuses = Object.entries(buses)
    .filter(([, data]) => data && data.status === 'active' && (Date.now() - (data.lastUpdated ?? 0)) / 1000 < settings.staleAfterSeconds)
    .reduce((acc, [id, data]) => { acc[id] = data; return acc; }, {});

  return { buses, freshActiveBuses, error };
}
