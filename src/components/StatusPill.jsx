export function StatusPill({ status, extra }) {
  const cls = status.toLowerCase();
  return (
    <span className={`status-pill ${cls}`}>
      {status}
      {extra && <em className="status-extra">{extra}</em>}
    </span>
  );
}
