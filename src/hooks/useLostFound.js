import { useEffect, useState, useRef } from 'react';
import { subscribeToLostFound, firebaseReady } from '../firebase';
import { demoItems } from '../data/demoItems';

const STORAGE_KEY = 'routvia-lost-found-local';

function loadLocalReports() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function useLostFound() {
  const [items, setItems] = useState(() => [...demoItems]);
  const [loading, setLoading] = useState(firebaseReady);
  const [error, setError] = useState(null);
  const errorRef = useRef(null);

  useEffect(() => {
    if (firebaseReady) {
      const unsub = subscribeToLostFound(
        (remote) => {
          const remoteItems = Object.entries(remote).map(([id, report]) => ({
            ...report,
            id,
            isRemote: true,
          }));
          const seen = new Set();
          const merged = [...remoteItems, ...demoItems].filter((item) => {
            const key = `${item.itemName}-${item.busId}-${item.type}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          merged.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
          setItems(merged);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );
      return unsub;
    } else {
      setItems([...demoItems, ...loadLocalReports()]);
      setLoading(false);
    }
  }, []);

  const addLocalReport = (report) => {
    const stored = loadLocalReports();
    stored.push(report);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    setItems((prev) => [...prev, report].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)));
  };

  return { items, loading, error, addLocalReport };
}
