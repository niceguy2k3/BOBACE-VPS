const express = require('express');
const router = express.Router();
const { isAdmin } = require('../../middlewares/auth.middleware');
const crypto = require('crypto');
const Subscription = require('../../models/subscription.model');
const User = require('../../models/user.model');

// Hàm chuyển đổi base64 sang base64url
function base64ToBase64Url(base64String) {
  return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Hàm tạo khóa ECDH hợp lệ
function generateValidECDHKeys() {
  // Tạo cặp khóa ECDH
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();
  
  // Lấy khóa công khai dưới dạng buffer
  const publicKey = ecdh.getPublicKey();
  
  // Kiểm tra độ dài của khóa (phải là 65 bytes)
  if (publicKey.length !== 65) {
    console.log(`Generated key has invalid length: ${publicKey.length} bytes, regenerating...`);
    return generateValidECDHKeys(); // Tạo lại nếu không đúng độ dài
  }
  
  // Chuyển đổi sang base64 rồi sang base64url
  const base64 = publicKey.toString('base64');
  return base64ToBase64Url(base64);
}

// Hàm tạo auth key hợp lệ
function generateValidAuthKey() {
  // Tạo khóa ngẫu nhiên 16 bytes
  const authKey = crypto.randomBytes(16);
  
  // Chuyển đổi sang base64 rồi sang base64url
  const base64 = authKey.toString('base64');
  return base64ToBase64Url(base64);
}

// Reset tất cả subscription
router.post('/reset-subscriptions', isAdmin, async (req, res) => {
  try {
    console.log('Starting subscription reset...');
    
    // Xóa tất cả subscription hiện tại
    const deleteResult = await Subscription.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing subscriptions`);
    
    // Lấy tất cả người dùng
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    
    // Tạo subscription mới cho mỗi người dùng
    let createdCount = 0;
    
    for (const user of users) {
      const userId = user._id;
      
      // Tạo subscription mới
      const autoEndpoint = `https://auto-generated-endpoint-${crypto.randomBytes(8).toString('hex')}.com`;
      
      // Tạo khóa ECDH hợp lệ
      const p256dh = generateValidECDHKeys();
      const auth = generateValidAuthKey();
      
      const newSubscription = new Subscription({
        user: userId,
        subscription: {
          endpoint: autoEndpoint,
          expirationTime: null,
          keys: {
            auth: auth,
            p256dh: p256dh
          }
        },
        platform: 'web',
        deviceName: 'Auto-registered web device',
        lastActive: new Date()
      });
      
      await newSubscription.save();
      createdCount++;
    }
    
    const result = {
      success: true,
      message: `Reset completed: Created ${createdCount} new subscriptions`,
      stats: {
        deleted: deleteResult.deletedCount,
        created: createdCount
      }
    };
    
    console.log(result);
    res.json(result);
  } catch (error) {
    console.error('Error resetting subscriptions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi reset subscription',
      error: error.message
    });
  }
});

module.exports = router;