const now = Date.now();
const HOUR = 3600000;
const DAY = 86400000;

export const demoItems = [
  { id: 'demo-1', itemName: 'Black Wallet', type: 'Lost', busId: 'BUS012', routeId: 'R9', description: 'Black leather wallet with cards inside.', contact: '0321-1234567', createdAt: now - 2 * HOUR },
  { id: 'demo-2', itemName: 'Blue Umbrella', type: 'Found', busId: 'BUS007', routeId: 'R4', description: 'Compact blue umbrella left on a seat.', contact: 'user@example.com', createdAt: now - 5 * HOUR },
  { id: 'demo-3', itemName: 'Student ID Card', type: 'Lost', busId: 'BUS003', routeId: 'R2', description: 'ID card found near the rear entrance.', contact: '0333-9876543', createdAt: now - DAY },
  { id: 'demo-4', itemName: 'Water Bottle', type: 'Found', busId: 'BUS012', routeId: 'R9', description: 'Green reusable bottle with a silver cap.', contact: '0312-5551234', createdAt: now - 2 * DAY },
];
