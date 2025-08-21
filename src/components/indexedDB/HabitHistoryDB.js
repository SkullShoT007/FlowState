import db from './indexedDB';

export class HabitHistoryDB {
  static async recordCompletion({ habitId, date, status }) {
    try {
      const dateKey = date || new Date().toISOString().slice(0, 10);
      const rec = { habitId, date: dateKey, status: status ?? true };
      await db.habitHistory.add(rec);
      return rec;
    } catch (e) {
      console.error('Failed to add habit history', e);
      throw e;
    }
  }

  static async getHistoryByDate(dateKey) {
    try {
      return await db.habitHistory.where('date').equals(dateKey).toArray();
    } catch (e) {
      console.error('Failed to load habit history by date', e);
      return [];
    }
  }

  static async getAllHistory() {
    try {
      return await db.habitHistory.orderBy('date').toArray();
    } catch (e) {
      console.error('Failed to load habit history', e);
      return [];
    }
  }
}

export default HabitHistoryDB;

