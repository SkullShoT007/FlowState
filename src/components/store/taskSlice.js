import { updateTaskInDB } from "../indexedDB/TaskDB";

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

            state.taskList = state.taskList.map(task => {
                if (task.id === updatedTask.id) {
                    updateTaskInDB(updatedTask); // only call DB update when task is updated
                    return updatedTask;
                }
                return task;
            });
        },
        setTasks(state, action) 
        {
        state.taskList = action.payload;
        }
           
        
        
    }
})

export const {add, remove, update, setTasks} = taskslice.actions;
export const taskReducer = taskslice.reducer;