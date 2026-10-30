import { useState } from 'react';
import { X } from 'lucide-react';
import { routes, knownBusIds } from '../data/routes';
import { validateReport } from '../utils/validation';

export function ReportModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    itemName: '',
    type: 'Lost',
    busId: knownBusIds[0] ?? '',
    customBusId: '',
    routeId: routes[0]?.id ?? 'R9',
    description: '',
    contact: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => setForm((c) => ({ ...c, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const busId = form.busId === 'Other' ? form.customBusId.trim() : form.busId;
    const payload = {
      itemName: form.itemName.trim(),
      type: form.type,
      busId,
      routeId: form.routeId,
      description: form.description.trim(),
      contact: form.contact.trim(),
    };
    const { errors: errs, isValid } = validateReport(payload);
    setErrors(errs);
    if (!isValid) return;
    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch {
      // keep form data on error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <p className="eyebrow">Help reunite an item</p>
            <h2>Report an item</h2>
          </div>
          <button className="icon-button light" onClick={onClose} aria-label="Close"><X size={19} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <label>Item name
            <input value={form.itemName} onChange={(e) => update('itemName', e.target.value)} placeholder="e.g. Black wallet" />
            {errors.itemName && <small className="form-error">{errors.itemName}</small>}
          </label>
          <div className="form-grid">
            <label>Status
              <select value={form.type} onChange={(e) => update('type', e.target.value)}>
                <option>Lost</option>
                <option>Found</option>
              </select>
            </label>
            <label>Bus ID
              <select value={form.busId} onChange={(e) => update('busId', e.target.value)}>
                {knownBusIds.map((id) => <option key={id}>{id}</option>)}
                <option value="Other">Other</option>
              </select>
              {form.busId === 'Other' && (
                <input value={form.customBusId} onChange={(e) => update('customBusId', e.target.value)} placeholder="Enter bus ID" style={{ marginTop: '8px' }} />
              )}
              {errors.busId && <small className="form-error">{errors.busId}</small>}
            </label>
          </div>
          <label>Route number
            <select value={form.routeId} onChange={(e) => update('routeId', e.target.value)}>
              {routes.map((route) => <option key={route.id}>{route.id}</option>)}
            </select>
          </label>
          <label>Description
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Add a few identifying details" />
            {errors.description && <small className="form-error">{errors.description}</small>}
          </label>
          <label>Contact information
            <input value={form.contact} onChange={(e) => update('contact', e.target.value)} placeholder="Phone (03xx-xxxxxxx) or email" />
            {errors.contact && <small className="form-error">{errors.contact}</small>}
          </label>
          <button className="primary-button full" type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit report'}
          </button>
        </form>
      </section>
    </div>
  );
}
