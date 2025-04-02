//PostgresSQL

import { Sequelize } from 'sequelize' 
// This file sets up PostgreSQL using Sequelize, an ORM (Object-Relational Mapper)
// We import Sequelize, which helps us interact with PostgreSQL using JavaScript instead of raw SQL queries.
import dotenv from 'dotenv';
// We import dotenv to load environment variables (credentials) from a .env file.

dotenv.config();
// Ensures that the environment variables (like PG_DATABASE, PG_USER, PG_PASSWORD, PG_HOST) are loaded before using them.

const sequelize = new Sequelize(
    process.env.PG_DATABASE as string,  // Database Name
    process.env.PG_USER as string,      // Username
    process.env.PG_PASSWORD as string,  // Password
    {
      host: process.env.PG_HOST as string,  // Server Hostname/IP
      dialect: 'postgres'                   // Using PostgreSQL as the database
    }
  );  

export const connectPG = async (): Promise<void> => {
    try {
      await sequelize.authenticate(); // Check if PostgreSQL connection works
      console.log('PostgreSQL connected');
    } catch (error) {
      console.error('PostgreSQL connection error:', error);
      process.exit(1); // Exit if connection fails
    }
  };
  

export default sequelize;