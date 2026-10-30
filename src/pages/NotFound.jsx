import { Link } from 'react-router-dom';
import { Shell } from '../components/Shell';

export function NotFound() {
  return (
    <Shell title="Page not found">
      <main className="page not-found">
        <p className="eyebrow">RoutVia</p>
        <h1>That stop does not exist.</h1>
        <p>We could not find the page you were looking for.</p>
        <Link className="primary-button" to="/">Back to Explore</Link>
      </main>
    </Shell>
  );
}
