const fs = require('fs');
const path = require('path');

const backupsDir = path.join(__dirname, '..', 'backups');

// Ensure backups directory exists
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

function createBackup(data, operation) {
  try {
    const timestamp = new Date();
    const dateStr = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    
    const backupFileName = `backup_${dateStr}_${timeStr}_${operation}.json`;
    const backupFilePath = path.join(backupsDir, backupFileName);
    
    const backupData = {
      metadata: {
        backupCreated: timestamp.toISOString(),
        operation: operation,
        totalRecords: data.length
      },
      records: data
    };
    
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');
    
    console.log(`💾 Backup created: ${backupFileName} (${data.length} records)`);
    return backupFilePath;
  } catch (error) {
    console.error(`❌ Backup failed: ${error.message}`);
    return null;
  }
}

function getLatestBackup() {
  try {
    if (!fs.existsSync(backupsDir)) {
      return null;
    }
    
    const files = fs.readdirSync(backupsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(backupsDir, file),
        time: fs.statSync(path.join(backupsDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
    
    return files.length > 0 ? files[0] : null;
  } catch (error) {
    console.error(`❌ Error finding backup: ${error.message}`);
    return null;
  }
}

module.exports = { createBackup, getLatestBackup, backupsDir };
