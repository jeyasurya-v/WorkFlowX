// Step 1: Import Required Modules
import mongoose, { Document, Schema } from 'mongoose';

{/*
- mongoose → Main MongoDB ORM (Object-Relational Mapper) for defining schemas & models.
- Document → Represents a single record in MongoDB (used for TypeScript type safety).
- Schema → Used to define the structure of our MongoDB documents.
*/}

// Step 2: Define TypeScript Interface
export interface ITask extends Document {
    title: string;
    description?: string;
    status: 'todo' | 'inProgress' | 'done';
    tenantId: string;
  }

{/*
- Defines the structure of a "Task" document in TypeScript.
- Extends Document → Ensures this type represents a MongoDB record.
- title: string → Every task must have a title.
- description?: string → Optional description (? means it's not required).
- status: 'todo' | 'inProgress' | 'done' → Enum-like restriction for task status.
- tenantId: string → Used for multi-tenancy (ensures each task belongs to a specific organization).
*/}

// Step 3: Define Mongoose Schema
const TaskSchema: Schema = new Schema({
    title: {
      type: String,
      required: true
    },
    description: String,
    status: {
      type: String,
      enum: ['todo', 'inProgress', 'done'],
      default: 'todo'
    },
    tenantId: {
      type: String,
      required: true
    }
  });

{/*
title
- type: String → The task title is stored as a string.
- required: true → Cannot be null or missing.

description
- type: String → Stores a longer description (optional).

status
- type: String → Stores the task's progress status.
- enum: ['todo', 'inProgress', 'done'] → Restricts status values to only these options.
- default: 'todo' → When a task is created, it starts as "todo" by default.

tenantId
- type: String → Stores the organization ID (multi-tenancy).
- required: true → Ensures each task is linked to a tenant.
*/}

// Step 4: Export the Mode
export default mongoose.model<ITask>('Task', TaskSchema);

{/*
- Creates a Task model from the schema.
- Specifies the TypeScript type (ITask) for safety.
- Exports the model so it can be used in controllers.
*/}