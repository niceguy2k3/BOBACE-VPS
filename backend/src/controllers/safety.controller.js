const { SafetyReport, LocationShare, SafeLocation } = require('../models/safety.model');
const User = require('../models/user.model');
const Blindate = require('../models/blindate.model');
const mongoose = require('mongoose');
const { createNotification } = require('../utils/notification-helper');
const crypto = require('crypto');

// Tạo báo cáo khẩn cấp
exports.createEmergencyReport = async (req, res) => {
  try {
    const { userId } = req;
    const { blindateId, emergencyType, location, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(blindateId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    // Kiểm tra xem blindate có tồn tại không
    const blindate = await Blindate.findById(blindateId);
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là một phần của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền báo cáo cuộc hẹn này' });
    }

    // Xác định mức độ ưu tiên dựa trên loại báo cáo
    let priority = 'medium';
    if (emergencyType === 'emergency') {
      priority = 'critical';
    } else if (emergencyType === 'unsafe') {
      priority = 'high';
    }

    // Tạo báo cáo mới
    const newReport = new SafetyReport({
      user: userId,
      reportType: emergencyType,
      relatedTo: {
        type: 'blindate',
        id: blindateId
      },
      description: description || '',
      location: location || '',
      priority
    });

    await newReport.save();

    // Thông báo cho đội ngũ hỗ trợ (giả lập)
    // Trong thực tế, đây sẽ là một hệ thống thông báo riêng cho đội ngũ hỗ trợ

    // Thông báo cho người dùng khác trong cuộc hẹn nếu là tình huống khẩn cấp
    if (emergencyType === 'emergency') {
      const otherUserId = blindate.users.find(id => id.toString() !== userId);
      
      await createNotification({
        recipient: otherUserId,
        sender: userId,
        type: 'safety_alert',
        content: 'Đã có báo cáo khẩn cấp liên quan đến cuộc hẹn của bạn',
        reference: {
          type: 'blindate',
          id: blindate._id
        }
      });
    }

    return res.status(201).json({
      message: 'Đã gửi báo cáo khẩn cấp thành công',
      report: newReport
    });
  } catch (error) {
    console.error('Error creating emergency report:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Tạo và chia sẻ vị trí
exports.createLocationShare = async (req, res) => {
  try {
    const { userId } = req;
    const { blindateId, sharedWith, duration } = req.body;

    if (!sharedWith || !Array.isArray(sharedWith) || sharedWith.length === 0) {
      return res.status(400).json({ message: 'Vui lòng cung cấp danh sách người nhận' });
    }

    // Tính thời gian hết hạn (mặc định 24 giờ nếu không có)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (duration || 24));

    // Tạo mã theo dõi ngẫu nhiên
    const trackingCode = crypto.randomBytes(6).toString('hex');

    // Tạo chia sẻ vị trí mới
    const newLocationShare = new LocationShare({
      user: userId,
      sharedWith,
      blindateId: blindateId || null,
      expiresAt,
      trackingCode,
      locations: [{
        coordinates: req.body.coordinates || [0, 0],
        timestamp: new Date()
      }]
    });

    await newLocationShare.save();

    // Tạo URL theo dõi
    const trackingUrl = `${process.env.CLIENT_URL}/safety/location/${trackingCode}`;

    return res.status(201).json({
      message: 'Đã tạo chia sẻ vị trí thành công',
      trackingUrl,
      trackingCode,
      expiresAt,
      locationShare: newLocationShare
    });
  } catch (error) {
    console.error('Error creating location share:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Cập nhật vị trí
exports.updateLocation = async (req, res) => {
  try {
    const { trackingCode } = req.params;
    const { coordinates } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tọa độ hợp lệ [longitude, latitude]' });
    }

    // Tìm chia sẻ vị trí
    const locationShare = await LocationShare.findOne({
      trackingCode,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!locationShare) {
      return res.status(404).json({ message: 'Không tìm thấy chia sẻ vị trí hoặc đã hết hạn' });
    }

    // Thêm vị trí mới
    locationShare.locations.push({
      coordinates,
      timestamp: new Date()
    });

    await locationShare.save();

    return res.status(200).json({
      message: 'Đã cập nhật vị trí thành công',
      locationShare
    });
  } catch (error) {
    console.error('Error updating location:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Lấy vị trí theo dõi
exports.getLocationTracking = async (req, res) => {
  try {
    const { trackingCode } = req.params;

    // Tìm chia sẻ vị trí
    const locationShare = await LocationShare.findOne({
      trackingCode,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('user', 'fullName');

    if (!locationShare) {
      return res.status(404).json({ message: 'Không tìm thấy chia sẻ vị trí hoặc đã hết hạn' });
    }

    // Lấy vị trí mới nhất
    const latestLocation = locationShare.locations.length > 0
      ? locationShare.locations[locationShare.locations.length - 1]
      : null;

    return res.status(200).json({
      user: locationShare.user,
      expiresAt: locationShare.expiresAt,
      latestLocation,
      allLocations: locationShare.locations
    });
  } catch (error) {
    console.error('Error getting location tracking:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Hủy chia sẻ vị trí
exports.cancelLocationShare = async (req, res) => {
  try {
    const { userId } = req;
    const { trackingCode } = req.params;

    // Tìm chia sẻ vị trí
    const locationShare = await LocationShare.findOne({
      trackingCode,
      user: userId
    });

    if (!locationShare) {
      return res.status(404).json({ message: 'Không tìm thấy chia sẻ vị trí' });
    }

    // Hủy chia sẻ vị trí
    locationShare.isActive = false;
    await locationShare.save();

    return res.status(200).json({
      message: 'Đã hủy chia sẻ vị trí thành công'
    });
  } catch (error) {
    console.error('Error cancelling location share:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Lấy danh sách địa điểm an toàn
exports.getSafeLocations = async (req, res) => {
  try {
    const { lat, lng, radius = 5, type } = req.query;

    let query = { isActive: true, verificationStatus: 'verified' };

    // Lọc theo loại nếu có
    if (type) {
      query.type = type;
    }

    // Tìm địa điểm gần vị trí hiện tại nếu có tọa độ
    let safeLocations;
    if (lat && lng) {
      safeLocations = await SafeLocation.find({
        ...query,
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseInt(radius) * 1000 // Chuyển đổi km thành m
          }
        }
      }).limit(20);
    } else {
      // Nếu không có tọa độ, trả về danh sách mặc định
      safeLocations = await SafeLocation.find(query).limit(20);
    }

    return res.status(200).json(safeLocations);
  } catch (error) {
    console.error('Error fetching safe locations:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Đề xuất địa điểm an toàn mới
exports.suggestSafeLocation = async (req, res) => {
  try {
    const { userId } = req;
    const { name, address, coordinates, type, safetyFeatures } = req.body;

    if (!name || !address || !coordinates || !type) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin địa điểm' });
    }

    // Tạo địa điểm an toàn mới
    const newSafeLocation = new SafeLocation({
      name,
      address,
      coordinates,
      type,
      safetyFeatures: safetyFeatures || {
        hasCCTV: false,
        hasSecurityStaff: false,
        isWellLit: false,
        hasPublicTransport: false
      },
      verificationStatus: 'pending'
    });

    await newSafeLocation.save();

    return res.status(201).json({
      message: 'Đã đề xuất địa điểm an toàn thành công, đang chờ xác minh',
      safeLocation: newSafeLocation
    });
  } catch (error) {
    console.error('Error suggesting safe location:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Đánh giá địa điểm an toàn
exports.rateSafeLocation = async (req, res) => {
  try {
    const { userId } = req;
    const { locationId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đánh giá hợp lệ (1-5)' });
    }

    // Tìm địa điểm an toàn
    const safeLocation = await SafeLocation.findById(locationId);
    if (!safeLocation) {
      return res.status(404).json({ message: 'Không tìm thấy địa điểm' });
    }

    // Kiểm tra xem người dùng đã đánh giá chưa
    const existingReviewIndex = safeLocation.reviews.findIndex(
      review => review.user.toString() === userId
    );

    if (existingReviewIndex !== -1) {
      // Cập nhật đánh giá hiện có
      safeLocation.reviews[existingReviewIndex].rating = rating;
      safeLocation.reviews[existingReviewIndex].comment = comment || '';
      safeLocation.reviews[existingReviewIndex].date = new Date();
    } else {
      // Thêm đánh giá mới
      safeLocation.reviews.push({
        user: userId,
        rating,
        comment: comment || '',
        date: new Date()
      });
    }

    // Tính lại điểm đánh giá trung bình
    const totalRating = safeLocation.reviews.reduce((sum, review) => sum + review.rating, 0);
    safeLocation.rating = totalRating / safeLocation.reviews.length;

    await safeLocation.save();

    return res.status(200).json({
      message: 'Đã đánh giá địa điểm thành công',
      safeLocation
    });
  } catch (error) {
    console.error('Error rating safe location:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};