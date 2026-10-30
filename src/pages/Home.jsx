import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, ArrowLeftRight } from 'lucide-react';
import { Shell } from '../components/Shell';
import { RouteCard } from '../components/RouteCard';
import { ErrorBanner } from '../components/ErrorBanner';
import { routes as localRoutes, allStops } from '../data/routes';
import { useAllBuses } from '../hooks/useAllBuses';
import { useDemoSimulation } from '../hooks/useDemoSimulation';
import { shouldStartInDemoMode, isFirebaseConfigured, settings } from '../config';

const BOARDING_KEY = 'routvia-boarding-stop';
const DESTINATION_KEY = 'routvia-destination-stop';

export function Home() {
  const navigate = useNavigate();
  const demoMode = shouldStartInDemoMode();
  const { buses } = useAllBuses();
  const { position: demoR9 } = useDemoSimulation(localRoutes[0], demoMode);
  const { position: demoR4 } = useDemoSimulation(localRoutes[1], demoMode);
  const [boarding, setBoarding] = useState(() => localStorage.getItem(BOARDING_KEY) || 'Gulshan-e-Iqbal');
  const [destination, setDestination] = useState(() => localStorage.getItem(DESTINATION_KEY) || 'North Karachi');
  const [filter, setFilter] = useState('All Routes');

  useEffect(() => {
    localStorage.setItem(BOARDING_KEY, boarding);
  }, [boarding]);

  const swap = () => {
    setBoarding(destination);
    setDestination(boarding);
  };

  const tripRoutes = localRoutes.filter((route) => {
    const stops = route.stops.map((s) => s.name);
    const boardingIdx = stops.indexOf(boarding);
    const destIdx = stops.indexOf(destination);
    return boardingIdx >= 0 && destIdx >= 0 && boardingIdx < destIdx;
  });

  const demoRouteIds = ['R9', 'R4'];
  const demoBuses = { BUS001: demoR9, BUS007: demoR4 };

  let visibleRoutes = tripRoutes;
  if (filter === 'Active Buses') {
    visibleRoutes = tripRoutes.filter((r) => {
      const bus = buses[r.busId] || (demoMode ? demoBuses[r.busId] : null);
      if (demoMode && demoRouteIds.includes(r.id)) return true;
      return bus && bus.status === 'active' && (Date.now() - (bus.lastUpdated ?? 0)) / 1000 < settings.staleAfterSeconds;
    });
  } else if (filter === 'Scheduled Buses') {
    visibleRoutes = tripRoutes.filter((r) => {
      const bus = buses[r.busId] || (demoMode ? demoBuses[r.busId] : null);
      const isLive = (demoMode && demoRouteIds.includes(r.id)) ||
        (bus && bus.status === 'active' && (Date.now() - (bus.lastUpdated ?? 0)) / 1000 < settings.staleAfterSeconds);
      return !isLive;
    });
  }

  return (
    <Shell>
      {!isFirebaseConfigured && <ErrorBanner type="demo" />}
      <main className="page home-page">
        <section className="hero-intro">
          <div>
            <p className="project-title">Adaptive Smart Mobile App for Tracking and Monitoring of Public Transport</p>
            <p className="eyebrow">Smart Public Transport Tracking</p>
            <h1>Plan your ride<br /><span>with confidence.</span></h1>
          </div>
          <div className="live-badge"><span className="pulse-dot" /> Live network</div>
        </section>

        <section className="search-card">
          <div className="field-row">
            <MapPin size={18} />
            <label>Boarding at
              <select value={boarding} onChange={(e) => setBoarding(e.target.value)}>
                {allStops.map((stop) => <option key={stop}>{stop}</option>)}
              </select>
            </label>
            <span className="field-chevron">⌄</span>
          </div>
          <div className="field-divider" />
          <div className="field-row">
            <Navigation size={18} />
            <label>Going to
              <select value={destination} onChange={(e) => setDestination(e.target.value)}>
                {allStops.map((stop) => <option key={stop}>{stop}</option>)}
              </select>
            </label>
            <button className="swap-btn" onClick={swap} aria-label="Swap stops">
              <ArrowLeftRight size={16} />
            </button>
          </div>
        </section>

        <div className="section-heading">
          <div>
            <p className="eyebrow">Karachi Red Bus</p>
            <h2>Routes near you</h2>
          </div>
          <span className="demo-label">Sample Karachi routes — demo data</span>
        </div>

        <div className="filter-row">
          {['All Routes', 'Active Buses', 'Scheduled Buses'].map((item) => (
            <button key={item} className={`filter-chip ${filter === item ? 'active' : ''}`} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>

        <div className="route-list">
          {visibleRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              busData={buses[route.busId] || (demoMode ? demoBuses[route.busId] : null)}
              boardingStop={route.stops.find((stop) => stop.name === boarding)}
              demoMode={demoMode}
              demoRouteIds={demoRouteIds}
              onClick={() => navigate(`/tracking/${route.busId}`)}
            />
          ))}
          {visibleRoutes.length === 0 && (
            <div className="empty-state">No routes found for this trip</div>
          )}
        </div>
      </main>
    </Shell>
  );
}
