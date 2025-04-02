// Step 1: Import Dependencies
import { Request, Response,NextFunction } from 'express';
import Task from '../models/task';
import { redisClient } from '../config/redis';

{/*
- Request, Response from Express → Helps with type safety for route handlers.
- Task model → Imports the MongoDB model to interact with the tasks collection.
- redisClient → Redis instance for caching.
*/}

// Step 2: Define a Temporary Tenant ID
// Temporary mock tenant ID (will be replaced with JWT)
const MOCK_TENANT_ID = 'tenant_123';
{/*
- MOCK_TENANT_ID → Simulating multi-tenancy.
- In a real-world scenario, this would be extracted from a JWT token to ensure users only access their own data.
*/}

// Step 3: Create a Task
export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await Task.create({ ...req.body, tenantId: MOCK_TENANT_ID });
      res.status(201).json(task);
    } catch (error) {
        next(error); // Pass error to Express error handler
    }
  };
  
{/*
Breaking it down:
 - Receives req.body → Contains task details (title, description, etc.).
 - Adds tenantId → Ensures tasks belong to a specific tenant.
 - Creates the task in MongoDB → Uses Task.create().
 - Sends a 201 Created response with the task.
 - The response (res.json(...), res.status(...)) is sent inside the function. We don’t need to return anything because Express already knows how to handle responses.
*/}

// Step 4: Get All Tasks (with Redis Caching)
export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cacheKey = `tasks:${MOCK_TENANT_ID}`;
      const cachedTasks = await redisClient.get(cacheKey);
  
      if (cachedTasks) {
        res.json(JSON.parse(cachedTasks));
        return;
      }
  
      const tasks = await Task.find({ tenantId: MOCK_TENANT_ID });
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(tasks));
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  };

{/*
1. Check Redis cache

```
const cacheKey = `tasks:${MOCK_TENANT_ID}`;
const cachedTasks = await redisClient.get(cacheKey);
```
    - Defines a unique cache key (tasks:tenant_123).
    - Checks if data exists in Redis.
__________________________________________________________________________

2. Return cached data if found

```
if (cachedTasks) {
   return res.json(JSON.parse(cachedTass));
}
```

    - If data is found in Redis, return it immediately (faster response).
__________________________________________________________________________

3. Fetch from MongoDB if not cached

```
const tasks = await Task.find({ tenantId: MOCK_TENANT_ID });
```

    - Queries the MongoDB database if cache is empty.
__________________________________________________________________________

4. Store fresh data in Redis

```
await redisClient.setEx(cacheKey, 3600, JSON.stringify(tasks));
```

    - Saves the tasks in Redis with a 1-hour expiration (3600 seconds).
__________________________________________________________________________

5. Return fresh data

```
return res.json(tasks);
```

    - Sends the fetched tasks to the client.
__________________________________________________________________________

6. Handle errors

```
return res.status(500).json({ message: (error as Error).message });
```

    - The response (res.json(...), res.status(...)) is sent inside the function. We don’t need to return anything because Express already knows how to handle responses.
    - Use next(error) → Enables global error handling for clean code.
*/}

