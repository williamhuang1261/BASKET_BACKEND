import winston from 'winston'
import mongoose from 'mongoose'
import config from 'config'

/**
 * @description Establishes MongoDB connection using config settings
 * @example
 * dbConnection();
 */
const dbConnection = () => {
  const db:string = config.get('db');
  if (!db){
    throw new Error('FATAL ERROR: db is not defined.');
  }

  mongoose.connect(db)
  .then(() => {
    winston.info(`Connected to ${db}...`)
  });
  
}

export default dbConnection;