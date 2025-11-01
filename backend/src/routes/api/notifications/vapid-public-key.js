const express = require('express');
const router = express.Router();

// Lấy VAPID public key
router.get('/', (req, res) => {
  try {
    // Lấy VAPID public key từ biến môi trường hoặc sử dụng key mặc định
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 'BGI9uiAxwDw9C8IGsV2uebaH8OdIsGFOPDog5iAm0XeGChG299dCHbJbbIHzLPRpk6pgV7UfzXk2U5vAvmroevM';
    
    // Validate key format
    if (!vapidPublicKey || typeof vapidPublicKey !== 'string' || 
        vapidPublicKey === 'your-vapid-public-key' || vapidPublicKey.length < 50 ||
        !/^[A-Za-z0-9_-]+$/.test(vapidPublicKey)) {
      console.error('Invalid VAPID_PUBLIC_KEY format');
      return res.status(500).json({ 
        message: 'VAPID public key is not configured properly',
        error: 'Invalid key format'
      });
    }
    
    res.json({ publicKey: vapidPublicKey });
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;