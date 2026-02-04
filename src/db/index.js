import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";  // ❌ Now you don't need this.

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`DbConnected !! ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

export default connectDB;
