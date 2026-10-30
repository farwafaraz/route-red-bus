import { useEffect, useState } from 'react';
import { subscribeToRoutes } from '../firebase';
import { routes as localRoutes } from '../data/routes';

export function useRoutes() {
  const [routes, setRoutes] = useState(localRoutes);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToRoutes(
      (remote) => {
        if (remote && Object.keys(remote).length > 0) {
          const merged = Object.entries(remote).map(([id, data]) => {
            const local = localRoutes.find((r) => r.id === id);
            return {
              id,
              name: data.routeName ?? local?.name ?? id,
              busId: local?.busId ?? `BUS${id}`,
              departure: local?.departure ?? '—',
              departureMinutes: local?.departureMinutes ?? 0,
              start: data.startPoint ?? local?.start ?? '',
              destination: data.endPoint ?? local?.destination ?? '',
              stops: data.stops ?? local?.stops ?? [],
            };
          });
          setRoutes(merged.length > 0 ? merged : localRoutes);
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return { routes, loading };
}
