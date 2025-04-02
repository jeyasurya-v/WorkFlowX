import mongoose from "mongoose"; // mongoose: This is the ODM (Object Data Modeling) library that helps us interact with MongoDB in a structured way.
import dotenv from "dotenv"; // dotenv: Loads environment variables from a .env file into process.env.

dotenv.config(); // dotenv.config();: Ensures that environment variables (like MONGO_URI) are available before the database connection is attempted.

// const encodedPassword = encodeURIComponent("Royalenfield967#");  // If you want to encode your passwored
// console.log(encodedPassword); // Outputs: Royalenfield967%23

const connectMongo = async (): Promise<void> => {
  // async (): Promise<void>: This function returns a promise, ensuring proper async handling.
  try {
    await mongoose.connect(process.env.MONGO_URI as string); // mongoose.connect(process.env.MONGO_URI as string);: Connects to MongoDB using the URI stored in .env.
    console.log("MongoDB connected");
  } catch (err) {
    console.log("MongoDB connection error", err);
    process.exit(1); // stops the app in case of a critical failure.
  }
};

export default connectMongo;
