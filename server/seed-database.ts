import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { z } from "zod";
import "dotenv/config";
import fs from "fs";

const client = new MongoClient(process.env.MONGODB_ATLAS_URI as string);

// ✅ Ensure apiKey is always a string
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY ?? "",
});

// ---------------- Schemas ----------------
const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  difficulty: z.string(),
  completed: z.boolean(),
});

const habitSchema = z.object({
  id: z.number(),
  title: z.string(),
  type: z.string(),
  completed: z.boolean(),
});

const xpSchema = z.object({
  id: z.number(),
  experience: z.number(),
  level: z.number(),
  nextLevelXp: z.number(),
  totalxp: z.number(),
  lastUpdated: z.string(),
});

const pomodoroSessionSchema = z.object({
  id: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  type: z.string(), // ✅ matches JSON
  duration: z.number(),
  completed: z.boolean(),
  skipped: z.boolean(),
  cycleNumber: z.number(),
  date: z.string(),
});

const xpHistorySchema = z.object({
  id: z.number(),
  timestamp: z.string(),
  totalxp: z.number(),
  level: z.number(),
  experience: z.number(),
  nextLevelXp: z.number(),
});

const habitHistorySchema = z.object({
  id: z.number(),
  habitId: z.number(),
  date: z.string(),
  status: z.boolean(),
});

const appMetaSchema = z.object({
  key: z.string(),
  value: z.any().optional(),
});

const dataSchema = z.object({
  appMeta: z.array(appMetaSchema).optional(),
  habitHistory: z.array(habitHistorySchema).optional(),
  habits: z.array(habitSchema).optional(),
  pomodoroSessions: z.array(pomodoroSessionSchema).optional(),
  tasks: z.array(taskSchema).optional(),
  xp: z.array(xpSchema).optional(),
  xpHistory: z.array(xpHistorySchema).optional(),
});

type Data = z.infer<typeof dataSchema>;

// ---------------- Database setup ----------------
async function setupDatabaseAndCollections(): Promise<void> {
  console.log("Setting up database and collections...");
  const db = client.db("flowstate_database");
  
  // Define collection names
  const collectionNames = [
    "tasks",
    "habits", 
    "pomodoroSessions",
    "xp",
    "xpHistory",
    "habitHistory",
    "appMeta"
  ];

  // Create collections if they don't exist
  for (const collectionName of collectionNames) {
    const collections = await db.listCollections({ name: collectionName }).toArray();
    
    if (collections.length === 0) {
      await db.createCollection(collectionName);
      console.log(`✅ Created collection '${collectionName}'`);
    } else {
      console.log(`ℹ️ Collection '${collectionName}' already exists`);
    }
  }
}

async function createVectorSearchIndexes(): Promise<void> {
  try {
    const db = client.db("flowstate_database");
    
    // Create vector indexes for collections that need semantic search
    const collectionsWithVectorIndex = ["tasks", "habits", "pomodoroSessions"];
    
    for (const collectionName of collectionsWithVectorIndex) {
      const collection = db.collection(collectionName);
      
      // Drop old indexes
      await collection.dropIndexes();

      // Create vector search index
      const vectorSearchIdx = {
        name: "vector_index",
        type: "vectorSearch",
        definition: {
          "fields": [
            {
              "type": "vector",
              "path": "embedding",
              "numDimensions": 768,
              "similarity": "cosine"
            }
          ]
        }
      };

      console.log(`✅ Vector search index created for ${collectionName}`);
    }
  } catch (error) {
    console.error("❌ Error creating vector search indexes:", error);
  }
}

// ---------------- Summary builders ----------------
async function createTaskSummary(tasks: any[]): Promise<string> {
  if (!tasks || tasks.length === 0) {
    return "No tasks available.";
  }
  
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  
  return `You have ${tasks.length} tasks total. ${completedTasks} completed, ${pendingTasks} pending. Example: "${tasks[0].title}" with difficulty ${tasks[0].difficulty}.`;
}

async function createHabitSummary(habits: any[]): Promise<string> {
  if (!habits || habits.length === 0) {
    return "No habits defined.";
  }
  
  const goodHabits = habits.filter(habit => habit.type === "good").length;
  const badHabits = habits.filter(habit => habit.type === "bad").length;
  
  return `You are tracking ${habits.length} habits (${goodHabits} good, ${badHabits} bad). Example: "${habits[0].title}" (${habits[0].type}).`;
}

async function createPomodoroSummary(sessions: any[]): Promise<string> {
  if (!sessions || sessions.length === 0) {
    return "No pomodoro sessions recorded.";
  }
  
  const completedSessions = sessions.filter(session => session.completed).length;
  const skippedSessions = sessions.filter(session => session.skipped).length;
  
  return `You have logged ${sessions.length} pomodoro sessions. ${completedSessions} completed, ${skippedSessions} skipped. Last session type: ${sessions[sessions.length - 1]?.type ?? "unknown"}.`;
}

async function createXpSummary(xpData: any[]): Promise<string> {
  if (!xpData || xpData.length === 0) {
    return "XP data not found.";
  }
  
  const currentXp = xpData[0];
  return `Current XP: ${currentXp.totalxp}, Level: ${currentXp.level}, Next level at ${currentXp.nextLevelXp} XP.`;
}

// ---------------- Seeder ----------------
async function seedDatabase(): Promise<void> {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB");

    await setupDatabaseAndCollections();
    await createVectorSearchIndexes();

    const db = client.db("flowstate_database");
    
    // Clear all collections
    const collectionNames = ["tasks", "habits", "pomodoroSessions", "xp", "xpHistory", "habitHistory", "appMeta"];
    for (const collectionName of collectionNames) {
      await db.collection(collectionName).deleteMany({});
      console.log(`🗑️ Cleared existing documents in ${collectionName}`);
    }

    const jsonData = fs.readFileSync("./data/flowStateDB-export.json", "utf-8");
    const parsed: Data = JSON.parse(jsonData);
    const data: Data = parsed;

    // Insert data into respective collections
    if (data.tasks && data.tasks.length > 0) {
      const tasksCollection = db.collection("tasks");
      // Insert tasks with embeddings
      for (const task of data.tasks) {
        const taskDocument = {
          pageContent: `Task: ${task.title} (Difficulty: ${task.difficulty}, Completed: ${task.completed})`,
          embedding_text: `Task: ${task.title} with difficulty ${task.difficulty}. Status: ${task.completed ? 'completed' : 'pending'}.`,
          metadata: { type: 'task', ...task }
        };
        
        await MongoDBAtlasVectorSearch.fromDocuments(
          [taskDocument],
          new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY ?? "",
            modelName: "text-embedding-004",
          }),
          {
            collection: tasksCollection,
            indexName: "vector_index",
            textKey: "embedding_text",
            embeddingKey: "embedding",
          }
        );
      }
      console.log(`✅ Inserted ${data.tasks.length} tasks`);
    }

    if (data.habits && data.habits.length > 0) {
      const habitsCollection = db.collection("habits");
      
      // Insert habits with embeddings
      for (const habit of data.habits) {
        const habitDocument = {
          pageContent: `Habit: ${habit.title} (Type: ${habit.type}, Completed: ${habit.completed})`,
          embedding_text: `Habit: ${habit.title} of type ${habit.type}. Status: ${habit.completed ? 'completed' : 'pending'}.`,
          metadata: { type: 'habit', id: habit.id, title: habit.title, habitType: habit.type, completed: habit.completed }
        };
        
        await MongoDBAtlasVectorSearch.fromDocuments(
          [habitDocument],
          new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY ?? "",
            modelName: "text-embedding-004",
          }),
          {
            collection: habitsCollection,
            indexName: "vector_index",
            textKey: "embedding_text",
            embeddingKey: "embedding",
          }
        );
      }
      console.log(`✅ Inserted ${data.habits.length} habits`);
    }

    if (data.pomodoroSessions && data.pomodoroSessions.length > 0) {
      const pomodoroCollection = db.collection("pomodoroSessions");
      
      // Insert pomodoro sessions with embeddings
      for (const session of data.pomodoroSessions) {
        const sessionDocument = {
          pageContent: `Pomodoro Session: ${session.type} (Duration: ${session.duration}ms, Completed: ${session.completed})`,
          embedding_text: `Pomodoro session of type ${session.type} with duration ${session.duration}ms. Status: ${session.completed ? 'completed' : 'skipped'}.`,
          metadata: { 
            type: 'pomodoro', 
            id: session.id, 
            sessionType: session.type, 
            duration: session.duration, 
            completed: session.completed, 
            skipped: session.skipped, 
            cycleNumber: session.cycleNumber, 
            date: session.date 
          }
        };
        
        await MongoDBAtlasVectorSearch.fromDocuments(
          [sessionDocument],
          new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY ?? "",
            modelName: "text-embedding-004",
          }),
          {
            collection: pomodoroCollection,
            indexName: "vector_index",
            textKey: "embedding_text",
            embeddingKey: "embedding",
          }
        );
      }
      console.log(`✅ Inserted ${data.pomodoroSessions.length} pomodoro sessions`);
    }

    // Insert data without embeddings (no vector search needed)
    if (data.xp && data.xp.length > 0) {
      await db.collection("xp").insertMany(data.xp);
      console.log(`✅ Inserted ${data.xp.length} XP records`);
    }

    if (data.xpHistory && data.xpHistory.length > 0) {
      await db.collection("xpHistory").insertMany(data.xpHistory);
      console.log(`✅ Inserted ${data.xpHistory.length} XP history records`);
    }

    if (data.habitHistory && data.habitHistory.length > 0) {
      await db.collection("habitHistory").insertMany(data.habitHistory);
      console.log(`✅ Inserted ${data.habitHistory.length} habit history records`);
    }

    if (data.appMeta && data.appMeta.length > 0) {
      await db.collection("appMeta").insertMany(data.appMeta);
      console.log(`✅ Inserted ${data.appMeta.length} app meta records`);
    }

    console.log("🎉 Database seeding completed with separate collections.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seedDatabase().catch(console.error);
