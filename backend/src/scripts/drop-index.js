const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Get the blindates collection
    const db = mongoose.connection.db;
    const blindatesCollection = db.collection('blindates');
    
    // Drop the problematic index
    await blindatesCollection.dropIndex('users_1_isActive_1');
    console.log('Successfully dropped the index users_1_isActive_1');
  } catch (error) {
    if (error.code === 27) {
      console.log('Index does not exist, nothing to drop');
    } else {
      console.error('Error dropping index:', error);
    }
  }
  
  // Close the connection
  mongoose.connection.close();
  console.log('Disconnected from MongoDB');
  process.exit(0);
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});