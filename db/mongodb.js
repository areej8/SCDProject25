const mongoose = require('mongoose');

// Fix deprecation warning
mongoose.set('strictQuery', false);

// Hardcoded MongoDB connection string (as per instructions)
const MONGODB_URI = 'mongodb://localhost:27017/nodevault';

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
    console.log(`🔗 Connecting to MongoDB: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('💡 Make sure MongoDB is running: sudo systemctl start mongod');
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

module.exports = {
  connectDB,
  disconnectDB,
  isConnected,
  Record,
  MONGODB_URI,
  mongoose
};
