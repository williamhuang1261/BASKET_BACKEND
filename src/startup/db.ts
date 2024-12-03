const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');

/**
 * @description Establishes MongoDB connection using config settings
 * @example
 * dbConnection();
 */
const dbConnection = () => {
  const db = config.get('db');
  mongoose.connect(db)
  .then(() => winston.info(`Connected to ${db}...`));
}

export default dbConnection;