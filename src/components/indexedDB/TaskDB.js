import db from "./indexedDB"
import { syncIndexedDBToFirebase } from "../../firebase/firebase_sync";
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

      await db.tasks.toArray();
      syncIndexedDBToFirebase()
    });
  } catch (error) {
    console.error("Failed to add task:", error);
  }
}

export async function getTasks() {
  try {
    const tasks = await db.tasks.toArray();
    return tasks;
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}

export async function deleteFromDB(id) {
  try {
    await db.tasks.delete(id);
    

    await db.tasks.toArray();
    syncIndexedDBToFirebase()
  } catch (error) {
    console.error("Failed to delete task:", error);
  }
}

export async function updateTaskInDB(updatedTask) {
  try {
    await db.tasks.put(updatedTask); // If id exists → updates, else → adds
    syncIndexedDBToFirebase()
  } catch (error) {
    console.error("Failed to update task:", error);
  }
}