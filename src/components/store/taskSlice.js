const {createSlice} = require("@reduxjs/toolkit")

const taskslice = createSlice({
    name: "tasks",
    initialState: {
        taskList: []
    },
    reducers:{
        add(state, action)
        {
            const updatedTaskList = state.taskList.concat(action.payload)
            
            return{...state, taskList: updatedTaskList}
        },
        remove(state, action)
        {
            const TaskList = state.taskList;
            const updatedTaskList = TaskList.filter(task=> task.id !== action.payload.id)
            return {...state, taskList: updatedTaskList}
        },
        update(state, action) {
  const updatedTask = action.payload;
  console.log("Reducer received update:", updatedTask.id);
  console.log("Current state IDs:", state.taskList.map(t => t.id));
  state.taskList = state.taskList.map(task =>
    task.id === updatedTask.id ? updatedTask : task
  );
}
           
        
        
    }
})

export const {add, remove, update} = taskslice.actions;
export const taskReducer = taskslice.reducer;