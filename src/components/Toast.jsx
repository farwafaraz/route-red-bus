import { CircleCheck, CircleAlert } from 'lucide-react';

export function Toast({ message, type = 'success' }) {
  if (!message) return null;
  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? <CircleCheck size={18} /> : <CircleAlert size={18} />}
      {message}
    </div>
  );
}
