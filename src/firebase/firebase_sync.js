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

  // Read and sanitize all tables from IndexedDB
  const tasks = (await db.tasks.toArray()).map(({ id, title, difficulty, completed }) =>
    sanitize({ id, title, difficulty, completed })
  );
  const habits = (await db.habits.toArray()).map(({ id, title, type, completed }) =>
    sanitize({ id, title, type, completed })
  );
  const pomodoroSessions = (await db.pomodoroSessions.toArray()).map(sanitize);
  const xp = (await db.xp.toArray()).map(sanitize);
  const xpHistory = (await db.xpHistory.toArray()).map(sanitize);
  const habitHistory = (await db.habitHistory.toArray()).map(({ id, timestamp, completed, type }) =>
    sanitize({ id, timestamp, completed, type })
  );
  const appMeta = (await db.appMeta.toArray()).map(sanitize);

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