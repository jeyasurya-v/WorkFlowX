import { createClient, RedisClientType } from 'redis';
// createClient → A function from the Redis package that creates a new Redis connection.
// RedisClientType → Defines the type for our Redis client (for TypeScript).
import dotenv from 'dotenv';
// dotenv.config(); → Loads environment variables from the .env file so we can use REDIS_URI.

dotenv.config();

const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URI as string
});

{/*
Creates a Redis client instance that connects to the Redis server.
process.env.REDIS_URI → The Redis connection URL stored in .env (we will set this up).
*/}

redisClient.on('error', (err: Error) => console.log('Redis Client Error', err));

{/*
If Redis fails to connect, it logs an error.
This helps debug issues like wrong credentials, network problems, or Redis not running.
*/}

const connectRedis = async (): Promise<void> => {
    await redisClient.connect();
    console.log('Redis Connected');
}
{/*
This function connects to Redis when called.
await redisClient.connect(); → Tries to establish a connection.
If successful, it logs "Redis connected".
*/}

export { redisClient, connectRedis };

{/*
Exports redisClient → So we can use Redis in other files (e.g., for caching data).
Exports connectRedis → So we can call connectRedis() in server.ts to establish a connection.
*/}