const readline = require('readline');
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

function menu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Exit
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
