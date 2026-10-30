import { Plus, Minus, Locate, Maximize, Crosshair } from 'lucide-react';

export function MapControls({ onZoomIn, onZoomOut, onMyLocation, onFitRoute, followBus, onToggleFollow }) {
  return (
    <div className="map-controls">
      <button onClick={onZoomIn} aria-label="Zoom in"><Plus size={17} /></button>
      <button onClick={onZoomOut} aria-label="Zoom out"><Minus size={17} /></button>
      <button onClick={onMyLocation} aria-label="My location"><Locate size={17} /></button>
      <button onClick={onFitRoute} aria-label="Fit route"><Maximize size={17} /></button>
      <button onClick={onToggleFollow} className={followBus ? 'active' : ''} aria-label="Follow bus">
        <Crosshair size={17} />
      </button>
    </div>
  );
}
