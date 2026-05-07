import mongoose from "mongoose";
import { DB_NAME } from "./constant.js";
const connectionCache = new Map();

async function connectAuthDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is required to start admin-service");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    dbName: DB_NAME
  });

  return mongoose.connection;
}

async function getDatabaseConnection({ name, uri }) {
  if (!name) {
    throw new Error("Database connection name is required");
  }

  if (!uri) {
    throw new Error(`Database URI is required for connection "${name}"`);
  }

  if (connectionCache.has(name)) {
    return connectionCache.get(name);
  }

  const connection = await mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 10000
  }).asPromise();

  connectionCache.set(name, connection);
  return connection;
}

async function closeDatabaseConnections() {
  await Promise.all(
    Array.from(connectionCache.values()).map((connection) => connection.close())
  );
  connectionCache.clear();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}

export {
  connectAuthDatabase,
  getDatabaseConnection,
  closeDatabaseConnections
};