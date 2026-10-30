import { CircleCheck } from 'lucide-react';

export function StopList({ stops, selectedStop, onSelect, passedStopIndex }) {
  return (
    <div className="stop-list">
      {stops.map((stop, index) => {
        const isSelected = selectedStop?.name === stop.name;
        const isPassed = index < passedStopIndex;
        return (
          <button
            key={stop.name}
            className={`stop-row ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(stop)}
          >
            <span className={`stop-dot ${isPassed ? 'passed' : ''}`} />
            <span>{stop.name}</span>
            {isPassed && <CircleCheck size={15} />}
          </button>
        );
      })}
    </div>
  );
}
