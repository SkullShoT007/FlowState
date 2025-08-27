import db from './indexedDB';
// import { getTasks } from './TaskDB';
// import { getHabits } from './HabitDB';
import { XpDB } from './XpDB';
import { PomodoroDB } from './PomodoroDB';

// Function to export all IndexedDB data
export async function exportAllData() {
  try {
    const data = {};
    
    // Get tasks directly from IndexedDB
    data.tasks = await db.tasks.toArray();
    
    // Get habits directly from IndexedDB
    data.habits = await db.habits.toArray();
    
    // Get XP data
    const xpData = await XpDB.loadXpData();
    data.xp = [xpData];
    
    // Get Pomodoro sessions
    data.pomodoroSessions = await PomodoroDB.getAllSessions();
    
    // Get habit history
    data.habitHistory = await db.habitHistory.toArray();
    
    // Get XP history
    data.xpHistory = await db.xpHistory.toArray();
    
    // Get app metadata
    data.appMeta = await db.appMeta.toArray();
    
    return data;
  } catch (error) {
    console.error('Error exporting IndexedDB data:', error);
    throw error;
  }
}

// Function to sync data to server
export async function syncDataToServer(serverUrl = 'http://localhost:8000') {
  try {
    const data = await exportAllData();
    
    const response = await fetch(`${serverUrl}/sync-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error syncing data to server:', error);
    throw error;
  }
}

// Function to get current synced data from server
export async function getSyncedData(serverUrl = 'http://localhost:8000') {
  try {
    const response = await fetch(`${serverUrl}/data`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error getting synced data from server:', error);
    throw error;
  }
}

// Auto-sync function that can be called periodically
export async function autoSyncData(serverUrl = 'http://localhost:8000') {
  try {
    await syncDataToServer(serverUrl);
  } catch (error) {
    console.error('Auto-sync failed:', error);
  }
}

// Set up periodic syncing (every 30 seconds)
export function startAutoSync(serverUrl = 'http://localhost:8000', intervalMs = 30000) {
  const intervalId = setInterval(() => {
    autoSyncData(serverUrl);
  }, intervalMs);
  
  // Return function to stop auto-sync
  return () => {
    clearInterval(intervalId);
  };
}
