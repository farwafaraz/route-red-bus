import { Shell } from '../components/Shell';

export function About() {
  return (
    <Shell title="About RoutVia" subtitle="Karachi Red Bus">
      <main className="page about-page">
        <p className="eyebrow">About RoutVia</p>
        <h1>Smart Public Transport Tracking</h1>
        <p>RoutVia helps passengers track Karachi Red Bus services, find approximate arrival times, and share lost-and-found reports with the network.</p>
        <div className="about-card"><strong>Adaptive Smart Mobile App for Tracking and Monitoring of Public Transport</strong><span>Passenger-facing tracking for Karachi Red Bus.</span></div>
      </main>
    </Shell>
  );
}
