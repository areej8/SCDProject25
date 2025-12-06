const { Record, connectDB, isConnected } = require('./mongodb');
const backup = require('./backup');
const vaultEvents = require('../events');

// Database connection state
let dbInitialized = false;

// Initialize database connection
async function initializeDB() {
  if (!dbInitialized) {
    console.log('🔄 Initializing MongoDB database...');
    dbInitialized = await connectDB();
    if (dbInitialized) {
      console.log('✅ MongoDB database ready');
    } else {
      console.log('⚠️  MongoDB connection failed');
    }
  }
  return dbInitialized;
}

// Helper function to convert MongoDB document to app format
function formatRecord(record) {
  return {
    id: record._id.toString(),
    name: record.name,
    value: record.value,
    createdAt: record.createdAt.getTime()
  };
}

// Wait for database to be ready
async function ensureDB() {
  if (!isConnected()) {
    await initializeDB();
  }
  return isConnected();
}

// MongoDB Database Functions
async function addRecord({ name, value }) {
  const connected = await ensureDB();
  if (!connected) {
    throw new Error('Database not connected. Please check MongoDB service.');
  }
  
  try {
    const record = new Record({ name, value });
    await record.save();
    
    // Create backup
    const allRecords = await listRecords();
    backup.createBackup(allRecords, 'add');
    
    vaultEvents.emit('recordAdded', record);
    
    console.log(`✅ Record added to MongoDB: ${name}`);
    return formatRecord(record);
  } catch (error) {
    console.error('❌ Error adding record to MongoDB:', error.message);
    throw error;
  }
}

async function listRecords() {
  const connected = await ensureDB();
  if (!connected) {
    console.log('⚠️  Database not connected, returning empty list');
    return [];
  }
  
  try {
    const records = await Record.find({}).sort({ createdAt: -1 });
    return records.map(formatRecord);
  } catch (error) {
    console.error('❌ Error listing records from MongoDB:', error.message);
    return [];
  }
}

async function updateRecord(id, newName, newValue) {
  const connected = await ensureDB();
  if (!connected) {
    console.log('⚠️  Database not connected');
    return null;
  }
  
  try {
    const record = await Record.findById(id);
    if (!record) {
      console.log(`⚠️  Record with ID ${id} not found in MongoDB`);
      return null;
    }
    
    record.name = newName;
    record.value = newValue;
    await record.save();
    
    vaultEvents.emit('recordUpdated', record);
    
    console.log(`✅ Record updated in MongoDB: ${newName}`);
    return formatRecord(record);
  } catch (error) {
    console.error('❌ Error updating record in MongoDB:', error.message);
    return null;
  }
}

async function deleteRecord(id) {
  const connected = await ensureDB();
  if (!connected) {
    console.log('⚠️  Database not connected');
    return null;
  }
  
  try {
    const record = await Record.findByIdAndDelete(id);
    if (!record) {
      console.log(`⚠️  Record with ID ${id} not found in MongoDB`);
      return null;
    }
    
    // Create backup after deletion
    const allRecords = await listRecords();
    backup.createBackup(allRecords, 'delete');
    
    vaultEvents.emit('recordDeleted', record);
    
    console.log(`✅ Record deleted from MongoDB: ${record.name}`);
    return formatRecord(record);
  } catch (error) {
    console.error('❌ Error deleting record from MongoDB:', error.message);
    return null;
  }
}

// Additional functions
async function getRecordCount() {
  const connected = await ensureDB();
  if (!connected) return 0;
  
  try {
    return await Record.countDocuments();
  } catch (error) {
    console.error('❌ Error counting records in MongoDB:', error.message);
    return 0;
  }
}

async function clearAllRecords() {
  const connected = await ensureDB();
  if (!connected) return false;
  
  try {
    await Record.deleteMany({});
    console.log('✅ All records cleared from MongoDB');
    return true;
  } catch (error) {
    console.error('❌ Error clearing records from MongoDB:', error.message);
    return false;
  }
}

// Keep existing functions for compatibility
function createManualBackup() {
  console.log('Manual backup function - needs records to be passed');
  return null;
}

async function restoreFromLatestBackup() {
  console.log('Restore function not implemented for MongoDB yet');
  return false;
}

// Initialize on require
initializeDB().then(initialized => {
  if (initialized) {
    console.log('📊 Database module loaded successfully');
  }
});

module.exports = { 
  addRecord, 
  listRecords, 
  updateRecord, 
  deleteRecord,
  createManualBackup,
  restoreFromLatestBackup,
  getRecordCount,
  clearAllRecords,
  initializeDB
};
