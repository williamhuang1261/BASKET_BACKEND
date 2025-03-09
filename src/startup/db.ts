import winston from "winston";
import mongoose from "mongoose";

/**
 * @description Establishes MongoDB connection using config settings
 * @example
 * dbConnection();
 */
const dbConnection = () => {
  const db: string | undefined = process.env.BASKET_DB_CONNECTION_STRING;
  if (!db) {
    throw new Error("FATAL ERROR: db is not defined.");
  }

  mongoose.connect(db).then(() => {
    winston.info(`Connected to ${db}...`);
  });
};

export default dbConnection;
