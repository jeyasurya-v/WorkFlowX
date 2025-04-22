/**
 * Database Connection Module
 * 
 * Manages connections to MongoDB, PostgreSQL, and Redis databases.
 * Provides functions to establish connections with proper error handling.
 * 
 * @module config/database
 */

const mongoose = require('mongoose');
const { Pool } = require('pg');
const Redis = require('redis');
const config = require('./index');
const mockDb = require('../mockDb');

/**
 * Connect to MongoDB
 * 
 * @param {string} uri - MongoDB connection URI
 * @returns {Object} Mongoose connection object or mockDb if connection fails
 */
const connectMongoDB = async (uri = config.mongodb.uri) => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(uri, {
      ...config.mongodb.options,
      serverSelectionTimeoutMS: 5000, // Reduce timeout to 5 seconds
      connectTimeoutMS: 10000
    });
    console.log('✅ MongoDB connected successfully');
    
    // Add connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    return mongoose;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.warn('⚠️ Using mock database instead');
    return mockDb; // Return mock database instead of null
  }
};

/**
 * Set up PostgreSQL connection pool
 * 
 * @param {Object} pgConfig - PostgreSQL configuration
 * @returns {Object} PostgreSQL pool or null if disabled
 */
const setupPostgresPool = (pgConfig = config.postgres) => {
  // Check if PostgreSQL is enabled
  if (process.env.POSTGRES_ENABLED === 'false') {
    console.log('PostgreSQL is disabled in configuration');
    return null;
  }
  
  const pool = new Pool(pgConfig);
  
  pool.on('connect', () => {
    console.log('✅ PostgreSQL connected successfully');
  });
  
  pool.on('error', (err) => {
    console.error('PostgreSQL connection error:', err);
  });
  
  // Verify connection
  pool.query('SELECT NOW()', [])
    .then(() => console.log('PostgreSQL connection verified'))
    .catch(err => console.error('PostgreSQL connection verification failed:', err));
    
  return pool;
};

/**
 * Set up Redis client
 * 
 * @param {Object} redisConfig - Redis configuration
 * @returns {Object} Redis client or null if connection fails
 */
const setupRedisClient = async (redisConfig = config.redis) => {
  try {
    const redisUrl = `redis://${redisConfig.host}:${redisConfig.port}`;
    
    const client = Redis.createClient({
      url: redisUrl,
      password: redisConfig.password || undefined,
      socket: {
        tls: !redisConfig.disableTls && config.isProd,
        rejectUnauthorized: false,
        connectTimeout: 5000, // 5 seconds timeout
      }
    });
    
    client.on('error', (err) => {
      console.error('Redis error:', err);
    });
    
    client.on('ready', () => {
      console.log('✅ Redis connected successfully');
    });
    
    client.on('reconnecting', () => {
      console.warn('Redis reconnecting...');
    });
    
    // Connect to Redis
    await client.connect();
    
    return client;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.warn('Continuing without Redis connection');
    return null;
  }
};

module.exports = {
  connectMongoDB,
  setupPostgresPool,
  setupRedisClient
}; 