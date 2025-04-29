const Device = require('../models/device.model');

// Đăng ký thiết bị mới
exports.registerDevice = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { token, platform = 'web', deviceName = '' } = req.body;

    console.log(`Registering device for user ${userId} with token: ${token?.substring(0, 10)}...`);

    if (!token) {
      console.error(`No token provided for user ${userId}`);
      return res.status(400).json({ message: 'Token thiết bị là bắt buộc' });
    }

    // Update user's lastLoginAt field
    try {
      const User = require('../models/user.model');
      await User.findByIdAndUpdate(userId, { 
        lastLoginAt: new Date(),
        lastActive: new Date()
      });
      console.log(`Updated lastLoginAt and lastActive for user ${userId}`);
    } catch (err) {
      console.error(`Error updating user lastLoginAt: ${err.message}`);
      // Continue with device registration even if this fails
    }

    // Kiểm tra và cập nhật hoặc tạo mới thiết bị
    let device = await Device.findOneAndUpdate(
      { user: userId, token },
      {
        platform,
        deviceName,
        lastActive: new Date(),
      },
      { new: true, upsert: true }
    );

    if (!device) {
      console.error(`Failed to save or update device for user ${userId}`);
      
      // Try creating a new device directly
      try {
        device = new Device({
          user: userId,
          token,
          platform,
          deviceName,
          lastActive: new Date()
        });
        await device.save();
        console.log(`Created new device for user ${userId} after update failure`);
      } catch (saveError) {
        console.error(`Error creating device directly: ${saveError.message}`);
        return res.status(500).json({ message: 'Lỗi khi lưu token thiết bị', error: saveError.message });
      }
    }

    console.log(`Device registered successfully for user ${userId}:`, {
      id: device._id,
      token: device.token.substring(0, 10) + '...',
      platform: device.platform,
      lastActive: device.lastActive,
    });

    // Kiểm tra lại trong cơ sở dữ liệu
    const savedDevice = await Device.findOne({ user: userId, token });
    if (!savedDevice) {
      console.error(`Device not found in database after save for user ${userId}`);
      
      // Log all devices for this user
      const allDevices = await Device.find({ user: userId });
      console.log(`User ${userId} has ${allDevices.length} devices in database`);
      
      return res.status(500).json({ message: 'Lỗi khi xác nhận token thiết bị' });
    }

    // Count total devices for this user
    const deviceCount = await Device.countDocuments({ user: userId });
    console.log(`User ${userId} now has ${deviceCount} registered devices`);

    res.status(201).json({
      message: 'Đăng ký thiết bị thành công',
      device: {
        id: device._id,
        token: device.token,
        platform: device.platform,
        deviceName: device.deviceName,
        lastActive: device.lastActive,
      },
    });
  } catch (error) {
    console.error(`Error in registerDevice for user ${req.user?._id}:`, error.message);
    if (error.code === 11000) {
      console.warn(`Duplicate key error for user ${req.user?._id}, token: ${req.body.token?.substring(0, 10)}...`);
      
      // Try to find the existing device and update it
      try {
        const existingDevice = await Device.findOne({ token: req.body.token });
        if (existingDevice) {
          console.log(`Found existing device with token ${req.body.token?.substring(0, 10)}... for user ${existingDevice.user}`);
          
          // If the token belongs to another user, we can either:
          // 1. Return an error (current behavior)
          // 2. Delete the old device and create a new one for this user
          // 3. Transfer ownership to the current user
          
          // Option 3: Transfer ownership if the device hasn't been active recently
          const twoWeeksAgo = new Date();
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          
          if (existingDevice.lastActive < twoWeeksAgo) {
            console.log(`Device with token ${req.body.token?.substring(0, 10)}... hasn't been active for 2 weeks, transferring to user ${req.user?._id}`);
            existingDevice.user = req.user._id;
            existingDevice.lastActive = new Date();
            await existingDevice.save();
            
            return res.status(201).json({
              message: 'Đăng ký thiết bị thành công (transferred)',
              device: {
                id: existingDevice._id,
                token: existingDevice.token,
                platform: existingDevice.platform,
                deviceName: existingDevice.deviceName,
                lastActive: existingDevice.lastActive,
              },
            });
          }
        }
      } catch (findError) {
        console.error(`Error finding existing device: ${findError.message}`);
      }
      
      return res.status(409).json({ message: 'Token đã được đăng ký cho người dùng khác' });
    }
    res.status(500).json({ message: 'Lỗi khi đăng ký thiết bị', error: error.message });
  }
};

// Cập nhật trạng thái hoạt động của thiết bị
exports.updateDeviceActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { token } = req.body;

    console.log(`Updating activity for user ${userId}, token: ${token?.substring(0, 10)}...`);

    if (!token) {
      return res.status(400).json({ message: 'Token thiết bị là bắt buộc' });
    }

    const device = await Device.findOneAndUpdate(
      { token, user: userId },
      { lastActive: new Date() },
      { new: true }
    );

    if (!device) {
      console.warn(`Device not found for user ${userId}, token: ${token?.substring(0, 10)}...`);
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }

    console.log(`Updated device activity for user ${userId}:`, {
      id: device._id,
      lastActive: device.lastActive,
    });

    res.json({
      message: 'Cập nhật trạng thái thiết bị thành công',
      device: {
        id: device._id,
        token: device.token,
        platform: device.platform,
        lastActive: device.lastActive,
      },
    });
  } catch (error) {
    console.error('Error in updateDeviceActivity:', error.message);
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái thiết bị', error: error.message });
  }
};

// Xóa thiết bị
exports.unregisterDevice = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token thiết bị là bắt buộc' });
    }

    const device = await Device.findOneAndDelete({ token, user: userId });

    if (!device) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }

    console.log(`Unregistered device for user ${userId}:`, { id: device._id });

    res.json({ message: 'Đã xóa thiết bị thành công' });
  } catch (error) {
    console.error('Error in unregisterDevice:', error.message);
    res.status(500).json({ message: 'Lỗi khi xóa thiết bị', error: error.message });
  }
};

// Lấy danh sách thiết bị của người dùng
exports.getUserDevices = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log(`Fetching devices for user ${userId}`);
    
    // Convert userId to ObjectId if needed
    const mongoose = require('mongoose');
    let userIdObj;
    
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userIdObj = new mongoose.Types.ObjectId(userId);
    } else if (userId instanceof mongoose.Types.ObjectId) {
      userIdObj = userId;
    } else {
      userIdObj = userId; // Use as is if it's already an ObjectId
    }
    
    console.log(`Using ObjectId for query: ${userIdObj.toString()}`);

    const devices = await Device.find({ user: userIdObj }).sort({ lastActive: -1 });

    console.log(`Found ${devices.length} devices for user ${userIdObj}:`, devices.map(d => ({
      id: d._id,
      token: d.token.substring(0, 10) + '...',
      platform: d.platform,
      lastActive: d.lastActive,
    })));

    if (devices.length === 0) {
      console.warn(`No devices found in database for user ${userIdObj}`);
      const User = require('../models/user.model');
      const user = await User.findById(userIdObj);
      
      if (user) {
        console.log(`User ${userIdObj} exists, last active: ${user.lastActive}`);
        
        // Update user's lastLoginAt if needed
        if (!user.lastLoginAt && user.lastActive) {
          await User.findByIdAndUpdate(userIdObj, { lastLoginAt: user.lastActive });
          console.log(`Updated lastLoginAt for user ${userIdObj}`);
        }
        
        // Không tự động tạo thiết bị nữa vì không thể gửi thông báo đến thiết bị không có subscription
        // Người dùng cần đăng ký thiết bị và subscription thông qua frontend
      } else {
        console.error(`User ${userIdObj} not found in database`);
      }
    }

    res.json({
      devices: devices.map((device) => ({
        id: device._id,
        token: device.token.substring(0, 10) + '...',
        platform: device.platform,
        deviceName: device.deviceName,
        lastActive: device.lastActive,
        createdAt: device.createdAt,
        autoRegistered: device.token.startsWith('auto_')
      })),
    });
  } catch (error) {
    console.error('Error in getUserDevices:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách thiết bị', error: error.message });
  }
};

// Kiểm tra trạng thái đăng ký thiết bị
exports.checkDeviceRegistration = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Đếm số lượng thiết bị
    const deviceCount = await Device.countDocuments({ user: userId });

    // Lấy thiết bị mới nhất
    const latestDevice = await Device.findOne({ user: userId }).sort({ lastActive: -1 });

    console.log(`Checked device registration for user ${userId}:`, {
      deviceCount,
      latestDevice: latestDevice ? latestDevice._id : null,
    });

    res.json({
      registered: deviceCount > 0,
      deviceCount,
      latestDevice: latestDevice
        ? {
            id: latestDevice._id,
            platform: latestDevice.platform,
            deviceName: latestDevice.deviceName,
            lastActive: latestDevice.lastActive,
            createdAt: latestDevice.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error('Error in checkDeviceRegistration:', error.message);
    res.status(500).json({ message: 'Lỗi khi kiểm tra trạng thái thiết bị', error: error.message });
  }
};

// Gửi thông báo test
exports.sendTestNotification = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const pushNotificationService = require('../services/push-notification.service');
    const mongoose = require('mongoose');
    
    // Convert userId to ObjectId if needed
    let userIdObj;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userIdObj = new mongoose.Types.ObjectId(userId);
    } else if (userId instanceof mongoose.Types.ObjectId) {
      userIdObj = userId;
    } else {
      userIdObj = userId; // Use as is if it's already an ObjectId
    }
    
    console.log(`Sending test notification for user ${userIdObj}`);

    // Kiểm tra thiết bị đã đăng ký
    const deviceCount = await Device.countDocuments({ user: userIdObj });
    console.log(`Found ${deviceCount} devices for user ${userIdObj}`);

    if (deviceCount === 0) {
      console.log(`No devices registered for user ${userIdObj}`);
      
      // Check if user exists
      const User = require('../models/user.model');
      const user = await User.findById(userIdObj);
      
      if (!user) {
        console.error(`User ${userIdObj} not found in database`);
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại',
          deviceCount: 0,
        });
      }
      
      // Update user's lastLoginAt if needed
      if (!user.lastLoginAt) {
        user.lastLoginAt = user.lastActive || new Date();
        await user.save();
        console.log(`Updated lastLoginAt for user ${userIdObj}`);
      }
      
      return res.status(400).json({
        success: false,
        message: 'Không có thiết bị nào được đăng ký cho người dùng này',
        deviceCount: 0,
        user: {
          id: user._id,
          lastActive: user.lastActive,
          lastLoginAt: user.lastLoginAt
        }
      });
    }

    // Get device details before sending notification
    const devices = await Device.find({ user: userIdObj })
      .sort({ lastActive: -1 });
      
    console.log(`Devices for user ${userIdObj}:`, devices.map(d => ({
      id: d._id,
      token: d.token.substring(0, 10) + '...',
      platform: d.platform,
      lastActive: d.lastActive,
    })));

    // Tạo thông báo test
    const notification = {
      title: 'Thông báo test',
      text: 'Đây là thông báo test từ BobaLove',
      type: 'system',
      linkTo: '/notifications',
      data: {
        testId: Date.now().toString(),
        isTest: true,
      },
    };

    // Gửi thông báo
    const result = await pushNotificationService.sendNotificationToUser(userIdObj, notification);

    // Lấy danh sách thiết bị sau khi gửi (có thể đã thay đổi nếu có token không hợp lệ bị xóa)
    const updatedDevices = await Device.find({ user: userIdObj })
      .sort({ lastActive: -1 })
      .limit(5);

    console.log(`Sent test notification for user ${userIdObj}:`, {
      success: result,
      deviceCount: updatedDevices.length,
    });

    res.json({
      success: result,
      message: result ? 'Đã gửi thông báo test thành công' : 'Không thể gửi thông báo test',
      deviceCount: updatedDevices.length,
      originalDeviceCount: deviceCount,
      devices: updatedDevices.map((device) => ({
        id: device._id,
        platform: device.platform,
        deviceName: device.deviceName,
        lastActive: device.lastActive,
        createdAt: device.createdAt,
        tokenPreview: device.token.substring(0, 10) + '...'
      })),
    });
  } catch (error) {
    console.error('Error in sendTestNotification:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi thông báo test',
      error: error.message,
    });
  }
};