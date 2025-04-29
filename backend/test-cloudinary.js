const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary trực tiếp
cloudinary.config({
  cloud_name: 'dtzbug8nl',
  api_key: '252141174213229',
  api_secret: 'RCAnqBUf0mSztAgw38JXyyCPPu4'
});

// Kiểm tra kết nối
async function testCloudinaryConnection() {
  try {
    console.log('Cloudinary configuration:', cloudinary.config());
    
    // Thử lấy thông tin tài khoản
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection successful:', result);
    
    return true;
  } catch (error) {
    console.error('Cloudinary connection error:', error);
    return false;
  }
}

// Chạy test
testCloudinaryConnection()
  .then(success => {
    if (success) {
      console.log('Cloudinary is configured correctly!');
    } else {
      console.log('Cloudinary configuration failed!');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Test failed with error:', err);
    process.exit(1);
  });