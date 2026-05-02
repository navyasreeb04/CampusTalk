import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

const connectWithUri = async (uri) => {
  await mongoose.connect(uri);
  return uri;
};

const connectDB = async () => {
  const configuredUri = process.env.MONGO_URI?.trim();

  try {
    if (configuredUri) {
      await connectWithUri(configuredUri);
      console.log("MongoDB connected");
      return configuredUri;
    }

    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: "campustalk",
        },
      });
    }

    const memoryUri = memoryServer.getUri();
    await connectWithUri(memoryUri);
    console.log("MongoDB connected with in-memory fallback");
    return memoryUri;
  } catch (error) {
    if (configuredUri && process.env.ALLOW_MEMORY_FALLBACK !== "false") {
      console.warn(
        `Primary MongoDB connection failed (${error.message}). Falling back to in-memory MongoDB for local development.`
      );

      if (!memoryServer) {
        memoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: "campustalk",
          },
        });
      }

      const memoryUri = memoryServer.getUri();
      await connectWithUri(memoryUri);
      console.log("MongoDB connected with in-memory fallback");
      return memoryUri;
    }

    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;
