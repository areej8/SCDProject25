const fs = require('fs');
const path = require('path');
const config = require('../config');

const backupsDir = path.resolve(process.cwd(), config.backup.dir);

// Ensure backups directory exists
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
  console.log(`📁 Created backup directory: ${backupsDir}`);
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
        app: config.app.name,
        backupCreated: timestamp.toISOString(),
        operation: operation,
        totalRecords: data.length,
        environment: config.app.env
      },
      records: data
    };
    
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');
    
    console.log(`💾 Backup created: ${backupFileName} (${data.length} records)`);
    
    // Clean up old backups if exceeding max
    cleanupOldBackups();
    
    return backupFilePath;
  } catch (error) {
    console.error(`❌ Backup failed: ${error.message}`);
    return null;
  }
}

function cleanupOldBackups() {
  try {
    if (!fs.existsSync(backupsDir)) {
      return;
    }
    
    const files = fs.readdirSync(backupsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(backupsDir, file),
        time: fs.statSync(path.join(backupsDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Newest first
    
    // Remove files beyond maxBackups limit
    if (files.length > config.backup.maxBackups) {
      const filesToRemove = files.slice(config.backup.maxBackups);
      filesToRemove.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Removed old backup: ${file.name}`);
      });
    }
  } catch (error) {
    console.error(`❌ Backup cleanup error: ${error.message}`);
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

function getBackupStats() {
  try {
    if (!fs.existsSync(backupsDir)) {
      return { count: 0, totalSize: 0 };
    }
    
    const files = fs.readdirSync(backupsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(backupsDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime
        };
      });
    
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    
    return {
      count: files.length,
      totalSize: totalSize,
      files: files
    };
  } catch (error) {
    console.error(`❌ Error getting backup stats: ${error.message}`);
    return { count: 0, totalSize: 0 };
  }
}

module.exports = { 
  createBackup, 
  getLatestBackup, 
  getBackupStats,
  backupsDir,
  cleanupOldBackups
};
