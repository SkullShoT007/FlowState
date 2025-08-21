import db from './indexedDB.js';

// Pomodoro Sessions Database operations
export class PomodoroDB {
  // Add a pomodoro session record
  static async addSession(session) {
    try {
      const now = new Date();
      const startTime = session.startTime ? new Date(session.startTime) : now;
      const endTime = session.endTime ? new Date(session.endTime) : now;
      const dateKey = (session.date) || endTime.toISOString().slice(0, 10);

      const record = {
        // auto-increment id via Dexie schema
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        mode: session.mode, // 'focus' | 'short' | 'long'
        durationMs: Number(session.durationMs) || 0,
        wasSkipped: Boolean(session.wasSkipped),
        cycle: Number(session.cycle) || 0,
        date: dateKey,
        settings: session.settings ? { ...session.settings } : undefined
      };

      const id = await db.pomodoroSessions.add(record);
      return { id, ...record };
    } catch (error) {
      console.error('Error adding Pomodoro session to IndexedDB:', error);
      throw error;
    }
  }

  static async getAllSessions() {
    try {
      return await db.pomodoroSessions.orderBy('startTime').toArray();
    } catch (error) {
      console.error('Error fetching Pomodoro sessions:', error);
      return [];
    }
  }

  static async getSessionsByDate(dateKey) {
    try {
      return await db.pomodoroSessions.where('date').equals(dateKey).toArray();
    } catch (error) {
      console.error('Error fetching Pomodoro sessions by date:', error);
      return [];
    }
  }

  static async clearSessions() {
    try {
      await db.pomodoroSessions.clear();
    } catch (error) {
      console.error('Error clearing Pomodoro sessions:', error);
      throw error;
    }
  }
}

export default PomodoroDB;

