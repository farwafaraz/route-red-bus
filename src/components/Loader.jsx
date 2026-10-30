export function Loader({ label = 'Loading…' }) {
  return (
    <div className="loader">
      <div className="loader-spinner" />
      <span>{label}</span>
    </div>
  );
}
