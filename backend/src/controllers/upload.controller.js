// Upload controller - Sử dụng base64 thay vì Cloudinary

/**
 * Validate base64 image string
 */
const validateBase64Image = (base64String) => {
  if (!base64String || typeof base64String !== 'string') {
    return { valid: false, error: 'Base64 string không hợp lệ' };
  }

  // Check if it's a data URL format
  const dataUrlPattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i;
  const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
  
  let base64Data = base64String;
  let mimeType = 'image/jpeg';

  if (base64String.includes(',')) {
    const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
    if (matches) {
      mimeType = `image/${matches[1]}`;
      base64Data = matches[2];
    }
  }

  // Validate base64 format
  if (!base64Pattern.test(base64Data)) {
    return { valid: false, error: 'Định dạng base64 không hợp lệ' };
  }

  // Check size (limit to 5MB)
  const sizeInBytes = (base64Data.length * 3) / 4;
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (sizeInBytes > maxSize) {
    return { valid: false, error: 'Kích thước ảnh vượt quá 5MB' };
  }

  // Validate MIME type
  const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validMimeTypes.includes(mimeType.toLowerCase())) {
    return { valid: false, error: 'Định dạng ảnh không được hỗ trợ. Chỉ chấp nhận JPG, PNG, GIF, WEBP' };
  }

  return { valid: true, base64Data, mimeType };
};

// Upload single image (returns base64)
exports.uploadImage = async (req, res, next) => {
  try {
    const { image } = req.body; // Base64 string

    if (!image) {
      return res.status(400).json({ message: 'Vui lòng cung cấp ảnh dưới dạng base64' });
    }

    const validation = validateBase64Image(image);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    // Return base64 string
    res.status(200).json({
      url: image, // Return full base64 string including data URI prefix if present
      base64: image
    });
  } catch (error) {
    next(error);
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body; // Base64 string

    if (!avatar) {
      return res.status(400).json({ message: 'Vui lòng cung cấp ảnh đại diện dưới dạng base64' });
    }

    const validation = validateBase64Image(avatar);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!req.user || !req.user._id) {
      return res.status(200).json({
        avatar: avatar,
        message: 'Tải lên ảnh đại diện thành công, nhưng không thể cập nhật hồ sơ (người dùng chưa đăng nhập)'
      });
    }

    // Update user's avatar in database
    const User = require('../models/user.model');
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatar },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.status(200).json({
      avatar: avatar,
      message: 'Cập nhật ảnh đại diện thành công'
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    next(error);
  }
};

// Upload multiple images (max 6)
exports.uploadMultipleImages = async (req, res, next) => {
  try {
    const { images } = req.body; // Array of base64 strings

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'Vui lòng cung cấp ít nhất một ảnh dưới dạng base64' });
    }

    if (images.length > 6) {
      return res.status(400).json({ message: 'Bạn chỉ có thể tải lên tối đa 6 ảnh' });
    }

    // Validate all images
    const validatedImages = [];
    for (const img of images) {
      const validation = validateBase64Image(img);
      if (!validation.valid) {
        return res.status(400).json({ message: `Ảnh không hợp lệ: ${validation.error}` });
      }
      validatedImages.push(img);
    }

    // Get current user
    const User = require('../models/user.model');
    const user = await User.findById(req.user._id);

    // Check if user already has photos and if adding new ones would exceed limit
    const currentPhotoCount = user.photos ? user.photos.length : 0;
    if (currentPhotoCount + validatedImages.length > 6) {
      return res.status(400).json({
        message: `Bạn chỉ có thể tải lên tối đa 6 ảnh. Hiện tại bạn đã có ${currentPhotoCount} ảnh.`
      });
    }

    // Update user's photos in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { photos: { $each: validatedImages } } },
      { new: true }
    );

    res.status(200).json({
      photos: updatedUser.photos,
      message: 'Tải lên hình ảnh thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Upload verification photo
exports.uploadVerificationPhoto = async (req, res, next) => {
  try {
    const { verification } = req.body; // Base64 string

    if (!verification) {
      return res.status(400).json({ message: 'Vui lòng cung cấp ảnh xác minh dưới dạng base64' });
    }

    const validation = validateBase64Image(verification);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện chức năng này' });
    }

    // Update user's verification info in database
    const User = require('../models/user.model');
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        'verification.selfiePhoto': verification,
        'verification.verificationStatus': 'pending'
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Gửi thông báo cho tất cả admin về việc có người dùng cần xác minh
    try {
      const notificationController = require('./notification.controller');
      const admins = await User.find({ role: { $in: ['admin', 'moderator'] } }).select('_id');

      if (admins && admins.length > 0) {
        for (const admin of admins) {
          await notificationController.createNotification(admin._id, {
            type: 'system',
            text: `Người dùng ${updatedUser.fullName} đã tải lên ảnh xác minh và đang chờ duyệt.`,
            linkTo: `/admin/users/${updatedUser._id}`
          });
        }
        console.log(`Đã gửi thông báo xác minh đến ${admins.length} quản trị viên`);
      }
    } catch (notifyError) {
      console.error('Error sending notification to admins:', notifyError);
    }

    res.status(200).json({
      verificationPhoto: verification,
      message: 'Tải lên ảnh xác minh thành công. Vui lòng chờ quản trị viên xác nhận.'
    });
  } catch (error) {
    console.error('Error uploading verification photo:', error);
    next(error);
  }
};

// Upload avatar for registration (no authentication required)
exports.uploadAvatarForRegistration = async (req, res, next) => {
  try {
    console.log('Received upload avatar request');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body has avatar:', !!req.body.avatar);
    console.log('Avatar type:', typeof req.body.avatar);
    console.log('Avatar length:', req.body.avatar ? req.body.avatar.length : 0);
    
    const { avatar } = req.body; // Base64 string

    if (!avatar) {
      console.error('Avatar missing in request body');
      return res.status(400).json({ message: 'Vui lòng cung cấp ảnh đại diện dưới dạng base64' });
    }

    const validation = validateBase64Image(avatar);
    if (!validation.valid) {
      console.error('Base64 validation failed:', validation.error);
      return res.status(400).json({ message: validation.error });
    }

    console.log('Avatar upload successful');
    res.status(200).json({
      avatar: avatar,
      message: 'Tải lên ảnh đại diện thành công'
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    console.error('Error stack:', error.stack);
    next(error);
  }
};

// Upload photos for registration (no authentication required)
exports.uploadPhotosForRegistration = async (req, res, next) => {
  try {
    console.log('Received upload photos request');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body has images:', !!req.body.images);
    console.log('Images type:', typeof req.body.images);
    console.log('Images is array:', Array.isArray(req.body.images));
    console.log('Images length:', req.body.images ? req.body.images.length : 0);
    
    const { images } = req.body; // Array of base64 strings

    if (!images || !Array.isArray(images) || images.length === 0) {
      console.error('Images missing or invalid in request body');
      return res.status(400).json({ message: 'Vui lòng cung cấp ít nhất một ảnh dưới dạng base64' });
    }

    if (images.length > 6) {
      return res.status(400).json({ message: 'Bạn chỉ có thể tải lên tối đa 6 ảnh.' });
    }

    // Validate all images
    const validatedImages = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      console.log(`Validating image ${i + 1}/${images.length}, length: ${img ? img.length : 0}`);
      const validation = validateBase64Image(img);
      if (!validation.valid) {
        console.error(`Image ${i + 1} validation failed:`, validation.error);
        return res.status(400).json({ message: `Ảnh không hợp lệ: ${validation.error}` });
      }
      validatedImages.push(img);
    }

    console.log('Photos upload successful');
    res.status(200).json({
      photos: validatedImages,
      message: 'Tải lên hình ảnh thành công'
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    console.error('Error stack:', error.stack);
    next(error);
  }
};

// Delete image (for base64, we just remove from database)
exports.deleteImage = async (req, res, next) => {
  try {
    const { imageUrl, type } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Vui lòng cung cấp imageUrl' });
    }

    // If it's a profile photo, update user model
    if (type === 'avatar' || type === 'photo' || type === 'verification') {
      const User = require('../models/user.model');

      if (type === 'avatar') {
        await User.findByIdAndUpdate(req.user._id, { avatar: '' });
      } else if (type === 'photo' && imageUrl) {
        await User.findByIdAndUpdate(req.user._id, { $pull: { photos: imageUrl } });
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
