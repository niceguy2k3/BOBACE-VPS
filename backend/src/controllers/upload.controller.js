const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

// Configure Cloudinary with direct values
cloudinary.config({
  cloud_name: 'dtzbug8nl',
  api_key: '252141174213229',
  api_secret: 'RCAnqBUf0mSztAgw38JXyyCPPu4'
});

// Log Cloudinary configuration for debugging
console.log('Cloudinary Configuration:', cloudinary.config());

// Test Cloudinary connection
cloudinary.api.ping()
  .then(result => {
    console.log('Cloudinary connection successful:', result);
  })
  .catch(error => {
    console.error('Cloudinary connection error:', error);
  });

// Configure storage with explicit cloudinary instance
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'user_images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1000, crop: 'limit' }]
  }
});

// Configure storage for avatar with explicit cloudinary instance
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'face' }
    ]
  }
});

// Configure storage for verification photos
const verificationStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'verification_photos',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' }
    ]
  }
});

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  // Danh sách các MIME type hợp lệ
  const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  // Kiểm tra MIME type
  const isValidMimeType = validMimeTypes.includes(file.mimetype);
  
  console.log('File upload info:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    isValidMimeType
  });
  
  // Xử lý file blob từ camera hoặc các nguồn khác
  if (file.originalname === 'blob' && isValidMimeType) {
    // Thêm phần mở rộng phù hợp dựa trên MIME type
    const mimeToExt = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif'
    };
    
    // Đổi tên file để có phần mở rộng phù hợp
    const newExt = mimeToExt[file.mimetype] || '.jpg';
    file.originalname = `image-${Date.now()}${newExt}`;
    
    console.log('Renamed blob file to:', file.originalname);
    return cb(null, true);
  }
  
  // Đối với các file khác, chỉ kiểm tra MIME type
  if (isValidMimeType) {
    return cb(null, true);
  }
  
  cb(new Error(`Chỉ chấp nhận file hình ảnh (jpg, jpeg, png, gif). File của bạn: ${file.mimetype}`));
};

// Configure upload middleware for single image
const uploadSingle = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: imageFileFilter
}).single('image');

// Configure upload middleware for avatar
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: imageFileFilter
}).single('avatar');

// Configure upload middleware for multiple images
const uploadMultiple = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  },
  fileFilter: imageFileFilter
}).array('images', 6); // Maximum 6 images

// Configure upload middleware for verification photo
const uploadVerification = multer({
  storage: verificationStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: imageFileFilter
}).single('verification');

// Upload single image
exports.uploadImage = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({ 
        message: err.message || 'Có lỗi xảy ra khi tải lên hình ảnh' 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn một hình ảnh để tải lên' });
    }
    
    // Return the uploaded image URL
    res.status(200).json({
      url: req.file.path,
      publicId: req.file.filename
    });
  });
};

// Upload avatar
exports.uploadAvatar = (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) {
      console.error('Upload avatar error:', err);
      return res.status(400).json({ 
        message: err.message || 'Có lỗi xảy ra khi tải lên ảnh đại diện' 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn một ảnh đại diện để tải lên' });
    }
    
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!req.user || !req.user._id) {
      console.log('User not authenticated or user ID missing');
      // Trả về URL của ảnh đã tải lên mà không cập nhật database
      return res.status(200).json({
        avatar: req.file.path,
        publicId: req.file.filename,
        message: 'Tải lên ảnh đại diện thành công, nhưng không thể cập nhật hồ sơ (người dùng chưa đăng nhập)'
      });
    }
    
    console.log('Updating avatar for user:', req.user._id);
    console.log('Avatar path:', req.file.path);
    
    // Update user's avatar in database
    const User = require('../models/user.model');
    User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true }
    )
    .then(updatedUser => {
      if (!updatedUser) {
        console.log('User not found in database');
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
      
      res.status(200).json({
        avatar: req.file.path,
        publicId: req.file.filename,
        message: 'Cập nhật ảnh đại diện thành công'
      });
    })
    .catch(error => {
      console.error('Error updating user avatar:', error);
      next(error);
    });
  });
};

// Upload multiple images (max 6)
exports.uploadMultipleImages = (req, res, next) => {
  uploadMultiple(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        message: err.message || 'Có lỗi xảy ra khi tải lên hình ảnh' 
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Vui lòng chọn ít nhất một hình ảnh để tải lên' });
    }
    
    try {
      // Get current user
      const User = require('../models/user.model');
      const user = await User.findById(req.user._id);
      
      // Check if user already has photos and if adding new ones would exceed limit
      const currentPhotoCount = user.photos ? user.photos.length : 0;
      if (currentPhotoCount + req.files.length > 6) {
        return res.status(400).json({ 
          message: `Bạn chỉ có thể tải lên tối đa 6 ảnh. Hiện tại bạn đã có ${currentPhotoCount} ảnh.` 
        });
      }
      
      // Get URLs of uploaded images
      const uploadedImages = req.files.map(file => file.path);
      
      // Update user's photos in database
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $push: { photos: { $each: uploadedImages } } },
        { new: true }
      );
      
      res.status(200).json({
        photos: updatedUser.photos,
        message: 'Tải lên hình ảnh thành công'
      });
    } catch (error) {
      next(error);
    }
  });
};

// Delete image
// Upload verification photo
exports.uploadVerificationPhoto = (req, res, next) => {
  uploadVerification(req, res, async (err) => {
    if (err) {
      console.error('Upload verification photo error:', err);
      return res.status(400).json({ 
        message: err.message || 'Có lỗi xảy ra khi tải lên ảnh xác minh' 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn một ảnh để xác minh' });
    }
    
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!req.user || !req.user._id) {
      console.log('User not authenticated or user ID missing');
      return res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện chức năng này' });
    }
    
    console.log('Uploading verification photo for user:', req.user._id);
    console.log('Verification photo path:', req.file.path);
    
    try {
      // Update user's verification info in database
      const User = require('../models/user.model');
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { 
          'verification.selfiePhoto': req.file.path,
          'verification.verificationStatus': 'pending'
        },
        { new: true }
      );
      
      if (!updatedUser) {
        console.log('User not found in database');
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
      
      // Gửi thông báo cho tất cả admin về việc có người dùng cần xác minh
      try {
        const notificationController = require('./notification.controller');
        
        // Tìm tất cả admin
        const admins = await User.find({ role: { $in: ['admin', 'moderator'] } }).select('_id');
        
        if (admins && admins.length > 0) {
          // Tạo thông báo cho từng admin
          for (const admin of admins) {
            await notificationController.createNotification(admin._id, {
              type: 'system',
              text: `Người dùng ${updatedUser.fullName} đã tải lên ảnh xác minh và đang chờ duyệt.`,
              linkTo: `/admin/users/${updatedUser._id}`
            });
          }
          console.log(`Đã gửi thông báo xác minh đến ${admins.length} quản trị viên`);
        } else {
          console.log('Không tìm thấy quản trị viên để gửi thông báo');
        }
      } catch (notifyError) {
        console.error('Error sending notification to admins:', notifyError);
        // Không trả về lỗi cho người dùng vì đây chỉ là lỗi phụ
      }
      
      res.status(200).json({
        verificationPhoto: req.file.path,
        publicId: req.file.filename,
        message: 'Tải lên ảnh xác minh thành công. Vui lòng chờ quản trị viên xác nhận.'
      });
    } catch (error) {
      console.error('Error updating user verification photo:', error);
      next(error);
    }
  });
};

// Upload avatar for registration (no authentication required)
exports.uploadAvatarForRegistration = (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) {
      console.error('Upload avatar error:', err);
      return res.status(400).json({ 
        message: err.message || 'Có lỗi xảy ra khi tải lên ảnh đại diện' 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn một ảnh đại diện để tải lên' });
    }
    
    // Return the uploaded avatar URL without updating any user
    res.status(200).json({
      avatar: req.file.path,
      publicId: req.file.filename,
      message: 'Tải lên ảnh đại diện thành công'
    });
  });
};

// Upload photos for registration (no authentication required)
exports.uploadPhotosForRegistration = (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      return res.status(400).json({ 
        message: err.message || 'Có lỗi xảy ra khi tải lên hình ảnh' 
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Vui lòng chọn ít nhất một hình ảnh để tải lên' });
    }
    
    // Check if number of photos exceeds limit
    if (req.files.length > 6) {
      return res.status(400).json({ 
        message: 'Bạn chỉ có thể tải lên tối đa 6 ảnh.' 
      });
    }
    
    // Get URLs of uploaded images
    const uploadedImages = req.files.map(file => file.path);
    
    res.status(200).json({
      photos: uploadedImages,
      message: 'Tải lên hình ảnh thành công'
    });
  });
};

exports.deleteImage = async (req, res, next) => {
  try {
    const { publicId, imageUrl, type } = req.body;
    
    if (!publicId && !imageUrl) {
      return res.status(400).json({ message: 'Vui lòng cung cấp publicId hoặc imageUrl' });
    }
    
    // Delete image from Cloudinary
    let result;
    if (publicId) {
      result = await cloudinary.uploader.destroy(publicId);
    } else {
      // Extract public ID from URL
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const cloudinaryId = filename.split('.')[0];
      result = await cloudinary.uploader.destroy(cloudinaryId);
    }
    
    if (result.result !== 'ok') {
      return res.status(400).json({ message: 'Không thể xóa hình ảnh' });
    }
    
    // If it's a profile photo, update user model
    if (type === 'avatar' || type === 'photo' || type === 'verification') {
      const User = require('../models/user.model');
      
      if (type === 'avatar') {
        await User.findByIdAndUpdate(req.user._id, { avatar: '' });
      } else if (type === 'photo' && imageUrl) {
        await User.findByIdAndUpdate(req.user._id, 
          { $pull: { photos: imageUrl } }
        );
      } else if (type === 'verification') {
        await User.findByIdAndUpdate(req.user._id, { 
          'verification.selfiePhoto': '',
          'verification.verificationStatus': ''
        });
      }
    }
    
    res.status(200).json({ message: 'Đã xóa hình ảnh thành công' });
  } catch (error) {
    next(error);
  }
};