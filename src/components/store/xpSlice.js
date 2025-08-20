import { XpDB } from '../indexedDB/XpDB.js';
const {createSlice, createAsyncThunk} = require("@reduxjs/toolkit")


// Async thunks for IndexedDB operations
export const loadXpFromDB = createAsyncThunk(
    'xp/loadFromDB',
    async () => {
        const xpData = await XpDB.loadXpData();
        return xpData;
    }
);

export const saveXpToDB = createAsyncThunk(
    'xp/saveToDB',
    async (xpData) => {
        await XpDB.saveXpData(xpData);
        return xpData;
    }
);

export const clearXpFromDB = createAsyncThunk(
    'xp/clearFromDB',
    async () => {
        await XpDB.clearXpData();
        return {
            experience: 0,
            level: 0,
            nextLevelXp: 100,
            totalxp: 0
        };
    }
);

const xpSlice = createSlice({
    name: "xp",
    initialState: {
        experience: 0,
        level: 0,
        nextLevelXp: 100,
        totalxp:0
    },
    reducers:{
        completeTask(state, action)
        {
            const updatedXp = (state.experience + Number(action.payload.difficulty))%state.nextLevelXp;
            
            if((state.experience + Number(action.payload.difficulty)) >= state.nextLevelXp)
            {
                return {...state,level: state.level+1, nextLevelXp: state.nextLevelXp*2, experience: updatedXp, totalxp: state.totalxp + Number(action.payload.difficulty)}  
            }
            else
            {
                return {...state, experience: updatedXp, totalxp: state.totalxp + Number(action.payload.difficulty)}
            }
            
        },
        notCompleteTask(state, action) 
        {
        const lostXp = Number(action.payload.difficulty);
        let newExperience = state.experience - lostXp;
        let newLevel = state.level;
        let newNextLevelXp = state.nextLevelXp;

    // Handle level-down if XP goes below 0
        while (newExperience < 0 && newLevel > 1) 
        {
            newLevel -= 1;
            newNextLevelXp /= 2;
             newExperience += newNextLevelXp; // carry over XP from the previous level
        }

    // Clamp experience to 0 if you can't level down
        if (newExperience < 0) newExperience = 0;

        return {
        ...state,
        experience: newExperience,
        totalxp: Math.max(state.totalxp - lostXp, 0),
        level: newLevel,
        nextLevelXp: newNextLevelXp
             };
        },

        GoodHabit(state, action) 
        {
            const xp = Number(action.payload.xp);
            let totalXp = state.experience + xp;
            
            if (totalXp >= state.nextLevelXp) {
                let remainingXp = totalXp % state.nextLevelXp;
                if(remainingXp < 0) remainingXp = 0
                return {
                    ...state,
                    level: state.level + 1,
                    nextLevelXp: state.nextLevelXp * 2,
                    experience: remainingXp,
                    totalxp: state.totalxp + xp
                };
            }
            if(totalXp < 0) totalXp = 0

            return {
                ...state,
                experience: totalXp,
                totalxp: state.totalxp + xp
            };
        },
        BadHabit(state, action) 
        {
            const xp = Number(action.payload.xp);
            let newExperience = state.experience - xp;

            if (newExperience < 0) newExperience = 0;

            return {
                ...state,
                experience: newExperience
            };
        },
        
        // Synchronous action to set XP state directly (for loading from DB)
        setXpState(state, action) {
            return {
                ...state,
                ...action.payload
            };
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle loadXpFromDB
            .addCase(loadXpFromDB.fulfilled, (state, action) => {
                return {
                    ...state,
                    ...action.payload
                };
            })
            .addCase(loadXpFromDB.rejected, (state, action) => {
                console.error('Failed to load XP data from IndexedDB:', action.error);
                // Keep current state on error
            })
            // Handle clearXpFromDB
            .addCase(clearXpFromDB.fulfilled, (state, action) => {
                return {
                    ...state,
                    ...action.payload
                };
            })
            .addCase(clearXpFromDB.rejected, (state, action) => {
                console.error('Failed to clear XP data from IndexedDB:', action.error);
            });
    }
})

export const {completeTask, notCompleteTask, GoodHabit, BadHabit, setXpState} = xpSlice.actions;
export const xpReducer = xpSlice.reducer;
