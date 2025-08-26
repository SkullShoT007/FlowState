import { syncDataToServer } from '../indexedDB/dataSync';

// List of actions that should trigger data sync to server
const SYNC_ACTIONS = [
    // Task actions
    'tasks/add',
    'tasks/remove', 
    'tasks/update',
    'tasks/setTasks',
    
    // Habit actions
    'habits/add',
    'habits/remove',
    'habits/update', 
    'habits/setHabits',
    
    // XP actions
    'xp/completeTask',
    'xp/notCompleteTask',
    'xp/GoodHabit',
    'xp/BadHabit',
    
    // Pomodoro actions
    'pomodoro/addSessionToDB',
    'pomodoro/clearAllSessions'
];

// Debounce function to prevent too many sync calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced sync function (waits 1 second after last change)
const debouncedSync = debounce(async () => {
    try {
        await syncDataToServer();
        console.log('Data synced to server after change');
    } catch (error) {
        console.error('Failed to sync data to server:', error);
    }
}, 1000);

// Middleware to automatically sync data to server when relevant actions are dispatched
export const dataSyncMiddleware = (store) => (next) => (action) => {
    // Call the next middleware/reducer first
    const result = next(action);
    
    // Check if this action should trigger a sync
    if (SYNC_ACTIONS.includes(action.type)) {
        console.log('Data change detected, triggering sync:', action.type);
        
        // For critical actions, sync immediately
        if (action.type === 'tasks/add' || action.type === 'habits/add' || 
            action.type === 'tasks/update' || action.type === 'habits/update') {
            syncDataToServer().catch(console.error);
        } else {
            // For other actions, use debounced sync
            debouncedSync();
        }
    }
    
    return result;
};

export default dataSyncMiddleware;
