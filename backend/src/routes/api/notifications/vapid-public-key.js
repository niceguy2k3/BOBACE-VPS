const express = require('express');
const router = express.Router();

// Lấy VAPID public key
router.get('/', (req, res) => {
  try {
    // Lấy VAPID public key từ biến môi trường hoặc sử dụng key mặc định
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 'BL1KlibuyrMrW-NGZiHWdG8GdneqZrcKC1lmu1Uyvn7TbAd0CvFfzWAtu8lqwkK3fhnV3s02cQlPjESJnCpe_wI';
    
    res.json({ publicKey: vapidPublicKey });
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;