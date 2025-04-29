const mongoose = require('mongoose');
const Blindate = require('../models/blindate.model');
const NegotiationChat = require('../models/negotiation-chat.model');
const socketIO = require('../socket');
const { v4: uuidv4 } = require('uuid');
const { createNotification } = require('../utils/notification-helper');

// Danh sách địa điểm gợi ý ở TP.HCM theo quận
exports.getSuggestedLocations = async (req, res) => {
  try {
    // Danh sách địa điểm gợi ý ở TP.HCM
    const suggestedLocations = [
      // Quận 1
      {
        name: "The Coffee House",
        address: "86 Cao Thắng, Quận 1, TP.HCM",
        coordinates: [106.6822, 10.7731],
        type: "cafe"
      },
      {
        name: "Highlands Coffee Nguyễn Du",
        address: "72 Nguyễn Du, Quận 1, TP.HCM",
        coordinates: [106.6956, 10.7721],
        type: "cafe"
      },
      {
        name: "Phúc Long Coffee & Tea",
        address: "42 Nguyễn Huệ, Quận 1, TP.HCM",
        coordinates: [106.7033, 10.7731],
        type: "cafe"
      },
      {
        name: "Trung Nguyên Legend Cafe",
        address: "80 Đồng Khởi, Quận 1, TP.HCM",
        coordinates: [106.7033, 10.7765],
        type: "cafe"
      },
      {
        name: "Pizza 4P's Lê Thánh Tôn",
        address: "8 Lê Thánh Tôn, Quận 1, TP.HCM",
        coordinates: [106.7042, 10.7789],
        type: "restaurant"
      },
      {
        name: "Nhà hàng Ngon",
        address: "160 Pasteur, Quận 1, TP.HCM",
        coordinates: [106.6969, 10.7789],
        type: "restaurant"
      },
      
      // Quận 3
      {
        name: "The Workshop Coffee",
        address: "27 Ngô Đức Kế, Quận 3, TP.HCM",
        coordinates: [106.7042, 10.7731],
        type: "cafe"
      },
      {
        name: "Cộng Cà Phê",
        address: "26 Lý Tự Trọng, Quận 3, TP.HCM",
        coordinates: [106.6969, 10.7731],
        type: "cafe"
      },
      {
        name: "Saigon Ơi Cafe",
        address: "158/10 Nguyễn Công Trứ, Quận 3, TP.HCM",
        coordinates: [106.6969, 10.7765],
        type: "cafe"
      },
      {
        name: "Hum Vegetarian",
        address: "32 Võ Văn Tần, Quận 3, TP.HCM",
        coordinates: [106.6896, 10.7789],
        type: "restaurant"
      },
      
      // Quận 7
      {
        name: "Starbucks Crescent Mall",
        address: "Tầng trệt, Crescent Mall, Quận 7, TP.HCM",
        coordinates: [106.7179, 10.7287],
        type: "cafe"
      },
      {
        name: "The Coffee Bean & Tea Leaf",
        address: "Tầng 1, SC VivoCity, Quận 7, TP.HCM",
        coordinates: [106.7042, 10.7321],
        type: "cafe"
      },
      {
        name: "Moo Beef",
        address: "Sky Garden 1, Quận 7, TP.HCM",
        coordinates: [106.7179, 10.7321],
        type: "restaurant"
      },
      {
        name: "Hoàng Yến Cuisine",
        address: "Crescent Mall, Quận 7, TP.HCM",
        coordinates: [106.7179, 10.7287],
        type: "restaurant"
      },
      
      // Quận Bình Thạnh
      {
        name: "The Running Bean",
        address: "31 Phan Văn Trị, Bình Thạnh, TP.HCM",
        coordinates: [106.7179, 10.8011],
        type: "cafe"
      },
      {
        name: "Cheese Coffee",
        address: "29 Nguyễn Gia Trí, Bình Thạnh, TP.HCM",
        coordinates: [106.7179, 10.8045],
        type: "cafe"
      },
      {
        name: "Quán Ăn Ngon",
        address: "138 Nguyễn Gia Trí, Bình Thạnh, TP.HCM",
        coordinates: [106.7179, 10.8045],
        type: "restaurant"
      },
      
      // Thủ Đức
      {
        name: "Trung Nguyên Legend",
        address: "Đường Võ Văn Ngân, Thủ Đức, TP.HCM",
        coordinates: [106.7589, 10.8504],
        type: "cafe"
      },
      {
        name: "Highlands Coffee Thủ Đức",
        address: "Vincom Thủ Đức, TP.HCM",
        coordinates: [106.7589, 10.8538],
        type: "cafe"
      },
      {
        name: "Lotteria Thủ Đức",
        address: "Vincom Thủ Đức, TP.HCM",
        coordinates: [106.7589, 10.8538],
        type: "restaurant"
      },
      
      // Quận 10
      {
        name: "Urban Station Coffee",
        address: "488 Nguyễn Thị Minh Khai, Quận 10, TP.HCM",
        coordinates: [106.6676, 10.7731],
        type: "cafe"
      },
      {
        name: "Katinat Cafe",
        address: "28 Bàu Cát, Quận 10, TP.HCM",
        coordinates: [106.6676, 10.7765],
        type: "cafe"
      },
      {
        name: "Hủ Tiếu Nam Vang Nhân Quán",
        address: "72 Cao Thắng, Quận 10, TP.HCM",
        coordinates: [106.6676, 10.7731],
        type: "restaurant"
      },
      
      // Quận Phú Nhuận
      {
        name: "The Coffee House",
        address: "86 Nguyễn Văn Trỗi, Phú Nhuận, TP.HCM",
        coordinates: [106.6822, 10.7969],
        type: "cafe"
      },
      {
        name: "Phúc Long Coffee & Tea",
        address: "42 Phan Đình Phùng, Phú Nhuận, TP.HCM",
        coordinates: [106.6822, 10.8011],
        type: "cafe"
      },
      {
        name: "Quán Ăn Ngon",
        address: "160 Phan Xích Long, Phú Nhuận, TP.HCM",
        coordinates: [106.6822, 10.8011],
        type: "restaurant"
      },
      
      // Một số quán bar
      {
        name: "Qui Lounge & Bar",
        address: "22 Lê Thánh Tôn, Quận 1, TP.HCM",
        coordinates: [106.7042, 10.7789],
        type: "bar"
      },
      {
        name: "Glow Skybar",
        address: "Tầng thượng, President Place, 93 Nguyễn Du, Quận 1, TP.HCM",
        coordinates: [106.6969, 10.7721],
        type: "bar"
      },
      {
        name: "Broma Not A Bar",
        address: "41 Nguyễn Huệ, Quận 1, TP.HCM",
        coordinates: [106.7033, 10.7731],
        type: "bar"
      }
    ];

    return res.status(200).json(suggestedLocations);
  } catch (error) {
    console.error('Error getting suggested locations:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Lấy trạng thái bình chọn địa điểm
exports.getLocationStatus = async (req, res) => {
  try {
    const { blindateId } = req.params;
    const { userId } = req;

    if (!mongoose.Types.ObjectId.isValid(blindateId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    // Lấy thông tin blindate
    const blindate = await Blindate.findById(blindateId);
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là thành viên của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập thông tin này' });
    }

    // Lấy thông tin người dùng khác trong blindate
    const otherUserId = blindate.users.find(id => id.toString() !== userId);

    // Kiểm tra xem đã có thông tin bình chọn địa điểm chưa
    if (!blindate.locationVoting) {
      return res.status(200).json({
        status: 'not_started',
        userVoted: false,
        otherUserVoted: false
      });
    }

    // Kiểm tra xem người dùng đã bình chọn chưa
    const userVoted = blindate.locationVoting.votes.some(vote => vote.user.toString() === userId);
    
    // Kiểm tra xem người dùng khác đã bình chọn chưa
    const otherUserVoted = blindate.locationVoting.votes.some(vote => vote.user.toString() === otherUserId.toString());

    return res.status(200).json({
      status: blindate.locationVoting.status,
      userVoted,
      otherUserVoted,
      locationVoting: blindate.locationVoting
    });
  } catch (error) {
    console.error('Error getting location status:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Bình chọn địa điểm
exports.voteLocation = async (req, res) => {
  try {
    const { blindateId } = req.params;
    const { userId } = req;
    const { location } = req.body;

    if (!mongoose.Types.ObjectId.isValid(blindateId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    if (!location || !location.name || !location.address) {
      return res.status(400).json({ message: 'Thông tin địa điểm không hợp lệ' });
    }

    // Lấy thông tin blindate
    const blindate = await Blindate.findById(blindateId);
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là thành viên của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
    }

    // Lấy thông tin người dùng khác trong blindate
    const otherUserId = blindate.users.find(id => id.toString() !== userId);

    // Nếu chưa có thông tin bình chọn địa điểm, tạo mới
    if (!blindate.locationVoting) {
      blindate.locationVoting = {
        status: 'pending',
        votes: [{
          user: userId,
          location
        }],
        finalLocation: null,
        chatRoomId: null
      };
    } else {
      // Kiểm tra xem người dùng đã bình chọn chưa
      const userVoteIndex = blindate.locationVoting.votes.findIndex(vote => vote.user.toString() === userId);
      
      if (userVoteIndex !== -1) {
        // Nếu đã bình chọn, cập nhật lại
        blindate.locationVoting.votes[userVoteIndex].location = location;
      } else {
        // Nếu chưa bình chọn, thêm mới
        blindate.locationVoting.votes.push({
          user: userId,
          location
        });
      }
    }

    // Kiểm tra xem cả hai người dùng đã bình chọn chưa
    const bothVoted = blindate.locationVoting.votes.length === 2;

    // Nếu cả hai đã bình chọn, kiểm tra xem có trùng khớp không
    if (bothVoted) {
      const vote1 = blindate.locationVoting.votes[0].location;
      const vote2 = blindate.locationVoting.votes[1].location;
      
      // Nếu cả hai chọn cùng một địa điểm (so sánh tên)
      if (vote1.name === vote2.name) {
        blindate.locationVoting.status = 'confirmed';
        blindate.locationVoting.finalLocation = vote1;
        
        // Tạo thông báo cho người dùng khác
        await createNotification({
          recipient: otherUserId,
          sender: userId,
          type: 'location_confirmed',
          content: 'Địa điểm đã được xác nhận',
          reference: {
            type: 'blindate',
            id: blindate._id
          }
        });
      } else {
        // Nếu không trùng khớp, chuyển sang trạng thái thương lượng
        blindate.locationVoting.status = 'negotiating';
      }
    } else {
      // Nếu mới chỉ có một người bình chọn
      blindate.locationVoting.status = 'pending';
      
      // Tạo thông báo cho người dùng khác
      await createNotification({
        recipient: otherUserId,
        sender: userId,
        type: 'location_voted',
        content: 'Đối phương đã chọn địa điểm cho cuộc hẹn',
        reference: {
          type: 'blindate',
          id: blindate._id
        }
      });
    }

    await blindate.save();

    return res.status(200).json({
      status: blindate.locationVoting.status,
      userVoted: true,
      otherUserVoted: blindate.locationVoting.votes.some(vote => vote.user.toString() === otherUserId.toString()),
      locationVoting: blindate.locationVoting
    });
  } catch (error) {
    console.error('Error voting location:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Tạo phòng chat thương lượng
exports.initiateNegotiationChat = async (req, res) => {
  try {
    const { blindateId } = req.params;
    const { userId } = req;

    if (!mongoose.Types.ObjectId.isValid(blindateId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    // Lấy thông tin blindate
    const blindate = await Blindate.findById(blindateId);
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là thành viên của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
    }

    // Kiểm tra xem đã có phòng chat chưa
    if (blindate.locationVoting && blindate.locationVoting.chatRoomId) {
      // Kiểm tra xem phòng chat có tồn tại không
      const existingChat = await NegotiationChat.findOne({ chatRoomId: blindate.locationVoting.chatRoomId });
      if (existingChat) {
        return res.status(200).json({
          message: 'Phòng chat đã tồn tại',
          chatRoomId: blindate.locationVoting.chatRoomId
        });
      }
    }

    // Tạo ID phòng chat mới
    const chatRoomId = uuidv4();

    // Tạo phòng chat mới
    const newChat = new NegotiationChat({
      chatRoomId,
      blindateId,
      status: 'active',
      messages: [{
        sender: userId,
        content: 'Phòng chat đã được tạo',
        timestamp: new Date(),
        isSystemMessage: true
      }]
    });

    await newChat.save();

    // Cập nhật thông tin blindate
    if (!blindate.locationVoting) {
      blindate.locationVoting = {
        status: 'negotiating',
        votes: [],
        finalLocation: null,
        chatRoomId
      };
    } else {
      blindate.locationVoting.chatRoomId = chatRoomId;
      if (blindate.locationVoting.status !== 'confirmed') {
        blindate.locationVoting.status = 'negotiating';
      }
    }

    await blindate.save();

    // Lấy thông tin người dùng khác trong blindate
    const otherUserId = blindate.users.find(id => id.toString() !== userId);

    // Tạo thông báo cho người dùng khác
    await createNotification({
      recipient: otherUserId,
      sender: userId,
      type: 'chat_initiated',
      content: 'Đối phương đã tạo phòng chat thương lượng địa điểm',
      reference: {
        type: 'blindate',
        id: blindate._id
      }
    });

    return res.status(201).json({
      message: 'Đã tạo phòng chat thành công',
      chatRoomId
    });
  } catch (error) {
    console.error('Error initiating chat:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Xác nhận địa điểm cuối cùng
exports.confirmFinalLocation = async (req, res) => {
  try {
    const { blindateId } = req.params;
    const { userId } = req;
    const { location } = req.body;

    if (!mongoose.Types.ObjectId.isValid(blindateId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    if (!location || !location.name || !location.address) {
      return res.status(400).json({ message: 'Thông tin địa điểm không hợp lệ' });
    }

    // Lấy thông tin blindate
    const blindate = await Blindate.findById(blindateId);
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là thành viên của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
    }

    // Cập nhật thông tin địa điểm
    if (!blindate.locationVoting) {
      blindate.locationVoting = {
        status: 'confirmed',
        votes: [{
          user: userId,
          location
        }],
        finalLocation: location,
        chatRoomId: null
      };
    } else {
      blindate.locationVoting.status = 'confirmed';
      blindate.locationVoting.finalLocation = location;
      
      // Cập nhật vote của người dùng
      const userVoteIndex = blindate.locationVoting.votes.findIndex(vote => vote.user.toString() === userId);
      if (userVoteIndex !== -1) {
        blindate.locationVoting.votes[userVoteIndex].location = location;
      } else {
        blindate.locationVoting.votes.push({
          user: userId,
          location
        });
      }
    }

    await blindate.save();

    // Lấy thông tin người dùng khác trong blindate
    const otherUserId = blindate.users.find(id => id.toString() !== userId);

    // Tạo thông báo cho người dùng khác
    await createNotification({
      recipient: otherUserId,
      sender: userId,
      type: 'location_confirmed',
      content: 'Địa điểm đã được xác nhận',
      reference: {
        type: 'blindate',
        id: blindate._id
      }
    });

    // Gửi thông báo qua socket.io nếu có phòng chat
    if (blindate.locationVoting.chatRoomId) {
      const io = socketIO.getIO();
      io.to(blindate.locationVoting.chatRoomId).emit('location_confirmed', {
        location,
        message: 'Địa điểm đã được xác nhận'
      });
      
      // Thêm tin nhắn hệ thống vào phòng chat
      const chat = await NegotiationChat.findOne({ chatRoomId: blindate.locationVoting.chatRoomId });
      if (chat) {
        chat.messages.push({
          sender: userId,
          content: `Địa điểm đã được xác nhận: ${location.name}, ${location.address}`,
          timestamp: new Date(),
          isSystemMessage: true
        });
        await chat.save();
      }
    }

    return res.status(200).json({
      message: 'Đã xác nhận địa điểm thành công',
      location,
      blindate
    });
  } catch (error) {
    console.error('Error confirming location:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};