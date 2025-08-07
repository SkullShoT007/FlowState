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

      const allhabits = await db.habits.toArray();
      console.log("Current habits in DB:", allhabits);
    });
  } catch (error) {
    console.error("Failed to add habit:", error);
  }
}

export async function gethabits() {
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
    console.log(`habit with id ${id} deleted.`);

    const updatedhabits = await db.habits.toArray();
    console.log("Remaining habits:", updatedhabits);
  } catch (error) {
    console.error("Failed to delete habit:", error);
  }
}

export async function updatehabitInDB(updatedhabit) {
  try {
    await db.habits.put(updatedhabit); // If id exists → updates, else → adds
    console.log("habit updated in IndexedDB:", updatedhabit);
  } catch (error) {
    console.error("Failed to update habit:", error);
  }
}