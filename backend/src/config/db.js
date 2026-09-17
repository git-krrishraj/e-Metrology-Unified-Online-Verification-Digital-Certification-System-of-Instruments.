import mongoose from 'mongoose';
import { seedDatabase } from '../utils/seedData.js';

let mongodInstance = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/legal_metrology';

  try {
    // Attempt connecting to the configured MongoDB URI (local or Atlas) with a 2-second timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
    
    // Auto-seed if empty
    await seedDatabase(true);
  } catch (error) {
    console.warn(`⚠️  Could not connect to external MongoDB at ${uri} (${error.message}).`);
    console.log('🔄 Initializing in-memory embedded MongoDB Server for instant plug-and-play operation...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ Embedded MongoDB Server active at: ${memoryUri}`);
      
      // Auto seed sample data
      await seedDatabase(true);
    } catch (memError) {
      console.error(`❌ Critical DB Error: Failed to start embedded MongoDB (${memError.message})`);
      process.exit(1);
    }
  }
};
