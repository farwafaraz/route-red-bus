import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase, onValue, push, ref, set } from 'firebase/database';
import { firebaseConfig, isFirebaseConfigured, missingFirebaseKeys } from '@/config';

const app = isFirebaseConfigured ? (getApps()[0] ?? initializeApp(firebaseConfig)) : null;
const auth = app ? getAuth(app) : null;
const database = app ? getDatabase(app) : null;

export const firebaseReady = Boolean(database);
export { missingFirebaseKeys };

// Anonymous Authentication (free). Database rules require auth != null.
let authPromise = null;
export function waitForAuth() {
  if (!auth) return Promise.resolve(null);
  if (!authPromise) {
    authPromise = (auth.currentUser ? Promise.resolve(auth.currentUser) : signInAnonymously(auth).then((cred) => cred.user)).catch((error) => {
      authPromise = null; // allow retry
      throw error;
    });
  }
  return authPromise;
}

export function describeFirebaseError(error) {
  const code = error?.code ?? '';
  if (code.includes('admin-restricted-operation') || code.includes('operation-not-allowed')) return 'Anonymous sign-in is disabled. Enable it in Firebase Console > Authentication > Sign-in method.';
  if (code.includes('PERMISSION_DENIED') || code.includes('permission-denied') || /permission_denied/i.test(error?.message ?? '')) return 'Firebase denied access. Check the database rules and that Anonymous sign-in is enabled.';
  if (code.includes('network')) return 'Network problem while contacting Firebase.';
  return error?.message ?? 'Unknown Firebase error.';
}

// Subscribe after auth is ready. Returns an unsubscribe function immediately.
function listen(path, onData, onError) {
  if (!database) return () => undefined;
  let cancelled = false;
  let detach = () => undefined;
  waitForAuth()
    .then(() => {
      if (cancelled) return;
      detach = onValue(ref(database, path), (snapshot) => onData(snapshot.val()), (error) => onError?.(error));
    })
    .catch((error) => onError?.(error));
  return () => { cancelled = true; detach(); };
}

export async function publishBusLocation(location) {
  if (!database) return false;
  await waitForAuth();
  await set(ref(database, `buses/${location.busId}`), location);
  return true;
}

export async function publishLostFoundReport(report) {
  if (!database) return false;
  await waitForAuth();
  await set(push(ref(database, 'lostFound')), report);
  return true;
}

export function subscribeToLostFound(onReports, onError) {
  return listen('lostFound', (value) => onReports(value ?? {}), onError);
}

export function subscribeToBus(busId, onLocation, onError) {
  return listen(`buses/${busId}`, (value) => { if (value) onLocation(value); }, onError);
}

export function subscribeToAllBuses(onBuses, onError) {
  return listen('buses', (value) => onBuses(value ?? {}), onError);
}
