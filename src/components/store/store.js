import { configureStore } from "@reduxjs/toolkit";
import { taskReducer } from "./taskSlice";
import { habitReducer } from "./habitSlice";
import { xpReducer } from "./xpSlice";
export const store = configureStore({
    reducer :{
        taskState: taskReducer,
        habitState: habitReducer,
        xpState: xpReducer
    }
})