import { configureStore } from "@reduxjs/toolkit";
import { taskReducer } from "./taskSlice";
import { habitReducer } from "./habitSlice";
import { xpReducer } from "./xpSlice";
import { xpPersistenceMiddleware } from "./xpPersistenceMiddleware";

export const store = configureStore({
    reducer: {
        taskState: taskReducer,
        habitState: habitReducer,
        xpState: xpReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types in serializability check
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }).concat(xpPersistenceMiddleware)
})
