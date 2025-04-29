const cloudinary = require('../config/cloudinary');
const fs = require('fs');

/**
 * Tải lên hình ảnh lên Cloudinary
 * @param {string} filePath - Đường dẫn đến file cần tải lên
 * @param {string} folder - Thư mục trên Cloudinary để lưu trữ file
 * @returns {Promise} - Kết quả tải lên từ Cloudinary
 */
exports.uploadToCloudinary = (filePath, folder = 'uploads') => {
  console.log('Uploading to Cloudinary:', filePath, 'to folder:', folder);
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: folder,
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
        overwrite: false
      },
      (error, result) => {
        // Xóa file tạm sau khi tải lên
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Temporary file deleted:', filePath);
        } else {
          console.log('Temporary file not found:', filePath);
        }

        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        
        console.log('Cloudinary upload success, URL:', result.secure_url);
        return resolve(result);
      }
    );
  });
};

/**
 * Xóa hình ảnh từ Cloudinary
 * @param {string} publicId - Public ID của hình ảnh trên Cloudinary
 * @returns {Promise} - Kết quả xóa từ Cloudinary
 */
exports.deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
};

/**
 * Lấy public ID từ URL Cloudinary
 * @param {string} url - URL của hình ảnh trên Cloudinary
 * @returns {string} - Public ID của hình ảnh
 */
exports.getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  try {
    // Lấy phần path từ URL
    const urlPath = url.split('/').slice(3).join('/');
    
    // Lấy public ID (bỏ phần mở rộng file)
    const publicId = urlPath.split('.')[0];
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};