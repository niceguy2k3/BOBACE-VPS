/**
 * Script to test FCM message format
 */

require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase
const initializeFirebase = () => {
  try {
    const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
    let serviceAccount;

    if (fs.existsSync(serviceAccountPath)) {
      console.log('Loading Firebase service account from file:', serviceAccountPath);
      serviceAccount = require(serviceAccountPath);
    } else {
      console.log('Service account file not found, attempting to load from environment variables');
      if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error('No Firebase service account file or environment variable found');
      }
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }

    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('Invalid service account configuration: missing required fields');
    }

    console.log('Initializing Firebase Admin SDK with project ID:', serviceAccount.project_id);

    try {
      admin.app();
      console.log('Firebase app already initialized');
      return true;
    } catch (error) {
      // Not initialized, proceed
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
    });

    console.log('Firebase Admin SDK initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
};

async function testFcmMessage() {
  try {
    console.log('Testing FCM message format');
    
    // Initialize Firebase
    const initialized = initializeFirebase();
    if (!initialized) {
      console.error('Failed to initialize Firebase');
      return;
    }
    
    // Create a test token (this won't actually work, but will test the message format)
    const testToken = 'test_token_for_format_validation';
    
    // Create a test message in the correct format
    const message = {
      token: testToken,
      notification: {
        title: 'Test Notification',
        body: 'This is a test notification',
      },
      data: {
        type: 'test',
        linkTo: '/test',
        createdAt: new Date().toISOString(),
      },
      webpush: {
        notification: {
          icon: '/logo192.png',
        },
        fcm_options: {
          link: 'https://bobace.com',
        },
      },
    };
    
    console.log('Test message format:', JSON.stringify(message, null, 2));
    
    try {
      // This will fail because the token is invalid, but it will validate the message format
      await admin.messaging().send(message);
    } catch (error) {
      // We expect an error about the token, not about the message format
      if (error.code === 'messaging/invalid-argument' || error.code === 'messaging/invalid-recipient') {
        console.log('Message format is valid, but token is invalid (as expected)');
      } else if (error.code === 'messaging/invalid-payload') {
        console.error('Message format is invalid:', error.message);
      } else {
        console.error('Unexpected error:', error.code, error.message);
      }
    }
    
    // Try a different format
    console.log('\nTrying alternative format...');
    
    const alternativeMessage = {
      message: {
        token: testToken,
        notification: {
          title: 'Test Notification',
          body: 'This is a test notification',
        },
        data: {
          type: 'test',
          linkTo: '/test',
          createdAt: new Date().toISOString(),
        },
      }
    };
    
    console.log('Alternative message format:', JSON.stringify(alternativeMessage, null, 2));
    
    try {
      await admin.messaging().send(alternativeMessage);
    } catch (error) {
      if (error.code === 'messaging/invalid-argument' || error.code === 'messaging/invalid-recipient') {
        console.log('Alternative message format is valid, but token is invalid (as expected)');
      } else if (error.code === 'messaging/invalid-payload') {
        console.error('Alternative message format is invalid:', error.message);
      } else {
        console.error('Unexpected error:', error.code, error.message);
      }
    }
    
    console.log('\nTest completed');
  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    // Close Firebase connection
    try {
      await admin.app().delete();
      console.log('Firebase app deleted');
    } catch (error) {
      console.error('Error deleting Firebase app:', error.message);
    }
  }
}

testFcmMessage()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Script error:', err);
    process.exit(1);
  });