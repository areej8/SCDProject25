const fileDB = require('./file');
const recordUtils = require('./record');
const vaultEvents = require('../events');
const backup = require('./backup');

function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });
  const data = fileDB.readDB();
  const newRecord = { id: recordUtils.generateId(), name, value };
  data.push(newRecord);
  fileDB.writeDB(data);
  
  // Create backup after adding record
  backup.createBackup(data, 'add');
  
  vaultEvents.emit('recordAdded', newRecord);
  return newRecord;
}

function listRecords() {
  return fileDB.readDB();
}

function updateRecord(id, newName, newValue) {
  const data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  record.name = newName;
  record.value = newValue;
  fileDB.writeDB(data);
  vaultEvents.emit('recordUpdated', record);
  return record;
}

function deleteRecord(id) {
  let data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  data = data.filter(r => r.id !== id);
  fileDB.writeDB(data);
  
  // Create backup after deleting record
  backup.createBackup(data, 'delete');
  
  vaultEvents.emit('recordDeleted', record);
  return record;
}

// Optional: Add a manual backup function
function createManualBackup() {
  const data = fileDB.readDB();
  return backup.createBackup(data, 'manual');
}

// Optional: Add a restore function
function restoreFromLatestBackup() {
  const latest = backup.getLatestBackup();
  if (!latest) {
    console.log('No backup found to restore from.');
    return false;
  }
  
  try {
    const backupData = JSON.parse(fs.readFileSync(latest.path, 'utf8'));
    fileDB.writeDB(backupData.records);
    console.log(`✅ Restored from backup: ${latest.name}`);
    console.log(`📊 Restored ${backupData.records.length} records`);
    return true;
  } catch (error) {
    console.error(`❌ Restore failed: ${error.message}`);
    return false;
  }
}

module.exports = { 
  addRecord, 
  listRecords, 
  updateRecord, 
  deleteRecord,
  createManualBackup,
  restoreFromLatestBackup
};
