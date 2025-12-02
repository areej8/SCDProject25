const readline = require('readline');
const fs = require('fs');
const path = require('path');
const db = require('./db');
require('./events/logger'); // Initialize event logger

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Search Records Function
function searchRecords() {
  rl.question('Enter search keyword: ', searchTerm => {
    const records = db.listRecords();
    const matches = records.filter(record => 
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toString().includes(searchTerm)
    );

    if (matches.length === 0) {
      console.log('No records found.');
    } else {
      console.log(`Found ${matches.length} matching records:`);
      matches.forEach((record, index) => {
        const createdDate = new Date(record.id).toISOString().split('T')[0];
        console.log(`${index + 1}. ID: ${record.id} | Name: ${record.name} | Created: ${createdDate}`);
      });
    }
    menu();
  });
}

// Sort Records Function
function sortRecords() {
  // Ask for sort field
  rl.question('Choose field to sort by (Name/Date): ', sortField => {
    const normalizedField = sortField.trim().toLowerCase();
    
    if (normalizedField !== 'name' && normalizedField !== 'date') {
      console.log('Invalid field. Please choose either "Name" or "Date".');
      menu();
      return;
    }
    
    // Ask for sort order
    rl.question('Choose order (Ascending/Descending): ', sortOrder => {
      const normalizedOrder = sortOrder.trim().toLowerCase();
      
      if (normalizedOrder !== 'ascending' && normalizedOrder !== 'descending') {
        console.log('Invalid order. Please choose either "Ascending" or "Descending".');
        menu();
        return;
      }
      
      // Get records and sort them
      const records = db.listRecords();
      let sortedRecords = [...records]; // Create a copy to avoid modifying original
      
      if (normalizedField === 'name') {
        // Sort by name
        sortedRecords.sort((a, b) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          if (normalizedOrder === 'ascending') {
            return nameA.localeCompare(nameB);
          } else {
            return nameB.localeCompare(nameA);
          }
        });
      } else {
        // Sort by creation date (ID is timestamp)
        sortedRecords.sort((a, b) => {
          if (normalizedOrder === 'ascending') {
            return a.id - b.id; // Older dates first
          } else {
            return b.id - a.id; // Newer dates first
          }
        });
      }
      
      // Display sorted records
      console.log(`\nSorted Records (${sortField} - ${sortOrder}):`);
      if (sortedRecords.length === 0) {
        console.log('No records to display.');
      } else {
        sortedRecords.forEach((record, index) => {
          if (normalizedField === 'name') {
            console.log(`${index + 1}. ID: ${record.id} | Name: ${record.name}`);
          } else {
            const createdDate = new Date(record.id).toISOString().split('T')[0];
            console.log(`${index + 1}. ID: ${record.id} | Name: ${record.name} | Created: ${createdDate}`);
          }
        });
      }
      
      menu();
    });
  });
}

// Export Data Function
function exportData() {
  const records = db.listRecords();
  const exportFilePath = path.join(__dirname, 'export.txt');
  const exportDate = new Date();
  
  // Format date and time nicely
  const formattedDate = exportDate.toISOString().split('T')[0];
  const formattedTime = exportDate.toTimeString().split(' ')[0];
  
  // Prepare export content
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
      const createdDate = new Date(record.id).toISOString().split('T')[0];
      const createdTime = new Date(record.id).toTimeString().split(' ')[0];
      
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
  
  // Write to file
  try {
    fs.writeFileSync(exportFilePath, exportContent, 'utf8');
    console.log(`✅ Data exported successfully to export.txt`);
    console.log(`📊 Total records exported: ${records.length}`);
    console.log(`📁 File location: ${exportFilePath}`);
  } catch (error) {
    console.log(`❌ Error exporting data: ${error.message}`);
  }
  
  menu();
}

// View Vault Statistics Function
function viewVaultStatistics() {
  const records = db.listRecords();
  const dbFilePath = path.join(__dirname, 'data', 'vault.json');
  
  console.log(`\n╔═══════════════════════════════════════╗`);
  console.log(`║         VAULT STATISTICS             ║`);
  console.log(`╚═══════════════════════════════════════╝`);
  
  // Total number of records
  console.log(`\nTotal Records: ${records.length}`);
  console.log(`--------------------------`);
  
  if (records.length === 0) {
    console.log(`Vault is empty. Add some records to see statistics.`);
    menu();
    return;
  }
  
  // Date and time of the most recent modification (file modification time)
  try {
    const stats = fs.statSync(dbFilePath);
    const lastModified = new Date(stats.mtime);
    const formattedLastModified = `${lastModified.toISOString().split('T')[0]} ${lastModified.toTimeString().split(' ')[0]}`;
    console.log(`Last Modified: ${formattedLastModified}`);
  } catch (error) {
    console.log(`Last Modified: Unable to determine`);
  }
  
  // The longest name (and its length)
  let longestName = '';
  let longestNameLength = 0;
  
  records.forEach(record => {
    if (record.name.length > longestNameLength) {
      longestNameLength = record.name.length;
      longestName = record.name;
    }
  });
  
  console.log(`Longest Name: ${longestName} (${longestNameLength} characters)`);
  
  // The earliest and latest record creation dates
  let earliestDate = new Date(Math.min(...records.map(r => r.id)));
  let latestDate = new Date(Math.max(...records.map(r => r.id)));
  
  console.log(`Earliest Record: ${earliestDate.toISOString().split('T')[0]}`);
  console.log(`Latest Record: ${latestDate.toISOString().split('T')[0]}`);
  
  // Additional Statistics (bonus)
  console.log(`\n📊 Additional Statistics:`);
  console.log(`--------------------------`);
  
  // Average name length
  const totalNameLength = records.reduce((sum, record) => sum + record.name.length, 0);
  const avgNameLength = (totalNameLength / records.length).toFixed(2);
  console.log(`Average Name Length: ${avgNameLength} characters`);
  
  // Date range
  const dateRangeDays = Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24));
  console.log(`Date Range: ${dateRangeDays} day(s)`);
  
  // Records per day (if range > 0)
  if (dateRangeDays > 0) {
    const recordsPerDay = (records.length / dateRangeDays).toFixed(2);
    console.log(`Records per Day: ${recordsPerDay}`);
  }
  
  // Most common name length
  const nameLengths = records.map(r => r.name.length);
  const lengthCounts = {};
  nameLengths.forEach(length => {
    lengthCounts[length] = (lengthCounts[length] || 0) + 1;
  });
  
  const mostCommonLength = Object.keys(lengthCounts).reduce((a, b) => 
    lengthCounts[a] > lengthCounts[b] ? a : b
  );
  console.log(`Most Common Name Length: ${mostCommonLength} characters (${lengthCounts[mostCommonLength]} records)`);
  
  menu();
}

function menu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Export Data
8. View Vault Statistics
9. Exit
=====================
  `);

  rl.question('Choose option: ', ans => {
    switch (ans.trim()) {
      case '1':
        rl.question('Enter name: ', name => {
          rl.question('Enter value: ', value => {
            db.addRecord({ name, value });
            console.log('✅ Record added successfully!');
            menu();
          });
        });
        break;

      case '2':
        const records = db.listRecords();
        if (records.length === 0) console.log('No records found.');
        else records.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`));
        menu();
        break;

      case '3':
        rl.question('Enter record ID to update: ', id => {
          rl.question('New name: ', name => {
            rl.question('New value: ', value => {
              const updated = db.updateRecord(Number(id), name, value);
              console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
              menu();
            });
          });
        });
        break;

      case '4':
        rl.question('Enter record ID to delete: ', id => {
          const deleted = db.deleteRecord(Number(id));
          console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
          menu();
        });
        break;

      case '5':
        searchRecords();
        break;

      case '6':
        sortRecords();
        break;

      case '7':
        exportData();
        break;

      case '8':
        viewVaultStatistics();
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

menu();
