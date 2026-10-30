import L from 'leaflet';

export function createBusIcon(isLive) {
  const ring = isLive
    ? '<div class="bus-marker-ring"></div>'
    : '';
  return L.divIcon({
    className: 'bus-marker-icon',
    html: `${ring}<div class="bus-marker-body">${busSvg}</div>`,
    iconSize: [36, 42],
    iconAnchor: [18, 21],
  });
}

export function createPassengerIcon() {
  return L.divIcon({
    className: 'passenger-marker-icon',
    html: '<div class="passenger-marker-dot"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

const busSvg = `<svg viewBox="0 0 36 26" width="34" height="24">
  <rect x="1" y="1" width="34" height="19" rx="4" fill="#d62828"/>
  <rect x="4" y="4" width="7" height="6" rx="1" fill="#fff"/>
  <rect x="13" y="4" width="7" height="6" rx="1" fill="#fff"/>
  <rect x="22" y="4" width="7" height="6" rx="1" fill="#fff"/>
  <rect x="4" y="13" width="28" height="4" rx="1" fill="#fff" opacity="0.8"/>
  <circle cx="10" cy="22" r="3.5" fill="#1a1a2e" stroke="#fff" stroke-width="1.2"/>
  <circle cx="26" cy="22" r="3.5" fill="#1a1a2e" stroke="#fff" stroke-width="1.2"/>
</svg>`;
