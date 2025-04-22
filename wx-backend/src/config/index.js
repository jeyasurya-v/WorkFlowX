/**
 * Application Configuration
 * 
 * Centralizes all environment variables and application settings in one place.
 * This makes it easier to manage configuration across the application and
 * provides a single source of truth for all settings.
 * 
 * @module config
 */

require('dotenv').config();

const path = require('path');
const packageJson = require('../../package.json');

// Environment
const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';
const isTest = env === 'test';
const isProd = env === 'production';

// Server configuration
const port = parseInt(process.env.PORT, 10) || 5000;
const host = process.env.HOST || 'localhost';
const apiPrefix = process.env.API_PREFIX || '/api/v1';
const apiUrl = `http://${host}:${port}${apiPrefix}`;
const appVersion = packageJson.version;

// Frontend URL for CORS
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// Auth configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'Why0XwAnSda8kgV4rAFYhQ0jYm6oIAifpr0iCUmXHxQ=',
  expiration: process.env.JWT_EXPIRATION || '1h',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'P3o5Px08G62bYR7j9OsudjOWwWH9Vx15/C1ungy4iPo=',
  refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
};

// MongoDB configuration
const mongoConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/workflowx',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 5000, // 5 seconds timeout
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
  },
};

// PostgreSQL configuration
const postgresConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
  database: process.env.POSTGRES_DB || 'pipelineradar',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  ssl: isProd ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
};

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || '',
  disableTls: process.env.REDIS_DISABLE_TLS === 'true',
};

// CORS configuration
const corsConfig = {
  origin: [
    frontendUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
};

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  secure: isProd, // Use TLS in production
  from: process.env.EMAIL_FROM || 'noreply@pipelineradar.com',
};

// Logging configuration
const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info', // error, warn, info, debug
  filename: process.env.LOG_FILE || path.join(__dirname, '../../logs/app.log'),
  maxSize: process.env.LOG_MAX_SIZE || '10m',
  maxFiles: process.env.LOG_MAX_FILES || 5,
};

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
};

// OAuth configuration
const oauthConfig = {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },
  gitlab: {
    clientId: process.env.GITLAB_CLIENT_ID,
    clientSecret: process.env.GITLAB_CLIENT_SECRET,
  },
};

/**
 * Consolidated configuration object
 */
const config = {
  env,
  isDev,
  isTest,
  isProd,
  port,
  host,
  apiPrefix,
  apiUrl,
  appVersion,
  frontendUrl,
  jwt: jwtConfig,
  mongodb: mongoConfig,
  postgres: postgresConfig,
  redis: redisConfig,
  cors: corsConfig,
  email: emailConfig,
  logging: loggingConfig,
  rateLimit: rateLimitConfig,
  oauth: oauthConfig,
  server: {
    env,
    port,
    host,
    apiUrl,
    apiPrefix,
    apiBaseUrl: process.env.API_BASE_URL || `http://${host}:${port}`,
    trustProxy: process.env.TRUST_PROXY || 'loopback, linklocal, uniquelocal'
  },
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key',
  }
};

// Validate that required environment variables are set
const validateConfig = () => {
  const requiredVars = [
    'jwt.secret',
    'jwt.refreshSecret',
  ];
  
  const missingVars = requiredVars.filter(path => {
    const keys = path.split('.');
    let current = config;
    
    for (const key of keys) {
      if (current[key] === undefined) return true;
      current = current[key];
    }
    
    return current === undefined || current === null || current === '';
  });
  
  if (missingVars.length > 0) {
    console.warn(`Missing required configuration: ${missingVars.join(', ')}`);
    
    if (config.env === 'production') {
      throw new Error('Missing required configuration for production environment');
    }
  }
};

// Perform validation in non-test environments
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}

module.exports = config; 