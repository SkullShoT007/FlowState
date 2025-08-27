import Dexie from 'dexie';

var db = new Dexie("flowStateDB");

// Version 1 - Original schema
db.version(1).stores({
  tasks: "id, title, description, difficulty, completed",
  habits: "id, title, description, type, completed",
});

// Version 2 - Added XP table
db.version(2).stores({
  tasks: "id, title, description, difficulty, completed",
  habits: "id, title, description, type, completed",
  xp: "id, experience, level, nextLevelXp, totalxp, lastUpdated",
});

// Version 3 - Added Pomodoro sessions table
db.version(3).stores({
  tasks: "id, title, description, difficulty, completed",
  habits: "id, title, description, type, completed",
  xp: "id, experience, level, nextLevelXp, totalxp, lastUpdated",
  pomodoroSessions: "++id, startTime, endTime, mode, durationMs, wasSkipped, cycle, date"
});

// Version 4 - Added XP history table
db.version(4).stores({
  tasks: "id, title, description, difficulty, completed",
  habits: "id, title, description, type, completed",
  xp: "id, experience, level, nextLevelXp, totalxp, lastUpdated",
  pomodoroSessions: "++id, startTime, endTime, mode, durationMs, wasSkipped, cycle, date",
  xpHistory: "++id, timestamp, totalxp, level, experience, nextLevelXp"
});

// Version 5 - Added Habit history table and app meta
db.version(5).stores({
  tasks: "id, title, description, difficulty, completed",
  habits: "id, title, description, type, completed",
  xp: "id, experience, level, nextLevelXp, totalxp, lastUpdated",
  pomodoroSessions: "++id, startTime, endTime, mode, durationMs, wasSkipped, cycle, date",
  xpHistory: "++id, timestamp, totalxp, level, experience, nextLevelXp",
  habitHistory: "++id, habitId, date, status",
  appMeta: "key"
});

// eslint-disable-next-line no-unused-vars
async function exportIndexedDBData(dbName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(db.objectStoreNames, "readonly");

      const exportData = {};
      let storesToProcess = db.objectStoreNames.length;

      for (const storeName of db.objectStoreNames) {
        const store = transaction.objectStore(storeName);
        const getAllReq = store.getAll();

        // eslint-disable-next-line no-loop-func
        getAllReq.onsuccess = () => {
          exportData[storeName] = getAllReq.result;

          storesToProcess -= 1;
          if (storesToProcess === 0) {
            const jsonData = JSON.stringify(exportData, null, 2);
            // Download JSON file
            const blob = new Blob([jsonData], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${dbName}-export.json`;
            a.click();
            URL.revokeObjectURL(url);

            resolve();
          }
        };

        getAllReq.onerror = () => reject(getAllReq.error);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

// Example usage:



export default db;
