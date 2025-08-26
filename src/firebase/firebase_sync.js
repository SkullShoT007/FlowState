import db from '../components/indexedDB/indexedDB';
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { auth } from "../firebase/config";

// Helper to sanitize objects
function sanitize(obj) {
  const clean = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  }
  return clean;
}

export async function syncIndexedDBToFirebase() {
  if (!auth.currentUser) return;

  const firestore = getFirestore();
  const uid = auth.currentUser.uid;

  // Helper: safely read from a store, return empty array if store doesn't exist
  const safeReadStore = async (storeName, mapper = (item) => item) => {
    try {
      const data = await db.table(storeName).toArray();
      return data.map(mapper);
    } catch (error) {
      console.warn(`Store ${storeName} not found or error reading:`, error);
      return [];
    }
  };

  // Read and sanitize all tables from IndexedDB (with error handling)
  const tasks = await safeReadStore('tasks', ({ id, title, difficulty, completed }) =>
    sanitize({ id, title, difficulty, completed })
  );

  const habits = await safeReadStore('habits', ({ id, title, type, completed }) =>
    sanitize({ id, title, type, completed })
  );

  const pomodoroSessions = await safeReadStore('pomodoroSessions', sanitize);

  const xp = await safeReadStore('xp', sanitize);

  const xpHistory = await safeReadStore('xpHistory', sanitize);

  // Correct field mapping to match HabitHistory schema (id, habitId, date, status)
  const habitHistory = await safeReadStore('habitHistory', ({ id, habitId, date, status }) =>
    sanitize({ id, habitId, date, status })
  );

  const appMeta = await safeReadStore('appMeta', sanitize);

  // Save to Firestore under user's document
  console.log(uid)
  await setDoc(doc(firestore, "users", uid), {
    uid: uid,
    tasks,
    habits,
    pomodoroSessions,
    xp,
    xpHistory,
    habitHistory,
    appMeta,
    lastSync: new Date().toISOString()
  });
}