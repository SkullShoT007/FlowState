import { XpDB } from '../indexedDB/XpDB.js';
import db from '../indexedDB/indexedDB.js';

// List of XP-related actions that should trigger persistence
const XP_ACTIONS = [
    'xp/completeTask',
    'xp/notCompleteTask', 
    'xp/GoodHabit',
    'xp/BadHabit'
];

// Middleware to automatically save XP data to IndexedDB when XP-related actions are dispatched
export const xpPersistenceMiddleware = (store) => (next) => (action) => {
    // Call the next middleware/reducer first
    const result = next(action);
    
    // Check if this action affects XP state
    if (XP_ACTIONS.includes(action.type)) {
        // Get the updated XP state
        const state = store.getState();
        const xpState = state.xpState;
        
        // Save to IndexedDB asynchronously (don't block the UI)
        XpDB.saveXpData(xpState).catch(error => {
            console.error('Failed to save XP data to IndexedDB:', error);
        });
        
        console.log('XP state saved to IndexedDB after action:', action.type);

        // Also append a snapshot to xpHistory for progression chart
        if (db && db.xpHistory) {
            const snapshot = {
                timestamp: new Date().toISOString(),
                totalxp: xpState.totalxp,
                level: xpState.level,
                experience: xpState.experience,
                nextLevelXp: xpState.nextLevelXp
            };
            db.xpHistory.add(snapshot).catch(() => {});
        }
    }
    
    return result;
};

export default xpPersistenceMiddleware;
