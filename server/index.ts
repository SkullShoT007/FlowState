// Load environment variables from .env file (must be first import)
import 'dotenv/config'
// Import Express framework for creating web server
import express, { Express, Request, Response } from "express"
// Import MongoDB client for database connection
import { MongoClient } from "mongodb"
// Import our custom AI agent function
import { callAgent } from './agent'

// Create Express application instance
const app: Express = express()
// Import CORS middleware for handling cross-origin requests
import cors from 'cors'
// Enable CORS for all routes (allows frontend to call this API)
app.use(cors())
// Enable JSON parsing for incoming requests (req.body will contain parsed JSON)
app.use(express.json())

// Create MongoDB client using connection string from environment variables
const client = new MongoClient(process.env.MONGODB_ATLAS_URI as string)

// In-memory storage for real-time IndexedDB data
let indexedDBData: any = null;

// Async function to initialize and start the server
async function startServer() {
  try {
    // Establish connection to MongoDB Atlas
    await client.connect()
    // Ping MongoDB to verify connection is working
    await client.db("admin").command({ ping: 1 })
    // Log successful connection
    console.log("You successfully connected to MongoDB!")

    // Define root endpoint (GET /) - simple health check
    app.get('/', (req: Request, res: Response) => {
      // Send simple response to confirm server is running
      res.send('LangGraph Agent Server')
    })

    // New endpoint to sync IndexedDB data from frontend
    app.post('/sync-data', async (req: Request, res: Response) => {
      try {
        const data = req.body;
        indexedDBData = data;
        console.log('IndexedDB data synced:', {
          tasks: data.tasks?.length || 0,
          habits: data.habits?.length || 0,
          xp: data.xp?.length || 0,
          pomodoroSessions: data.pomodoroSessions?.length || 0,
          habitHistory: data.habitHistory?.length || 0,
          xpHistory: data.xpHistory?.length || 0
        });
        
        // Log sample data for debugging
        if (data.tasks && data.tasks.length > 0) {
          console.log('Sample tasks:', data.tasks.slice(0, 2));
        }
        if (data.habits && data.habits.length > 0) {
          console.log('Sample habits:', data.habits.slice(0, 2));
        }
        
        res.json({ success: true, message: 'Data synced successfully' });
      } catch (error) {
        console.error('Error syncing data:', error);
        res.status(500).json({ error: 'Failed to sync data' });
      }
    });

    // New endpoint to get current synced data
    app.get('/data', (req: Request, res: Response) => {
      res.json({ data: indexedDBData });
    });

    // Define endpoint for starting new conversations (POST /chat)
    app.post('/chat', async (req: Request, res: Response) => {
      // Extract user message from request body
      const initialMessage = (req.body as { message: string }).message
      // Generate unique thread ID using current timestamp
      const threadId = Date.now().toString()
      // Log the incoming message for debugging
      console.log(initialMessage)
      try {
        // Call our AI agent with the message, new thread ID, and current IndexedDB data
        const response = await callAgent(client, initialMessage, threadId, indexedDBData)
        // Send successful response with thread ID and AI response
        res.json({ threadId, response })
      } catch (error) {
        // Log any errors that occur during agent execution
        console.error('Error starting conversation:', error)
        // Send error response with 500 status code
        res.status(500).json({ error: 'Internal server error' })
      }
    })

    // Define endpoint for continuing existing conversations (POST /chat/:threadId)
    app.post('/chat/:threadId', async (req: Request, res: Response) => {
      // Extract thread ID from URL parameters
      const { threadId } = req.params as { threadId: string }
      // Extract user message from request body
      const { message } = req.body as { message: string }
      try {
        // Call AI agent with message, existing thread ID, and current IndexedDB data
        const response = await callAgent(client, message, threadId, indexedDBData)
        // Send AI response (no need to send threadId again since it's continuing)
        res.json({ response })
      } catch (error) {
        // Log any errors that occur during agent execution
        console.error('Error in chat:', error)
        // Send error response with 500 status code
        res.status(500).json({ error: 'Internal server error' })
      }
    })

    // Get port from environment variable or default to 8000
    const PORT = process.env.PORT || 8000
    // Start the Express server on specified port
    app.listen(PORT, () => {
      // Log that server is running and on which port
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    // Handle any errors during server startup (especially MongoDB connection)
    console.error('Error connecting to MongoDB:', error)
    // Exit the process with error code 1 (indicates failure)
    process.exit(1)
  }
}

// Start the server (entry point of the application)
startServer()