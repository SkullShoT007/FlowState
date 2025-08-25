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
async function setupDatabaseAndCollection(): Promise<void> {
  console.log("Setting up database and collection...");
  const db = client.db("flowstate_database");
  const collections = await db.listCollections({ name: "flowstate_collection" }).toArray();

  if (collections.length === 0) {
    await db.createCollection("flowstate_collection");
    console.log("✅ Created collection 'flowstate_collection'");
  } else {
    console.log("ℹ️ Collection 'flowstate_collection' already exists");
  }
}

async function createVectorSearchIndex(): Promise<void> {
  try {
    const db = client.db("flowstate_database");
    const collection = db.collection("flowstate_collection");

    // Drop old indexes
    await collection.dropIndexes();

    // ✅ Correct way to create Atlas vector index
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

    console.log("✅ Vector search index created successfully");
  } catch (error) {
    console.error("❌ Error creating vector search index:", error);
  }
}

// ---------------- Summary builder ----------------
async function createAppDataSummary(entry: Data): Promise<string> {
  const d = entry;

  const taskSummary =
    d.tasks && d.tasks.length > 0
      ? `You have ${d.tasks.length} tasks.${d.tasks[0] ? ` Example: "${d.tasks[0].title}" with difficulty ${d.tasks[0].difficulty}.` : ""}`
      : "No tasks available.";

  const habitSummary =
    d.habits && d.habits.length > 0 && d.habits[0]
      ? `You are tracking ${d.habits.length} habits such as "${d.habits[0].title}" (${d.habits[0].type}).`
      : "No habits defined.";

  const xpSummary =
    d.xp && d.xp.length > 0 && d.xp[0]
      ? `Current XP: ${d.xp[0].totalxp}, Level: ${d.xp[0].level}, Next level at ${d.xp[0].nextLevelXp} XP.`
      : "XP data not found.";

  const pomoSummary =
    Array.isArray(d.pomodoroSessions) && d.pomodoroSessions.length > 0 && d.pomodoroSessions[d.pomodoroSessions.length - 1]
      ? `You have logged ${d.pomodoroSessions.length} pomodoro sessions. Last session type: ${d.pomodoroSessions[d.pomodoroSessions.length - 1]?.type ?? "unknown"}.`
      : "No pomodoro sessions recorded.";

  const xpHistorySummary =
    d.xpHistory && d.xpHistory.length > 0
      ? `XP history contains ${d.xpHistory.length} entries.`
      : "No XP history found.";

  const habitHistorySummary =
    d.habitHistory && d.habitHistory.length > 0
      ? `Habit history has ${d.habitHistory.length} records.`
      : "No habit history stored.";

  const metaSummary =
    d.appMeta && d.appMeta.length > 0
      ? `Meta keys include: ${d.appMeta.map((m) => m.key).join(", ")}.`
      : "No metadata.";

  return [
    taskSummary,
    habitSummary,
    xpSummary,
    pomoSummary,
    xpHistorySummary,
    habitHistorySummary,
    metaSummary,
  ].join(" ");
}


// ---------------- Seeder ----------------
async function seedDatabase(): Promise<void> {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB");

    await setupDatabaseAndCollection();
    await createVectorSearchIndex();

    const db = client.db("flowstate_database");
    const collection = db.collection("flowstate_collection");
    await collection.deleteMany({});
    console.log("🗑️ Cleared existing documents");

    const jsonData = fs.readFileSync("./data/flowStateDB-export.json", "utf-8");
    const parsed: Data = JSON.parse(jsonData);
    const data: Data[] = Array.isArray(parsed) ? parsed : [parsed];


    const recordsWithSummaries = await Promise.all(
      data.map(async (record) => ({
        pageContent: await createAppDataSummary(record),
        metadata: { ...record },
      }))
    );

    for (const record of recordsWithSummaries) {
      await MongoDBAtlasVectorSearch.fromDocuments(
        [record],
        new GoogleGenerativeAIEmbeddings({
          apiKey: process.env.GOOGLE_API_KEY ?? "",
          modelName: "text-embedding-004",
        }),
        {
          collection,
          indexName: "vector_index",
          textKey: "embedding_text",
          embeddingKey: "embedding", // ✅ match with index
        }
      );
      console.log("✅ Saved record:", record.metadata);
    }

    console.log("🎉 Database seeding completed.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seedDatabase().catch(console.error);
