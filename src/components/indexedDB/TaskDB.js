import db from "./indexedDB"

export async function addToDB(task) {
  try {
    await db.transaction('rw', db.tasks, async () => {
      await db.tasks.add({
        id: task.id,
        title: task.title,
        description: task.description,
        difficulty: task.difficulty,
        completed: task.completed
      });

      const allTasks = await db.tasks.toArray();
      console.log("Current tasks in DB:", allTasks);
    });
  } catch (error) {
    console.error("Failed to add task:", error);
  }
}

export async function getTasks() {
  try {
    const tasks = await db.tasks.toArray();
    console.log("All tasks:", tasks);
    return tasks;
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}

export async function deleteFromDB(id) {
  try {
    await db.tasks.delete(id);
    console.log(`Task with id ${id} deleted.`);

    const updatedTasks = await db.tasks.toArray();
    console.log("Remaining tasks:", updatedTasks);
  } catch (error) {
    console.error("Failed to delete task:", error);
  }
}

export async function updateTaskInDB(updatedTask) {
  try {
    await db.tasks.put(updatedTask); // If id exists → updates, else → adds
    console.log("Task updated in IndexedDB:", updatedTask);
  } catch (error) {
    console.error("Failed to update task:", error);
  }
}