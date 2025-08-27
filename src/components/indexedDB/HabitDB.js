import db from "./indexedDB"
import { syncIndexedDBToFirebase } from "../../firebase/firebase_sync";
export async function addToDB(habit) {
  try {
    await db.transaction('rw', db.habits, async () => {
      await db.habits.add({
        id: habit.id,
        title: habit.title,
        description: habit.description,
        type: habit.type,
        completed: habit.completed
      });

      await db.habits.toArray();
      syncIndexedDBToFirebase()
    });
  } catch (error) {
    console.error("Failed to add habit:", error);
  }
}

export async function getHabits() {
  try {
    const habits = await db.habits.toArray();
    return habits;
  } catch (error) {
    console.error("Failed to fetch habits:", error);
    return [];
  }
}

export async function deleteFromDB(id) {
  try {
    await db.habits.delete(id);
    

    await db.habits.toArray();
    syncIndexedDBToFirebase()
  } catch (error) {
    console.error("Failed to delete habit:", error);
  }
}

export async function updateHabitInDB(updatedHabit) {
  try {
    await db.habits.put(updatedHabit); // If id exists → updates, else → adds
    
    syncIndexedDBToFirebase()
  } catch (error) {
    console.error("Failed to update habit:", error);
  }
}
