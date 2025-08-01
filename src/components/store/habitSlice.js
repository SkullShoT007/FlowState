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
  console.log("Reducer received update:", updatedhabit.id);
  console.log("Current state IDs:", state.habitList.map(t => t.id));
  state.habitList = state.habitList.map(habit =>
    habit.id === updatedhabit.id ? updatedhabit : habit
  );
}
           
        
        
    }
})

export const {add, remove, update} = habitSlice.actions;
export const habitReducer = habitSlice.reducer;