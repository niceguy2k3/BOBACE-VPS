const express = require('express');
const router = express.Router();
const { isAdmin } = require('../../middlewares/auth.middleware');
const crypto = require('crypto');
const Subscription = require('../../models/subscription.model.js');
const Device = require('../../models/device.model.js');

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

// Sửa chữa các subscription không hợp lệ
router.post('/fix-subscriptions', isAdmin, async (req, res) => {
  try {
    console.log('Starting subscription repair...');
    
    // Lấy tất cả subscription
    const subscriptions = await Subscription.find({});
    console.log(`Found ${subscriptions.length} subscriptions`);
    
    // Đếm số lượng subscription không hợp lệ
    let invalidCount = 0;
    let fixedCount = 0;
    let deletedCount = 0;
    
    for (const sub of subscriptions) {
      // Kiểm tra subscription có hợp lệ không
      let isValid = true;
      
      try {
        // Kiểm tra subscription có đầy đủ thông tin không
        if (!sub.subscription || !sub.subscription.endpoint || !sub.subscription.keys) {
          isValid = false;
        } else {
          // Kiểm tra keys có đầy đủ thông tin không
          if (!sub.subscription.keys.auth || !sub.subscription.keys.p256dh) {
            isValid = false;
          } else {
            // Kiểm tra p256dh có đúng độ dài không
            try {
              const p256dh = sub.subscription.keys.p256dh;
              const p256dhBuffer = Buffer.from(p256dh, 'base64');
              
              // Thử tạo một đối tượng ECDH và đặt khóa công khai
              const ecdh = crypto.createECDH('prime256v1');
              ecdh.setPublicKey(p256dhBuffer);
            } catch (ecdhError) {
              console.log(`Invalid p256dh key: ${ecdhError.message}`);
              isValid = false;
            }
          }
        }
      } catch (error) {
        console.error('Error validating subscription:', error);
        isValid = false;
      }
      
      if (!isValid) {
        invalidCount++;
        console.log(`Found invalid subscription for user ${sub.user}`);
        
        // Xóa subscription không hợp lệ
        await Subscription.deleteOne({ _id: sub._id });
        deletedCount++;
        
        // Tạo subscription mới cho người dùng
        const device = await Device.findOne({ user: sub.user });
        
        if (device) {
          // Tạo subscription mới
          const autoEndpoint = `https://auto-generated-endpoint-${crypto.randomBytes(8).toString('hex')}.com`;
          
          // Tạo khóa ECDH hợp lệ
          const p256dh = generateValidECDHKeys();
          
          const newSubscription = new Subscription({
            user: sub.user,
            subscription: {
              endpoint: autoEndpoint,
              expirationTime: null,
              keys: {
                auth: generateValidAuthKey(),
                p256dh: p256dh
              }
            },
            platform: 'web',
            deviceName: 'Auto-registered web device',
            lastActive: new Date()
          });
          
          await newSubscription.save();
          fixedCount++;
          console.log(`Created new subscription for user ${sub.user}`);
        }
      }
    }
    
    const result = {
      success: true,
      message: `Repair completed: ${invalidCount} invalid subscriptions found`,
      stats: {
        total: subscriptions.length,
        invalid: invalidCount,
        deleted: deletedCount,
        fixed: fixedCount
      }
    };
    
    console.log(result);
    res.json(result);
  } catch (error) {
    console.error('Error fixing subscriptions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi sửa chữa subscription',
      error: error.message
    });
  }
});

module.exports = router;