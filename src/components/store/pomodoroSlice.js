import { PomodoroDB } from '../indexedDB/PomodoroDB.js';
const { createSlice, createAsyncThunk } = require('@reduxjs/toolkit');

// Thunks
export const loadAllPomodoroSessions = createAsyncThunk(
  'pomodoro/loadAllFromDB',
  async () => {
    const sessions = await PomodoroDB.getAllSessions();
    return sessions;
  }
);

export const addPomodoroSessionToDB = createAsyncThunk(
  'pomodoro/addSessionToDB',
  async (session) => {
    const saved = await PomodoroDB.addSession(session);
    return saved;
  }
);

export const clearAllPomodoroSessions = createAsyncThunk(
  'pomodoro/clearAll',
  async () => {
    await PomodoroDB.clearSessions();
    return [];
  }
);

const pomodoroSlice = createSlice({
  name: 'pomodoro',
  initialState: {
    sessions: []
  },
  reducers: {
    setSessions(state, action) {
      return { ...state, sessions: action.payload || [] };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAllPomodoroSessions.fulfilled, (state, action) => {
        return { ...state, sessions: action.payload || [] };
      })
      .addCase(addPomodoroSessionToDB.fulfilled, (state, action) => {
        return { ...state, sessions: [...state.sessions, action.payload] };
      })
      .addCase(clearAllPomodoroSessions.fulfilled, (state) => {
        return { ...state, sessions: [] };
      });
  }
});

export const { setSessions } = pomodoroSlice.actions;
export const pomodoroReducer = pomodoroSlice.reducer;

