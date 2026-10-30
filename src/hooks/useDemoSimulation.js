import { useEffect, useMemo, useRef, useState } from 'react';
import { buildSegments, interpolateAlongRoute } from '../utils/geo';
import { settings } from '../config';

export function useDemoSimulation(route, isOn) {
  const [position, setPosition] = useState(null);
  const [progressKm, setProgressKm] = useState(0);
  const { segments, totalDistance } = useMemo(() => buildSegments(route.stops), [route.stops]);
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);

  useEffect(() => {
    if (!isOn || totalDistance <= 0) return;

    const speedKmPerSec = settings.averageBusSpeedKmh / 3600;

    const tick = (time) => {
      if (lastTimeRef.current == null) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      setProgressKm((prev) => {
        const next = prev + speedKmPerSec * dt;
        return next >= totalDistance ? next - totalDistance : next;
      });

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      lastTimeRef.current = null;
    };
  }, [isOn, totalDistance]);

  useEffect(() => {
    if (!isOn) return;
    const [lat, lng] = interpolateAlongRoute(segments, totalDistance, progressKm);
    setPosition({
      latitude: lat,
      longitude: lng,
      speed: settings.averageBusSpeedKmh,
      accuracy: 15,
      status: 'active',
      lastUpdated: Date.now(),
    });
  }, [progressKm, isOn, segments, totalDistance]);

  return { position, progressKm, totalDistance };
}
