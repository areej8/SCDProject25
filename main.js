const readline = require('readline');
const fs = require('fs');
const path = require('path');
const db = require('./db');
require('./events/logger');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Search Records Function
async function searchRecords() {
  const searchTerm = await new Promise(resolve => {
    rl.question('Enter search keyword: ', resolve);
  });
  
  const records = await db.listRecords();
  const matches = records.filter(record => 
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.id.toString().includes(searchTerm)
  );

  if (matches.length === 0) {
    console.log('No records found.');
  } else {
    console.log(`Found ${matches.length} matching records:`);
    matches.forEach((record, index) => {
      const createdDate = new Date(record.createdAt).toISOString().split('T')[0];
      console.log(`${index + 1}. ID: ${record.id} | Name: ${record.name} | Created: ${createdDate}`);
    });
  }
  menu();
}

// Sort Records Function
async function sortRecords() {
  const sortField = await new Promise(resolve => {
    rl.question('Choose field to sort by (Name/Date): ', resolve);
  });
  
  const normalizedField = sortField.trim().toLowerCase();
  
  if (normalizedField !== 'name' && normalizedField !== 'date') {
    console.log('Invalid field. Please choose either "Name" or "Date".');
    menu();
    return;
  }
  
  const sortOrder = await new Promise(resolve => {
    rl.question('Choose order (Ascending/Descending): ', resolve);
  });
  
  const normalizedOrder = sortOrder.trim().toLowerCase();
  
  if (normalizedOrder !== 'ascending' && normalizedOrder !== 'descending') {
    console.log('Invalid order. Please choose either "Ascending" or "Descending".');
    menu();
    return;
  }
  
  const records = await db.listRecords();
  let sortedRecords = [...records];
  
  if (normalizedField === 'name') {
    sortedRecords.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return normalizedOrder === 'ascending' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  } else {
    sortedRecords.sort((a, b) => {
      return normalizedOrder === 'ascending' 
        ? a.createdAt - b.createdAt
        : b.createdAt - a.createdAt;
    });
  }
  
  console.log(`\nSorted Records (${sortField} - ${sortOrder}):`);
  if (sortedRecords.length === 0) {
    console.log('No records to display.');
  } else {
    sortedRecords.forEach((record, index) => {
      if (normalizedField === 'name') {
        console.log(`${index + 1}. ID: ${record.id} | Name: ${record.name}`);
      } else {
        const createdDate = new Date(record.createdAt).toISOString().split('T')[0];
        console.log(`${index + 1}. ID: ${record.id} | Name: ${record.name} | Created: ${createdDate}`);
      }
    });
  }
  
  menu();
}

// Export Data Function
async function exportData() {
  const records = await db.listRecords();
  const exportFilePath = path.join(__dirname, 'export.txt');
  const exportDate = new Date();
  
  const formattedDate = exportDate.toISOString().split('T')[0];
  const formattedTime = exportDate.toTimeString().split(' ')[0];
  
  let exportContent = `===========================================\n`;
  exportContent += `          NODEVAULT DATA EXPORT\n`;
  exportContent += `===========================================\n`;
  exportContent += `Export Date: ${formattedDate}\n`;
  exportContent += `Export Time: ${formattedTime}\n`;
  exportContent += `Total Records: ${records.length}\n`;
  exportContent += `File: export.txt\n`;
  exportContent += `===========================================\n\n`;
  
  if (records.length === 0) {
    exportContent += `No records found in the vault.\n`;
  } else {
    exportContent += `RECORDS LIST:\n`;
    exportContent += `===========================================\n`;
    
    records.forEach((record, index) => {
      const createdDate = new Date(record.createdAt).toISOString().split('T')[0];
      const createdTime = new Date(record.createdAt).toTimeString().split(' ')[0];
      
      exportContent += `\nRECORD #${index + 1}\n`;
      exportContent += `-------------------------------------------\n`;
      exportContent += `ID:        ${record.id}\n`;
      exportContent += `Name:      ${record.name}\n`;
      exportContent += `Value:     ${record.value}\n`;
      exportContent += `Created:   ${createdDate} ${createdTime}\n`;
    });
    
    exportContent += `\n===========================================\n`;
    exportContent += `End of Export - ${records.length} record(s) total\n`;
  }
  
  try {
    fs.writeFileSync(exportFilePath, exportContent, 'utf8');
    console.log(`✅ Data exported successfully to export.txt`);
    console.log(`📊 Total records exported: ${records.length}`);
  } catch (error) {
    console.log(`❌ Error exporting data: ${error.message}`);
  }
  
  menu();
}

// View Vault Statistics Function
async function viewVaultStatistics() {
  const records = await db.listRecords();
  const dbFilePath = path.join(__dirname, 'data', 'vault.json');
  
  console.log(`\n╔═══════════════════════════════════════╗`);
  console.log(`║         VAULT STATISTICS             ║`);
  console.log(`╚═══════════════════════════════════════╝`);
  
  console.log(`\nTotal Records: ${records.length}`);
  console.log(`--------------------------`);
  
  if (records.length === 0) {
    console.log(`Vault is empty. Add some records to see statistics.`);
    menu();
    return;
  }
  
  // Last modified (approximate - using latest record's update time)
  if (records.length > 0) {
    const latestRecord = records[0]; // Already sorted by newest first
    const lastModified = new Date(latestRecord.createdAt);
    const formattedLastModified = `${lastModified.toISOString().split('T')[0]} ${lastModified.toTimeString().split(' ')[0]}`;
    console.log(`Last Modified: ${formattedLastModified}`);
  }
  
  // Longest name
  let longestName = '';
  let longestNameLength = 0;
  
  records.forEach(record => {
    if (record.name.length > longestNameLength) {
      longestNameLength = record.name.length;
      longestName = record.name;
    }
  });
  
  console.log(`Longest Name: ${longestName} (${longestNameLength} characters)`);
  
  // Earliest and latest dates
  let earliestDate = new Date(Math.min(...records.map(r => r.createdAt)));
  let latestDate = new Date(Math.max(...records.map(r => r.createdAt)));
  
  console.log(`Earliest Record: ${earliestDate.toISOString().split('T')[0]}`);
  console.log(`Latest Record: ${latestDate.toISOString().split('T')[0]}`);
  
  menu();
}

// Main menu function
function menu() {
  console.log(`
===== NodeVault (MongoDB) =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Export Data
8. View Vault Statistics
9. Exit
===============================
  `);

  rl.question('Choose option: ', async (ans) => {
    switch (ans.trim()) {
      case '1':
        const name = await new Promise(resolve => {
          rl.question('Enter name: ', resolve);
        });
        const value = await new Promise(resolve => {
          rl.question('Enter value: ', resolve);
        });
        try {
          await db.addRecord({ name, value });
          console.log('✅ Record added successfully!');
        } catch (error) {
          console.log('❌ Error adding record:', error.message);
        }
        menu();
        break;

      case '2':
        const records = await db.listRecords();
        if (records.length === 0) {
          console.log('No records found.');
        } else {
          records.forEach(r => {
            const createdDate = new Date(r.createdAt).toISOString().split('T')[0];
            console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${createdDate}`);
          });
        }
        menu();
        break;

      case '3':
        const updateId = await new Promise(resolve => {
          rl.question('Enter record ID to update: ', resolve);
        });
        const newName = await new Promise(resolve => {
          rl.question('New name: ', resolve);
        });
        const newValue = await new Promise(resolve => {
          rl.question('New value: ', resolve);
        });
        const updated = await db.updateRecord(updateId, newName, newValue);
        console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
        menu();
        break;

      case '4':
        const deleteId = await new Promise(resolve => {
          rl.question('Enter record ID to delete: ', resolve);
        });
        const deleted = await db.deleteRecord(deleteId);
        console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
        menu();
        break;

      case '5':
        await searchRecords();
        break;

      case '6':
        await sortRecords();
        break;

      case '7':
        await exportData();
        break;

      case '8':
        await viewVaultStatistics();
        break;

      case '9':
        console.log('👋 Exiting NodeVault...');
        rl.close();
        break;

      default:
        console.log('Invalid option.');
        menu();
    }
  });
}

// Start the application
console.log('🚀 Starting NodeVault with MongoDB...');
setTimeout(() => {
  menu();
}, 1000);
