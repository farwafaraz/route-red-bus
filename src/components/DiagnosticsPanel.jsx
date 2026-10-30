import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { firebaseReady, getAuthUid } from '../firebase';

export function DiagnosticsPanel({ lastWriteResult, lastSnapshotTime }) {
  const [open, setOpen] = useState(false);
  if (!new URLSearchParams(window.location.search).get('debug')) return null;

  return (
    <div className="diag-panel">
      <button className="diag-toggle" onClick={() => setOpen(!open)}>
        Diagnostics <ChevronDown size={15} className={open ? 'rotated' : ''} />
      </button>
      {open && (
        <dl className="diag-body">
          <dt>Firebase configured</dt><dd>{firebaseReady ? 'Yes' : 'No'}</dd>
          <dt>Auth UID</dt><dd>{getAuthUid() ?? '—'}</dd>
          <dt>isSecureContext</dt><dd>{String(window.isSecureContext)}</dd>
          <dt>Last write</dt><dd>{lastWriteResult ?? '—'}</dd>
          <dt>Last snapshot</dt><dd>{lastSnapshotTime ? new Date(lastSnapshotTime).toLocaleTimeString() : '—'}</dd>
        </dl>
      )}
    </div>
  );
}
