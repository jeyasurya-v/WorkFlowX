/**
 * PipelineRadar API Server
 * 
 * Main server entry point that initializes Express application,
 * establishes database connections, sets up middleware, and starts the server.
 * 
 * @module server
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { Pool } = require('pg');
const Redis = require('redis');
const passport = require('passport');

// Import configuration
const config = require('./config');

// Import routes
const apiRoutes = require('./routes');
const apiDebugRoutes = require('./config/api');

// Import middleware
const { requestLogger } = require('./middleware');
const corsMiddleware = require('./middleware/cors.middleware');

// Import database connection modules
const { 
  connectMongoDB, 
  setupPostgresPool, 
  setupRedisClient 
} = require('./config/database');

// Import and initialize passport configuration
const initPassport = require('./config/passport');

/**
 * Create and configure Express application
 * @returns {Object} Express app and HTTP server
 */
function setupServer() {
  // Create Express app
  const app = express();
  const server = http.createServer(app);

  console.log('[SETUP] Creating server with config:', {
    port: config.port,
    frontendUrl: config.frontendUrl,
    corsOrigins: Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin]
  });

  // Configure trust proxy
  app.set('trust proxy', config.server.trustProxy);

  // Create Socket.io server with CORS
  const io = new Server(server, {
    cors: config.cors
  });
  console.log('[SETUP] Socket.io initialized with CORS config:', JSON.stringify(config.cors, null, 2));

  // Apply our custom CORS middleware
  app.use(corsMiddleware);
  console.log('[SETUP] Custom CORS middleware applied');
  
  // Security middleware - adjust helmet settings to allow frontend to connect
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'unsafe-none' },
    crossOriginEmbedderPolicy: false
  }));
  
  // Logging middleware
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
  app.use(requestLogger);
  
  // Request parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize Passport
  app.use(passport.initialize());
  initPassport();

  // Debug API routes - these should be accessible without auth
  app.use('/api/debug', apiDebugRoutes);
  
  // API routes
  app.use(config.apiPrefix, apiRoutes);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      version: config.appVersion,
      timestamp: new Date().toISOString() 
    });
  });

  // Error handling middleware
  app.use((req, res, next) => {
    res.status(404).json({
      error: {
        message: 'Not Found',
        status: 404
      }
    });
  });

  app.use((err, req, res, next) => {
    // Log error for debugging
    console.error(`[ERROR] ${err.stack}`);
    
    const statusCode = err.status || 500;
    const errorMessage = config.env === 'production' && statusCode === 500
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error';
      
    res.status(statusCode).json({
      error: {
        message: errorMessage,
        status: statusCode,
        ...(config.env !== 'production' && { stack: err.stack })
      }
    });
  });

  // Initialize WebSocket handlers
  require('./websockets')(io);

  return { app, server, io };
}

/**
 * Start the server and establish database connections
 */
async function startServer() {
  try {
    console.log('[STARTUP] Setting up server...');
    const { app, server, io } = setupServer();
    
    console.log('[STARTUP] Database connection details:');
    console.log('- MongoDB URI:', config.mongodb.uri);
    console.log('- Redis Host:', config.redis.host);
    console.log('- PostgreSQL Enabled:', process.env.POSTGRES_ENABLED !== 'false');
    
    // Try to connect to databases, but continue if they fail
    let mongodb = null;
    let postgresPool = null;
    let redisClient = null;
    
    try {
      console.log('[STARTUP] Connecting to MongoDB...');
      mongodb = await connectMongoDB(config.mongodb.uri);
    } catch (err) {
      console.error('[STARTUP] MongoDB connection error:', err.message);
      console.log('[STARTUP] Continuing without MongoDB...');
    }
    
    if (process.env.POSTGRES_ENABLED !== 'false') {
      try {
        console.log('[STARTUP] Setting up PostgreSQL...');
        postgresPool = setupPostgresPool(config.postgres);
      } catch (err) {
        console.error('[STARTUP] PostgreSQL connection error:', err.message);
        console.log('[STARTUP] Continuing without PostgreSQL...');
      }
    } else {
      console.log('[STARTUP] PostgreSQL is disabled, skipping connection');
    }
    
    try {
      console.log('[STARTUP] Setting up Redis...');
      redisClient = await setupRedisClient(config.redis);
    } catch (err) {
      console.error('[STARTUP] Redis connection error:', err.message);
      console.log('[STARTUP] Continuing without Redis...');
    }

    // Start server regardless of database connections
    console.log(`[STARTUP] Starting server on port ${config.port}...`);
    server.listen(config.port, () => {
      console.log(`
        ╔═══════════════════════════════════════════════════╗
        ║              PipelineRadar API Server             ║
        ╟───────────────────────────────────────────────────╢
        ║ Version: ${config.appVersion.padEnd(37, ' ')}║
        ║ Environment: ${config.env.padEnd(34, ' ')}║
        ║ Server running on port: ${config.port}${' '.repeat(26)}║
        ║ API available at: ${config.apiUrl}${' '.repeat(39 - config.apiUrl.length)}║
        ╚═══════════════════════════════════════════════════╝
      `);
    });

    // Handle graceful shutdown
    setupGracefulShutdown(server, {
      mongodb,
      postgresPool,
      redisClient
    });

    return { app, server, io };
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Setup graceful shutdown handlers
 * @param {Object} server - HTTP server
 * @param {Object} connections - Database connections
 */
function setupGracefulShutdown(server, connections) {
  const shutdown = async (signal) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    
    // First close server to stop accepting new connections
    server.close(() => {
      console.log('Server closed');
    });
    
    try {
      // Close database connections
      const closeTasks = [
        connections.mongodb?.connection?.close(),
        connections.redisClient?.quit()
      ];
      
      // Add PostgreSQL if it exists
      if (connections.postgresPool) {
        closeTasks.push(connections.postgresPool.end());
      }
      
      await Promise.allSettled(closeTasks);
      console.log('Database connections closed');
      
      console.log('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Listen for termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle uncaught exceptions and rejections
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    shutdown('Uncaught Exception');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:', reason);
    shutdown('Unhandled Promise Rejection');
  });
}

// Only start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = {
  setupServer,
  startServer
};
