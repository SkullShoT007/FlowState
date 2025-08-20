import db from './indexedDB.js';

// XP Database operations
export class XpDB {
  // Save XP data to IndexedDB
  static async saveXpData(xpData) {
    try {
      const xpRecord = {
        id: 1, // We'll use a single record with ID 1 for XP data
        experience: xpData.experience,
        level: xpData.level,
        nextLevelXp: xpData.nextLevelXp,
        totalxp: xpData.totalxp,
        lastUpdated: new Date().toISOString()
      };
      
      await db.xp.put(xpRecord);
      console.log('XP data saved to IndexedDB:', xpRecord);
      return xpRecord;
    } catch (error) {
      console.error('Error saving XP data to IndexedDB:', error);
      throw error;
    }
  }

  // Load XP data from IndexedDB
  static async loadXpData() {
    try {
      const xpRecord = await db.xp.get(1);
      if (xpRecord) {
        console.log('XP data loaded from IndexedDB:', xpRecord);
        return {
          experience: xpRecord.experience || 0,
          level: xpRecord.level || 0,
          nextLevelXp: xpRecord.nextLevelXp || 100,
          totalxp: xpRecord.totalxp || 0
        };
      } else {
        // Return default XP state if no data exists
        console.log('No XP data found in IndexedDB, using defaults');
        return {
          experience: 0,
          level: 0,
          nextLevelXp: 100,
          totalxp: 0
        };
      }
    } catch (error) {
      console.error('Error loading XP data from IndexedDB:', error);
      // Return default state on error
      return {
        experience: 0,
        level: 0,
        nextLevelXp: 100,
        totalxp: 0
      };
    }
  }

  // Clear all XP data (useful for reset functionality)
  static async clearXpData() {
    try {
      await db.xp.clear();
      console.log('XP data cleared from IndexedDB');
    } catch (error) {
      console.error('Error clearing XP data from IndexedDB:', error);
      throw error;
    }
  }

  // Get XP statistics
  static async getXpStats() {
    try {
      const xpRecord = await db.xp.get(1);
      if (xpRecord) {
        return {
          currentLevel: xpRecord.level,
          totalXp: xpRecord.totalxp,
          currentLevelProgress: xpRecord.experience,
          xpToNextLevel: xpRecord.nextLevelXp - xpRecord.experience,
          lastUpdated: xpRecord.lastUpdated
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting XP stats from IndexedDB:', error);
      return null;
    }
  }

  // Export XP data (for backup purposes)
  static async exportXpData() {
    try {
      const xpRecord = await db.xp.get(1);
      return xpRecord || null;
    } catch (error) {
      console.error('Error exporting XP data:', error);
      return null;
    }
  }

  // Import XP data (for restore purposes)
  static async importXpData(xpData) {
    try {
      const xpRecord = {
        id: 1,
        experience: xpData.experience || 0,
        level: xpData.level || 0,
        nextLevelXp: xpData.nextLevelXp || 100,
        totalxp: xpData.totalxp || 0,
        lastUpdated: new Date().toISOString()
      };
      
      await db.xp.put(xpRecord);
      console.log('XP data imported successfully:', xpRecord);
      return xpRecord;
    } catch (error) {
      console.error('Error importing XP data:', error);
      throw error;
    }
  }
}

export default XpDB;
