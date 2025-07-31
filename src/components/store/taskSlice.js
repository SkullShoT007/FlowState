const {createSlice} = require("@reduxjs/toolkit")

const taskSlice = createSlice({
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
        }
    }
})

export const {add, remove} = taskSlice.actions;
export const taskReducer = taskSlice.reducer;