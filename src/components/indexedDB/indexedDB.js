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


export default db;
