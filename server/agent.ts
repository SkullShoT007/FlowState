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

export async function callAgent(client: MongoClient, query: string, thread_id: string) {
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
                description: "Gather information",
                schema: z.object({
                    query: z.string().describe("The search query"),
                    n: z.number().default(1).describe("Number of results to return")
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
                        `You are a helpful Assistant for managing tasks, habits, and analytics.

                        IMPORTANT: You have access to a item_lookup tool that queries the database (IndexedDB/ElasticSearch/MongoDB with vector index). 
                        ALWAYS use this tool when the user asks about tasks, habits, progress, or related insights — even if the tool returns errors or empty results.

                        When using the item_lookup tool:
                        - If it returns results, provide clear and helpful details based on the data
                        - If it returns no results or an error, acknowledge it and suggest alternatives (e.g., adding a new task/habit or checking another query)
                        - If the database appears empty, politely let the user know the system may still be initializing or syncing data

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