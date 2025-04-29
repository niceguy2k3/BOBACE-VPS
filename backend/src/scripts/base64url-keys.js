/**
 * Script để tạo khóa base64url hợp lệ cho web-push
 * Chạy với lệnh: node src/scripts/base64url-keys.js
 */

const crypto = require('crypto');

// Hàm chuyển đổi base64 sang base64url
function base64ToBase64Url(base64String) {
  return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Hàm tạo khóa ECDH hợp lệ dưới dạng base64url
function generateValidBase64UrlKey() {
  // Tạo cặp khóa ECDH
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();
  
  // Lấy khóa công khai dưới dạng buffer
  const publicKey = ecdh.getPublicKey();
  
  // Kiểm tra độ dài của khóa (phải là 65 bytes)
  if (publicKey.length !== 65) {
    console.log(`Generated key has invalid length: ${publicKey.length} bytes, regenerating...`);
    return generateValidBase64UrlKey(); // Tạo lại nếu không đúng độ dài
  }
  
  // Chuyển đổi sang base64 rồi sang base64url
  const base64 = publicKey.toString('base64');
  const base64url = base64ToBase64Url(base64);
  
  return {
    base64: base64,
    base64url: base64url
  };
}

// Hàm tạo auth key dưới dạng base64url
function generateValidAuthKey() {
  // Tạo khóa ngẫu nhiên 16 bytes
  const authKey = crypto.randomBytes(16);
  
  // Chuyển đổi sang base64 rồi sang base64url
  const base64 = authKey.toString('base64');
  const base64url = base64ToBase64Url(base64);
  
  return {
    base64: base64,
    base64url: base64url
  };
}

// Tạo và hiển thị các khóa
console.log('Generating valid p256dh key...');
const p256dhKey = generateValidBase64UrlKey();
console.log('p256dh key (base64):', p256dhKey.base64);
console.log('p256dh key (base64url):', p256dhKey.base64url);

console.log('\nGenerating valid auth key...');
const authKey = generateValidAuthKey();
console.log('auth key (base64):', authKey.base64);
console.log('auth key (base64url):', authKey.base64url);

// Tạo subscription mẫu
const subscription = {
  endpoint: `https://fcm.googleapis.com/fcm/send/${crypto.randomBytes(12).toString('hex')}`,
  expirationTime: null,
  keys: {
    p256dh: p256dhKey.base64url,
    auth: authKey.base64url
  }
};

console.log('\nValid subscription object:');
console.log(JSON.stringify(subscription, null, 2));

// Kiểm tra độ dài của khóa p256dh
const p256dhBuffer = Buffer.from(p256dhKey.base64, 'base64');
console.log('\nP256DH Key Length:', p256dhBuffer.length, 'bytes');

// Kiểm tra độ dài của khóa auth
const authBuffer = Buffer.from(authKey.base64, 'base64');
console.log('Auth Key Length:', authBuffer.length, 'bytes');

console.log('\nĐể sửa lỗi web-push, hãy sử dụng hàm base64ToBase64Url() để chuyển đổi khóa sang định dạng base64url.');