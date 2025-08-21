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

export default db;
