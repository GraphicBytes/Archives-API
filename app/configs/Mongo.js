import mongoose from 'mongoose';
import Logger from '../helpers/Logger.js';

class Mongo {
  static instance = null; // For Singleton pattern

  constructor() {
    if (Mongo.instance) {
      return Mongo.instance;
    }

    this.logger = new Logger('Mongo');
    this.mongoose = mongoose;
    this.mongoose.set('strictQuery', false);

    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbHost = process.env.DB_HOST;
    const dbName = process.env.DB_DATABASE;

    // Validate environment variables 
    if (!dbUser || !dbPassword || !dbHost || !dbName) {
      this.logger.log('Database configuration is missing!');
      throw new Error('Database configuration is missing!');
    }

    const connectionString = `mongodb://${dbUser}:${dbPassword}@${dbHost}:27017/${dbName}`;

    this.mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      authSource: 'admin'
    }).then(() => {
      this.logger.log(`Mongoose connection open on @${dbHost}:27017/${dbName}`);
    }).catch((error) => {
      console.error(`Mongoose connection error: ${error}`);
      this.logger.log(`Mongoose connection error: ${error}`);
    });

    this.connection = this.mongoose.connection;

    this.connection.on('connected', () => {
      console.log(`Mongoose connection open on @${dbHost}:27017/${dbName}`);
    });

    this.connection.on('error', (error) => {
      console.error(`Mongoose default connection error: ${error}`);
    });

    this.connection.on('disconnected', () => {
      console.log(`Mongoose default connection disconnected.`);
    });

    Mongo.instance = this; // Save the instance
  }

  getConnection() {
    return this.connection;
  }
}

export default Mongo;