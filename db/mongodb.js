const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

// Fix deprecation warning
mongoose.set('strictQuery', false);

// Get MongoDB connection string from environment variable
const MONGODB_URI = process.env.MONGODB_URI;

// Validate environment variable
if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI is not defined in .env file');
  console.log('💡 Please create a .env file with MONGODB_URI=mongodb://localhost:27017/nodevault');
  console.log('💡 Or copy .env.example to .env and update the values');
  process.exit(1);
}

// Record Schema
const recordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Create model
const Record = mongoose.model('Record', recordSchema);

// Connect to MongoDB
async function connectDB() {
  try {
    // Hide password in logs for security
    const displayUri = MONGODB_URI.replace(/:([^:]+)@/, ':****@');
    console.log(`🔗 Connecting to MongoDB: ${displayUri}`);
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Log database info
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      console.log(`📊 Database: ${db.databaseName}`);
      console.log(`📊 Collections: ${collections.map(c => c.name).join(', ')}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('\n💡 Troubleshooting steps:');
    console.log('   1. Check if MongoDB is running: sudo systemctl status mongod');
    console.log('   2. Verify .env file has correct MONGODB_URI');
    console.log('   3. Default: mongodb://localhost:27017/nodevault');
    console.log('   4. Check firewall/network settings');
    return false;
  }
}

// Disconnect from MongoDB
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error.message);
  }
}

// Check if connected
function isConnected() {
  return mongoose.connection.readyState === 1;
}

// Get connection info (for debugging)
function getConnectionInfo() {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    state: states[state] || 'unknown',
    host: mongoose.connection.host || 'unknown',
    port: mongoose.connection.port || 'unknown',
    database: mongoose.connection.name || 'unknown'
  };
}

module.exports = {
  connectDB,
  disconnectDB,
  isConnected,
  getConnectionInfo,
  Record,
  MONGODB_URI,
  mongoose
};
