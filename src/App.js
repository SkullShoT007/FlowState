import './App.css';

import { Sidebar } from './components/Sidebar';
import { AllRoutes } from './components/routes/AllRoutes';
import { useEffect } from 'react';
import db from './components/indexedDB/indexedDB';
import { useDispatch, useSelector } from 'react-redux';
import { setHabits } from './components/store/habitSlice';
import { getHabits } from './components/indexedDB/HabitDB';
function App() {
  const dispatch = useDispatch();
  const habits = useSelector(state => state.habitState.habitList);

  useEffect(() => {
    async function runDailyReset() {
      try {
        const meta = await db.appMeta.get('lastHabitReset');
        const lastResetISO = meta?.value;
        const todayKey = new Date().toISOString().slice(0,10);
        if (lastResetISO && lastResetISO.slice(0,10) === todayKey) {
          return; // already reset today
        }
        // If habits not loaded yet, load them first
        let currentHabits = habits;
        if (!currentHabits || currentHabits.length === 0) {
          currentHabits = await getHabits();
          dispatch(setHabits(currentHabits));
        }
        // Reset completion status for all habits
        await db.transaction('rw', db.habits, async () => {
          for (const h of currentHabits) {
            await db.habits.put({ ...h, completed: false });
          }
        });
        // Update redux after reset
        dispatch(setHabits(currentHabits.map(h => ({ ...h, completed: false }))));
        // Update meta
        await db.appMeta.put({ key: 'lastHabitReset', value: new Date().toISOString() });
      } catch (e) {
        console.error('Daily habit reset failed', e);
      }
    }
    runDailyReset();
  }, []);

  return (
    <div className="App flex bg-lightGray">
      <Sidebar  />
        <AllRoutes />
    </div>
  );
}

export default App;
