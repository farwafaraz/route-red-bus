import { useMemo, useState } from 'react';
import { Search, CircleAlert, CircleCheck, X } from 'lucide-react';
import { Shell } from '../components/Shell';
import { ReportModal } from '../components/ReportModal';
import { StatusPill } from '../components/StatusPill';
import { Toast } from '../components/Toast';
import { Loader } from '../components/Loader';
import { useLostFound } from '../hooks/useLostFound';
import { firebaseReady, publishLostFoundReport } from '../firebase';
import { formatTimestamp } from '../utils/time';

export function LostFound() {
  const { items, loading, addLocalReport } = useLostFound();
  const [tab, setTab] = useState('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return items.filter((item) => {
      const tabMatch = tab === 'All' || item.type === tab;
      if (!term) return tabMatch;
      const haystack = `${item.itemName} ${item.busId} ${item.routeId} ${item.description}`.toLowerCase();
      return tabMatch && haystack.includes(term);
    });
  }, [items, tab, search]);

  const submit = async (report) => {
    const payload = { ...report, createdAt: Date.now() };
    if (firebaseReady) {
      try {
        await publishLostFoundReport(payload);
        setShowForm(false);
        setToast({ message: 'Report submitted successfully', type: 'success' });
      } catch {
        setToast({ message: 'Could not submit report. Please try again.', type: 'error' });
        throw new Error('submit failed');
      }
    } else {
      addLocalReport({ ...payload, id: `local-${Date.now()}` });
      setShowForm(false);
      setToast({ message: 'Saved on this device only', type: 'success' });
    }
    window.setTimeout(() => setToast(null), 3500);
  };

  return (
    <Shell title="Lost & Found" subtitle="Karachi Red Bus network">
      <main className="page lost-page">
        <div className="page-header">
          <div><p className="eyebrow">Karachi Red Bus network</p><h1>Lost & Found</h1></div>
          <button className="icon-button light" onClick={() => setSearchOpen((v) => !v)} aria-label="Search items"><Search size={19} /></button>
        </div>
        {searchOpen && (
          <div className="lost-search"><Search size={16} /><input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items, bus ID, route…" /><button onClick={() => { setSearch(''); setSearchOpen(false); }}><X size={16} /></button></div>
        )}
        {!firebaseReady && <div className="device-note">Saved on this device only</div>}
        <div className="tabs">
          {['All', 'Lost', 'Found'].map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}<span>{item === 'All' ? items.length : items.filter((r) => r.type === item).length}</span></button>)}
        </div>
        {loading ? <Loader label="Loading reports…" /> : (
          <div className="item-list">
            {filtered.map((item) => (
              <article className="item-card" key={item.id}>
                <div className={`item-icon ${item.type.toLowerCase()}`}>{item.type === 'Lost' ? <CircleAlert size={19} /> : <CircleCheck size={19} />}</div>
                <div className="item-details">
                  <div className="item-title"><h3>{item.itemName}</h3><StatusPill status={item.type} /></div>
                  <p>{item.description}</p>
                  <span><span className="bus-small">{item.busId}</span> · Route {item.routeId} · {formatTimestamp(item.createdAt)}</span>
                </div>
              </article>
            ))}
            {filtered.length === 0 && <div className="empty-state">No {tab.toLowerCase() === 'all' ? '' : tab.toLowerCase()} reports found</div>}
          </div>
        )}
        <button className="floating-action" onClick={() => setShowForm(true)}>+ Report Item</button>
      </main>
      {showForm && <ReportModal onClose={() => setShowForm(false)} onSubmit={submit} />}
      <Toast message={toast?.message} type={toast?.type} />
    </Shell>
  );
}
