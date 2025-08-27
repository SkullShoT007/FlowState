import { updateHabitInDB } from "../indexedDB/HabitDB";

const {createSlice} = require("@reduxjs/toolkit")

const habitSlice = createSlice({
    name: "habits",
    initialState: {
        habitList: []
    },
    reducers:{
        add(state, action)
        {
            const updatedHabitList = state.habitList.concat(action.payload)
            
            return{...state, habitList: updatedHabitList}
        },
        remove(state, action)
        {
            const habitList = state.habitList;
            const updatedHabitList = habitList.filter(habit=> habit.id !== action.payload.id)
            return {...state, habitList: updatedHabitList}
        },
        update(state, action) {
            const updatedhabit = action.payload;

            state.habitList = state.habitList.map(habit => {
                if (habit.id === updatedhabit.id) {
                    updateHabitInDB(updatedhabit); // only call DB update when habit is updated
                    return updatedhabit;
                }
                return habit;
            });
        },
        setHabits(state, action) 
        {
        state.habitList = action.payload;
        }     
    }
})

export const {add, remove, update, setHabits} = habitSlice.actions;
export const habitReducer = habitSlice.reducer;