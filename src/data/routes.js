export const routes = [
  {
    id: 'R9',
    name: 'Karachi Route',
    busId: 'BUS001',
    departure: '07:30 AM',
    departureMinutes: 450,
    start: 'Saddar',
    destination: 'North Karachi',
    stops: [
      { name: 'Saddar', lat: 24.8547, lng: 67.0099 },
      { name: 'Clifton', lat: 24.8138, lng: 67.0308 },
      { name: 'Korangi', lat: 24.8142, lng: 67.1247 },
      { name: 'Gulshan-e-Iqbal', lat: 24.9162, lng: 67.0971 },
      { name: 'North Karachi', lat: 24.9924, lng: 67.0647 },
    ],
  },
  {
    id: 'R4',
    name: 'North Karachi Route',
    busId: 'BUS007',
    departure: '07:45 AM',
    departureMinutes: 465,
    start: 'Clifton',
    destination: 'North Karachi',
    stops: [
      { name: 'Clifton', lat: 24.8138, lng: 67.0308 },
      { name: 'Saddar', lat: 24.8547, lng: 67.0099 },
      { name: 'Gulshan-e-Iqbal', lat: 24.9162, lng: 67.0971 },
      { name: 'North Karachi', lat: 24.9924, lng: 67.0647 },
    ],
  },
  {
    id: 'R2',
    name: 'Clifton Route',
    busId: 'BUS003',
    departure: '08:15 AM',
    departureMinutes: 495,
    start: 'Gulshan-e-Iqbal',
    destination: 'Clifton',
    stops: [
      { name: 'Gulshan-e-Iqbal', lat: 24.9162, lng: 67.0971 },
      { name: 'Saddar', lat: 24.8547, lng: 67.0099 },
      { name: 'Clifton', lat: 24.8138, lng: 67.0308 },
    ],
  },
];

export function getRoute(routeId) {
  return routes.find((route) => route.id === routeId);
}

export function getRouteByBusId(busId) {
  return routes.find((route) => route.busId === busId);
}

export const allStops = routes
  .flatMap((route) => route.stops.map((stop) => stop.name))
  .filter((stop, index, all) => all.indexOf(stop) === index);

export const knownBusIds = [...new Set(routes.map((route) => route.busId))];
