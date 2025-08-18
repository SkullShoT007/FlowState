import db from "./indexedDB"

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

      const allHabits = await db.habits.toArray();
      console.log("Current habits in DB:", allHabits);
    });
  } catch (error) {
    console.error("Failed to add habit:", error);
  }
}

export async function getHabits() {
  try {
    const habits = await db.habits.toArray();
    console.log("All habits:", habits);
    return habits;
  } catch (error) {
    console.error("Failed to fetch habits:", error);
    return [];
  }
}

export async function deleteFromDB(id) {
  try {
    await db.habits.delete(id);
    console.log(`Habit with id ${id} deleted.`);

    const updatedHabits = await db.habits.toArray();
    console.log("Remaining habits:", updatedHabits);
  } catch (error) {
    console.error("Failed to delete habit:", error);
  }
}

export async function updateHabitInDB(updatedHabit) {
  try {
    await db.habits.put(updatedHabit); // If id exists → updates, else → adds
    console.log("Habit updated in IndexedDB:", updatedHabit);
  } catch (error) {
    console.error("Failed to update habit:", error);
  }
}
