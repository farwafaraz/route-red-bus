// Central place that reads every VITE_* environment variable.
const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

// Values still containing the YOUR_ placeholder (or empty) count as "not configured".
const REQUIRED = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'appId'];
const isPlaceholder = (value) => !value || /your_|your-|<.*>/i.test(String(value));

export const missingFirebaseKeys = REQUIRED.filter((key) => isPlaceholder(firebaseConfig[key]));
export const isFirebaseConfigured = missingFirebaseKeys.length === 0;

const num = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const settings = {
  demoModePreference: (env.VITE_DEMO_MODE || 'auto').toLowerCase(), // auto | on | off
  averageBusSpeedKmh: num(env.VITE_AVERAGE_BUS_SPEED_KMH, 20),
  minUsableGpsSpeedKmh: num(env.VITE_MIN_USABLE_GPS_SPEED_KMH, 5),
  roadDistanceMultiplier: num(env.VITE_ROAD_DISTANCE_MULTIPLIER, 1.35),
  staleAfterSeconds: num(env.VITE_STALE_AFTER_SECONDS, 60),
  gpsWriteIntervalSeconds: num(env.VITE_GPS_WRITE_INTERVAL_SECONDS, 3),
};

export function shouldStartInDemoMode() {
  if (settings.demoModePreference === 'on') return true;
  if (settings.demoModePreference === 'off') return false;
  return !isFirebaseConfigured;
}
