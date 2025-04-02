import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import connectMongo from './config/mongo';
import { connectPG } from './config/db';
import { connectRedis } from './config/redis';
import taskRoutes from './routes/taskRoutes';

{/*
- express → Web framework for handling HTTP requests.
- cors → Enables cross-origin requests (so frontend can call your API).
- connectMongo → Connects to MongoDB.
- connectPG → Connects to PostgreSQL.
- connectRedis → Connects to Redis.
- taskRoutes → Imports task-related API endpoints.
    */}

// STEP 1: Initialize Express
const app = express(); // Creates an instance of the Express app.

// STEP 3: Middleware
app.use(cors());
app.use(express.json());
{/*
- cors() → Allows frontend (e.g., React) to call the backend API.
- express.json() → Parses incoming JSON requests (needed for req.body).
*/}

// STEP 4: Database connections
connectMongo();
connectPG();
connectRedis();
// Establishes connections to MongoDB, PostgreSQL, and Redis when the server starts.

// STEP 5: Define API Routes
app.use('/api/tasks', taskRoutes);

{/*
All requests to /api/tasks are handled by taskRoutes.

Example:
- POST /api/tasks → Calls createTask
- GET /api/tasks → Calls getTasks
*/}

// STEP 6: Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack); // Log error to console
    res.status(500).json({ message: err.message || 'Something went wrong' });
  });
{/*
✅ Prevents Crashes → Instead of crashing, the server responds with an error.
✅ Centralized Error Handling → Clean code, all errors handled in one place.
✅ Better Debugging → Logs error details to the console.
*/}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
{/*
Uses .env variable PORT, defaulting to 5000 if not set.
Starts the server and listens for incoming requests.
*/}