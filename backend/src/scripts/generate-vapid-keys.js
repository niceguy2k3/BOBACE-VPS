/**
 * Script để tạo VAPID keys mới cho web-push
 * Chạy với lệnh: node src/scripts/generate-vapid-keys.js
 */

const webpush = require('web-push');

// Tạo VAPID keys mới
const vapidKeys = webpush.generateVAPIDKeys();

console.log('Đã tạo VAPID keys mới:');
console.log('======================');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
console.log('======================');
console.log('Hãy cập nhật các khóa này trong file .env của bạn:');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);