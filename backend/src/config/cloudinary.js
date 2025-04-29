const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: 'dtzbug8nl',
  api_key: '252141174213229',
  api_secret: 'RCAnqBUf0mSztAgw38JXyyCPPu4'
});

module.exports = cloudinary;