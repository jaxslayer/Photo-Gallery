import mongoose from "mongoose";
import { dbName } from "../constants.js";
const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URL}/${dbName}`
    );
    console.log(
      "Mongodb connected successfully on host:",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log("Mongo connection failed:", error);
    process.exit(1);
  }
};
export { connectDb };
