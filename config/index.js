require('dotenv').config();

const config = {
  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nodevault',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    }
  },
  
  // Application Configuration
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'NodeVault'
  },
  
  // Backup Configuration
  backup: {
    dir: process.env.BACKUP_DIR || './backups',
    maxBackups: parseInt(process.env.MAX_BACKUPS) || 10
  },
  
  // Validation
  validate: function() {
    const errors = [];
    
    if (!this.mongodb.uri) {
      errors.push('MONGODB_URI is required in .env file');
    }
    
    if (errors.length > 0) {
      console.error('❌ Configuration errors:');
      errors.forEach(error => console.error(`   - ${error}`));
      console.log('\n💡 Please check your .env file or copy .env.example to .env');
      return false;
    }
    
    return true;
  },
  
  // Print configuration (safe version - hides passwords)
  print: function() {
    const safeUri = this.mongodb.uri.replace(/:([^:]+)@/, ':****@');
    
    console.log('📋 Application Configuration:');
    console.log('=============================');
    console.log(`   Environment: ${this.app.env}`);
    console.log(`   App Name: ${this.app.name}`);
    console.log(`   Port: ${this.app.port}`);
    console.log(`   MongoDB: ${safeUri}`);
    console.log(`   Backup Dir: ${this.backup.dir}`);
    console.log(`   Max Backups: ${this.backup.maxBackups}`);
    console.log('=============================\n');
  }
};

// Validate configuration on load
if (!config.validate()) {
  process.exit(1);
}

// Print config in development
if (config.app.env === 'development') {
  config.print();
}

module.exports = config;
