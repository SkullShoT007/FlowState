const {createSlice} = require("@reduxjs/toolkit")


const xpSlice = createSlice({
    name: "xp",
    initialState: {
        experience: 10,
        level: 0,
    },
    reducers:{
        completeTask(state, action)
        {
            const updatedXp = state.experience + Number(action.payload.difficulty);
            return {...state, experience: updatedXp}
        },
        notCompleteTask(state, action)
        {
            const updatedXp = state.experience - action.payload.difficulty;
            return {...state, experience: updatedXp}
        }
    }
})

export const {completeTask, notCompleteTask} = xpSlice.actions;
export const xpReducer = xpSlice.reducer;