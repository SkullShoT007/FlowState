const {createSlice} = require("@reduxjs/toolkit")


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
    }
})

export const {completeTask, notCompleteTask, GoodHabit, BadHabit} = xpSlice.actions;
export const xpReducer = xpSlice.reducer;