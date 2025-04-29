/**
 * Script để tạo khóa ECDH hợp lệ cho web-push
 * Chạy với lệnh: node src/scripts/generate-valid-keys.js
 */

const crypto = require('crypto');

// Hàm tạo khóa ECDH hợp lệ
function generateValidKeys() {
  console.log('Generating valid ECDH keys for web-push...');
  
  // Tạo cặp khóa ECDH
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();
  
  // Lấy khóa công khai dưới dạng buffer
  const publicKey = ecdh.getPublicKey();
  
  // Lấy khóa bí mật dưới dạng buffer
  const privateKey = ecdh.getPrivateKey();
  
  // Trả về cặp khóa dưới dạng base64
  return {
    publicKey: publicKey.toString('base64'),
    privateKey: privateKey.toString('base64')
  };
}

// Tạo khóa VAPID
function generateVAPIDKeys() {
  console.log('Generating VAPID keys...');
  
  // Tạo cặp khóa ECDH
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();
  
  // Lấy khóa công khai dưới dạng buffer
  const publicKey = ecdh.getPublicKey();
  
  // Lấy khóa bí mật dưới dạng buffer
  const privateKey = ecdh.getPrivateKey();
  
  // Trả về cặp khóa dưới dạng base64url
  return {
    publicKey: publicKey.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
    privateKey: privateKey.toString('base64')
  };
}

// Tạo khóa p256dh hợp lệ cho subscription
function generateValidP256DHKey() {
  console.log('Generating valid p256dh key for subscription...');
  
  // Tạo cặp khóa ECDH
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();
  
  // Lấy khóa công khai dưới dạng buffer
  const publicKey = ecdh.getPublicKey();
  
  // Trả về khóa công khai dưới dạng base64
  return publicKey.toString('base64');
}

// Tạo khóa auth hợp lệ cho subscription
function generateValidAuthKey() {
  console.log('Generating valid auth key for subscription...');
  
  // Tạo khóa ngẫu nhiên 16 bytes
  const authKey = crypto.randomBytes(16);
  
  // Trả về khóa dưới dạng base64
  return authKey.toString('base64');
}

// Tạo subscription hợp lệ
function generateValidSubscription() {
  console.log('Generating valid subscription object...');
  
  // Tạo endpoint ngẫu nhiên
  const endpoint = `https://fcm.googleapis.com/fcm/send/${crypto.randomBytes(12).toString('hex')}`;
  
  // Tạo khóa p256dh và auth
  const p256dh = generateValidP256DHKey();
  const auth = generateValidAuthKey();
  
  // Trả về subscription
  return {
    endpoint,
    expirationTime: null,
    keys: {
      p256dh,
      auth
    }
  };
}

// Tạo và hiển thị các khóa
const ecdhKeys = generateValidKeys();
console.log('\nValid ECDH Keys:');
console.log('Public Key:', ecdhKeys.publicKey);
console.log('Private Key:', ecdhKeys.privateKey);

const vapidKeys = generateVAPIDKeys();
console.log('\nVAPID Keys:');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);

const p256dh = generateValidP256DHKey();
console.log('\nValid p256dh Key for Subscription:');
console.log(p256dh);

const auth = generateValidAuthKey();
console.log('\nValid auth Key for Subscription:');
console.log(auth);

const subscription = generateValidSubscription();
console.log('\nValid Subscription Object:');
console.log(JSON.stringify(subscription, null, 2));

// Kiểm tra độ dài của khóa p256dh
const p256dhBuffer = Buffer.from(p256dh, 'base64');
console.log('\nP256DH Key Length:', p256dhBuffer.length, 'bytes');

// Kiểm tra độ dài của khóa auth
const authBuffer = Buffer.from(auth, 'base64');
console.log('Auth Key Length:', authBuffer.length, 'bytes');

console.log('\nĐể sửa lỗi web-push, hãy sử dụng hàm generateValidP256DHKey() để tạo khóa p256dh hợp lệ.');
console.log('Khóa p256dh phải là khóa công khai ECDH dưới dạng base64, có độ dài 65 bytes.');