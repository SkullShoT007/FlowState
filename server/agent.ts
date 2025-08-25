import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import {ChatPromptTemplate, MessagesPlaceholder} from "@langchain/core/prompts"
import {StateGraph, Annotation} from "@langchain/langgraph"
import {tool} from "@langchain/core/tools"
import {ToolNode} from "@langchain/langgraph/prebuilt"
import {MongoDBSaver} from "@langchain/langgraph-checkpoint-mongodb"
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import {z} from "zod"
import "dotenv/config";

async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3
): Promise<T> {
    for(let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch(error: any) {
            if(error.status === 429 && attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
                console.error(`Rate limit hit. Retrying in ${delay/1000} seconds`);
                await new Promise(res => setTimeout(res, delay));
                continue;
            }
            throw error;
        }
    }
    throw new Error("Max retries exceeded");
}

export async function callAgent(client: MongoClient, query: string, thread_id: string, indexedDBData: any = null) {
    try {
        const dbName = "flowstate_database";
        const db = client.db(dbName);
        const collection = db.collection("flowstate_collection");

        const GraphState = Annotation.Root({
           messages: Annotation<BaseMessage[]>({
            reducer: (x,y) => x.concat(y),
           }) 
        });

        const itemLookupTool = tool(
            async({query, n = 1}) => {
              try {
                    console.log("Item lookup tool called with query:", query);
                    
                    // Use real-time IndexedDB data if available
                    if (indexedDBData) {
                        console.log("Using real-time IndexedDB data");
                        console.log("Available data:", {
                            tasksCount: indexedDBData.tasks?.length || 0,
                            habitsCount: indexedDBData.habits?.length || 0,
                            xpCount: indexedDBData.xp?.length || 0,
                            pomodoroCount: indexedDBData.pomodoroSessions?.length || 0
                        });
                        console.log("Sample tasks:", indexedDBData.tasks?.slice(0, 2));
                        console.log("Sample habits:", indexedDBData.habits?.slice(0, 2));
                        
                        // Search through all data types
                        const allData = [];
                        
                        // Check if query asks for multiple data types or general information
                        const queryLower = query.toLowerCase();
                        const asksForTasks = queryLower.includes('task');
                        const asksForHabits = queryLower.includes('habit');
                        const asksForAll = queryLower.includes('all') || queryLower.includes('everything') || queryLower.includes('both');
                        const asksForList = queryLower.includes('list') || queryLower.includes('show') || queryLower.includes('what');
                        
                        // Search tasks
                        if (indexedDBData.tasks) {
                            let taskMatches = [];
                            if (asksForTasks || asksForAll || asksForList) {
                                // If user asks for tasks, all data, or general listing, return all tasks
                                taskMatches = indexedDBData.tasks;
                            } else {
                                // Otherwise filter by specific criteria
                                taskMatches = indexedDBData.tasks.filter((task: any) => 
                                    task.title?.toLowerCase().includes(queryLower) ||
                                    task.description?.toLowerCase().includes(queryLower) ||
                                    task.difficulty?.toString().includes(query) ||
                                    (task.completed ? 'completed' : 'pending').includes(queryLower)
                                );
                            }
                            allData.push(...taskMatches.map((task: any) => ({ ...task, type: 'task' })));
                        }
                        
                        // Search habits
                        if (indexedDBData.habits) {
                            let habitMatches = [];
                            if (asksForHabits || asksForAll || asksForList) {
                                // If user asks for habits, all data, or general listing, return all habits
                                habitMatches = indexedDBData.habits;
                            } else {
                                // Otherwise filter by specific criteria
                                habitMatches = indexedDBData.habits.filter((habit: any) => 
                                    habit.title?.toLowerCase().includes(queryLower) ||
                                    habit.description?.toLowerCase().includes(queryLower) ||
                                    habit.type?.toLowerCase().includes(queryLower) ||
                                    (habit.completed ? 'completed' : 'pending').includes(queryLower)
                                );
                            }
                            allData.push(...habitMatches.map((habit: any) => ({ ...habit, type: 'habit' })));
                        }
                        
                        // Search XP data
                        if (indexedDBData.xp && indexedDBData.xp.length > 0) {
                            const xpData = indexedDBData.xp[0];
                            if (queryLower.includes('xp') || 
                                queryLower.includes('experience') || 
                                queryLower.includes('level') ||
                                queryLower.includes('progress') ||
                                asksForAll ||
                                asksForList) {
                                allData.push({ ...xpData, type: 'xp' });
                            }
                        }
                        
                        // Search Pomodoro sessions
                        if (indexedDBData.pomodoroSessions) {
                            let pomodoroMatches = [];
                            if (queryLower.includes('pomodoro') || queryLower.includes('session') || asksForAll || asksForList) {
                                // If user asks for pomodoro sessions generally, return all sessions
                                pomodoroMatches = indexedDBData.pomodoroSessions;
                            } else {
                                // Otherwise filter by specific criteria
                                pomodoroMatches = indexedDBData.pomodoroSessions.filter((session: any) => 
                                    session.mode?.toLowerCase().includes(queryLower) ||
                                    session.date?.toLowerCase().includes(queryLower) ||
                                    (session.wasSkipped ? 'skipped' : 'completed').includes(queryLower)
                                );
                            }
                            allData.push(...pomodoroMatches.map((session: any) => ({ ...session, type: 'pomodoro' })));
                        }
                        
                        // Search habit history
                        if (indexedDBData.habitHistory) {
                            const historyMatches = indexedDBData.habitHistory.filter((history: any) => 
                                history.date?.includes(query) ||
                                (history.status ? 'completed' : 'missed').includes(query.toLowerCase())
                            );
                            allData.push(...historyMatches.map((history: any) => ({ ...history, type: 'habitHistory' })));
                        }
                        
                        // Search XP history
                        if (indexedDBData.xpHistory) {
                            const xpHistoryMatches = indexedDBData.xpHistory.filter((history: any) => 
                                history.timestamp?.includes(query) ||
                                history.level?.toString().includes(query) ||
                                history.totalxp?.toString().includes(query)
                            );
                            allData.push(...xpHistoryMatches.map((history: any) => ({ ...history, type: 'xpHistory' })));
                        }
                        
                        // For general queries, return more results, but limit to prevent overwhelming responses
                        const maxResults = asksForTasks || asksForHabits || asksForAll || asksForList ? 50 : n;
                        const limitedResults = allData.slice(0, maxResults);
                        console.log(`Found ${limitedResults.length} results in IndexedDB data`);
                        console.log('Query analysis:', {
                            query: query,
                            asksForTasks,
                            asksForHabits,
                            asksForAll,
                            asksForList,
                            foundTasks: allData.filter(item => item.type === 'task').length,
                            foundHabits: allData.filter(item => item.type === 'habit').length,
                            foundXP: allData.filter(item => item.type === 'xp').length,
                            foundPomodoro: allData.filter(item => item.type === 'pomodoro').length
                        });
                        
                        return JSON.stringify({
                            results: limitedResults,
                            searchType: "indexeddb",
                            query: query,
                            count: limitedResults.length,
                            dataTypes: {
                                tasks: indexedDBData.tasks?.length || 0,
                                habits: indexedDBData.habits?.length || 0,
                                xp: indexedDBData.xp?.length || 0,
                                pomodoroSessions: indexedDBData.pomodoroSessions?.length || 0,
                                habitHistory: indexedDBData.habitHistory?.length || 0,
                                xpHistory: indexedDBData.xpHistory?.length || 0
                            }
                        });
                    }
                    
                    // Fallback to MongoDB if no IndexedDB data available
                    console.log("No IndexedDB data available, falling back to MongoDB");
                    const totalCount = await collection.countDocuments();
                    console.log(`Total documents in collection: ${totalCount}`);

                    if(totalCount === 0) {
                        console.log("Collection is empty");
                        return JSON.stringify({ 
                            error: "No item found in inventory",
                            message: "No items found" ,
                            count: 0
                        });
                    }

                    const sampleDocs = await collection.find({}).limit(3).toArray();
                    console.log("Sample documents:", sampleDocs);

                    const dbConfig = {
                        collection: collection,
                        indexName: "vector_index",
                        textKey: "embedding_text",
                        embedKey: "embedding"
                    };

                    if (!process.env.GOOGLE_API_KEY) {
                        throw new Error("GOOGLE_API_KEY environment variable is not set");
                    }

                    const vectorStore = new MongoDBAtlasVectorSearch(
                        new GoogleGenerativeAIEmbeddings({
                            apiKey: process.env.GOOGLE_API_KEY,
                            model: "text-embedding-004"
                        }),
                        dbConfig
                    );
                    console.log("Performing vector search");
                    const result = await vectorStore.similaritySearchWithScore(query, n);
                    console.log(`Vector search results: ${result.length} results`);
                    
                    if(result.length === 0) {
                        console.log("Vector search returned no results, trying text search...");

                        const textResult = await collection.find({
                            $or: [
                                { item_name: { $regex: query, $options: 'i' } },
                                { item_description: { $regex: query, $options: 'i' } },
                                { categories: { $regex: query, $options: 'i' } },
                                { embedding_text: { $regex: query, $options: 'i' } }
                            ]
                        }).limit(n).toArray();
                        console.log(`Text Search returned ${textResult.length} results`);
                        return JSON.stringify({
                            results: textResult,
                            searchType: "text",
                            query: query,
                            count: textResult.length
                        });
                    }  
                    return JSON.stringify({
                       results: result,
                       searchType: "vector",
                       query: query,
                       count: result.length
                    });
                } catch (error: any) {
                    console.error("Error in item lookup:", error);
                    console.error("Error details:", {
                        message: error.message,
                        stack: error.stack,
                        name: error.name
                    });
                    return JSON.stringify({
                        error: "Item lookup failed",
                        message: error.message,
                        count: 0
                    });
                }
            },
            {
                name: "item_lookup",
                description: "Gather information about tasks, habits, XP progress, and Pomodoro sessions from the user's real-time data. For general queries like 'what are my tasks', it will return all matching items.",
                schema: z.object({
                    query: z.string().describe("The search query to find relevant tasks, habits, XP data, or Pomodoro sessions"),
                    n: z.number().default(1).describe("Number of results to return (ignored for general queries which return all matching items)")
                }),
            }
        );

        const tools = [itemLookupTool];
        const toolNode = new ToolNode<typeof GraphState.State>(tools);
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error("GOOGLE_API_KEY environment variable is not set");
        }

        const model = new ChatGoogleGenerativeAI({
            model: "gemini-1.5-flash",
            temperature: 0,
            maxRetries: 0,
            apiKey: process.env.GOOGLE_API_KEY,
        }).bindTools(tools);

        function shouldContinue(state: typeof GraphState.State) {
            const messages = state.messages || [];
            const lastMessage = messages[messages.length - 1] as AIMessage;
            if(lastMessage.tool_calls?.length) {
                return "tools";
            }
            return "__end__";
        }

        async function callModel(state: typeof GraphState.State) {
            return retryWithBackoff(async() => {
                const prompt = ChatPromptTemplate.fromMessages([
                    [
                        "system",
                        `You are a helpful Assistant for managing tasks, habits, and analytics for the FlowState productivity app.

                        IMPORTANT: You have access to a item_lookup tool that queries the user's real-time IndexedDB data (tasks, habits, XP progress, Pomodoro sessions, and history). 
                        ALWAYS use this tool when the user asks about tasks, habits, progress, analytics, or related insights — even if the tool returns errors or empty results.

                        When using the item_lookup tool:
                        - If it returns results, provide clear and helpful details based on the real-time data
                        - If it returns no results or an error, acknowledge it and suggest alternatives (e.g., adding a new task/habit or checking another query)
                        - If the database appears empty, politely let the user know the system may still be initializing or syncing data
                        - When users ask for multiple data types (e.g., "tasks and habits"), the tool will return all relevant data types

                        You can help with:
                        - Task management (viewing, creating, completing tasks)
                        - Habit tracking (viewing habits, checking completion status)
                        - XP and level progress analysis
                        - Pomodoro session history and statistics
                        - Productivity insights and recommendations
                        - Combined queries (e.g., "show me my tasks and habits", "what's my overall progress")

                        Current time: {time}` 
                    ],
                    new MessagesPlaceholder("messages"),
                ]);

                const formattedPrompt = await prompt.formatMessages({
                    time: new Date().toISOString(),
                    messages: state.messages
                });

                const result = await model.invoke(formattedPrompt);
                return {messages: [result]};
            });
        }

        const workflow = new StateGraph(GraphState)
            .addNode("agent", callModel)                    // Add AI model node
            .addNode("tools", toolNode)                     // Add tool execution node
            .addEdge("__start__", "agent")                  // Start workflow at agent
            .addConditionalEdges("agent", shouldContinue)   // Agent decides: tools or end
            .addEdge("tools", "agent");                     // After tools, go back to agent

        // Initialize conversation state persistence
        const checkpointer = new MongoDBSaver({ client, dbName });
        // Compile the workflow with state saving
        const app = workflow.compile({ checkpointer });

        // Execute the workflow
        const finalState = await app.invoke(
            {
                messages: [new HumanMessage(query)], // Start with user's question
            },
            { 
                recursionLimit: 15,                   // Prevent infinite loops
                configurable: { thread_id: thread_id } // Conversation thread identifier
            }
        );

        const lastMessage = finalState.messages[finalState.messages.length - 1];
        if (!lastMessage || !lastMessage.content) {
            throw new Error("No response generated from the agent");
        }
        const response = lastMessage.content;
        console.log("Agent response:", response);

        return response;

    } catch(error: any) {
        console.error("Error in callAgent:", error);
        if(error.status === 429) {
            throw new Error("Rate limit exceeded. Please try again later.");
        } else if (error.status === 401) {
            throw new Error("Unauthorized access. Please check your API key.");
        } else {
            throw new Error("An unexpected error occurred. Please try again.");
        }
    }
}