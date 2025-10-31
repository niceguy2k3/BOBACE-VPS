const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Match = require('../models/match.model');
const Message = require('../models/message.model');
const Blindate = require('../models/blindate.model');
const Report = require('../models/report.model');

let mongod = null;

/**
 * Kết nối đến cơ sở dữ liệu trong bộ nhớ
 */
const connect = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  await mongoose.connect(uri, mongooseOpts);
  
  console.log('Connected to in-memory MongoDB');
  
  // Tạo dữ liệu mẫu
  await createSampleData();
  
  return {
    uri,
    instance: mongod
  };
};

/**
 * Đóng kết nối và dừng máy chủ
 */
const closeDatabase = async () => {
  if (mongod) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  }
};

/**
 * Xóa tất cả dữ liệu trong các bảng
 */
const clearDatabase = async () => {
  if (mongod) {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
};

/**
 * Tạo dữ liệu mẫu cho ứng dụng
 */
const createSampleData = async () => {
  try {
    // Tạo người dùng mẫu
    const users = [
      {
        _id: mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a1'),
        email: 'user1@example.com',
        password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', // 'password123'
        fullName: 'Nguyễn Thị Hương',
        gender: 'female',
        birthDate: new Date('1998-05-15'),
        city: 'Hà Nội',
        bio: 'Yêu thích trà sữa và sách',
        occupation: 'Giáo viên',
        education: 'Đại học Sư phạm Hà Nội',
        interests: ['Đọc sách', 'Du lịch', 'Âm nhạc'],
        hobbies: ['Chơi piano', 'Nấu ăn', 'Yoga'],
        photos: [],
        avatar: '',
        teaPreferences: ['Trà sữa trân châu đường đen', 'Trà đào', 'Trà sữa matcha'],
        sugarLevel: '50%',
        iceLevel: '30%',
        favoriteTea: 'Trà sữa trân châu đường đen',
        lookingFor: 'relationship',
        interestedIn: ['male'],
        showInDiscovery: true
      },
      {
        _id: mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a2'),
        email: 'user2@example.com',
        password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', // 'password123'
        fullName: 'Trần Thị Minh',
        gender: 'female',
        birthDate: new Date('1995-08-20'),
        city: 'Hà Nội',
        bio: 'Bác sĩ yêu thích công việc và trà sữa',
        occupation: 'Bác sĩ',
        education: 'Đại học Y Hà Nội',
        interests: ['Y học', 'Sức khỏe', 'Thiện nguyện'],
        hobbies: ['Chạy bộ', 'Nấu ăn', 'Đọc sách'],
        photos: [
          'https://res.cloudinary.com/dtzbug8nl/image/upload/v1713804000/hen-ho-tra-sua/sample/female2_1.jpg',
          'https://res.cloudinary.com/dtzbug8nl/image/upload/v1713804000/hen-ho-tra-sua/sample/female2_2.jpg'
        ],
        avatar: 'https://res.cloudinary.com/dtzbug8nl/image/upload/v1713804000/hen-ho-tra-sua/sample/female2_1.jpg',
        teaPreferences: ['Trà sữa truyền thống', 'Trà chanh', 'Trà đào'],
        sugarLevel: '25%',
        iceLevel: '50%',
        favoriteTea: 'Trà đào',
        lookingFor: 'relationship',
        interestedIn: ['male'],
        showInDiscovery: true
      },
      {
        _id: mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a3'),
        email: 'user3@example.com',
        password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', // 'password123'
        fullName: 'Lê Thị Hà',
        gender: 'female',
        birthDate: new Date('1999-03-10'),
        city: 'Hà Nội',
        bio: 'Kỹ sư phần mềm, yêu công nghệ và trà sữa',
        occupation: 'Kỹ sư phần mềm',
        education: 'Đại học Bách Khoa Hà Nội',
        interests: ['Công nghệ', 'Lập trình', 'Trí tuệ nhân tạo'],
        hobbies: ['Chơi game', 'Đọc sách', 'Du lịch'],
        photos: [
          'https://res.cloudinary.com/dtzbug8nl/image/upload/v1713804000/hen-ho-tra-sua/sample/female3_1.jpg',
          'https://res.cloudinary.com/dtzbug8nl/image/upload/v1713804000/hen-ho-tra-sua/sample/female3_2.jpg'
        ],
        avatar: 'https://res.cloudinary.com/dtzbug8nl/image/upload/v1713804000/hen-ho-tra-sua/sample/female3_1.jpg',
        teaPreferences: ['Trà sữa socola', 'Trà sữa matcha', 'Trà đen'],
        sugarLevel: '75%',
        iceLevel: '100%',
        favoriteTea: 'Trà sữa socola',
        lookingFor: 'friendship',
        interestedIn: ['male', 'female'],
        showInDiscovery: true
      },
      {
        _id: mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a4'),
        email: 'user4@example.com',
        password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', // 'password123'
        fullName: 'Phạm Văn Minh',
        gender: 'male',
        birthDate: new Date('1996-11-25'),
        city: 'Hà Nội',
        bio: 'Kiến trúc sư đam mê nghệ thuật và trà sữa',
        occupation: 'Kiến trúc sư',
        education: 'Đại học Kiến trúc Hà Nội',
        interests: ['Kiến trúc', 'Nghệ thuật', 'Thiết kế'],
        hobbies: ['Vẽ', 'Chụp ảnh', 'Du lịch'],
        photos: [
          'https://res.cloudinary.com/dtzbug8nl/image/upload/v1713804000/hen-ho-tra-sua/sample/male1_1.jpg',
          'https://res.cloudinary.com/dtzbug8nl/image/upload/v1713804000/hen-ho-tra-sua/sample/male1_2.jpg'
        ],
        avatar: 'https://res.cloudinary.com/dtzbug8nl/image/upload/v1713804000/hen-ho-tra-sua/sample/male1_1.jpg',
        teaPreferences: ['Trà sữa trân châu đường đen', 'Trà đen', 'Trà ô long'],
        sugarLevel: '50%',
        iceLevel: '75%',
        favoriteTea: 'Trà sữa trân châu đường đen',
        lookingFor: 'relationship',
        interestedIn: ['female'],
        showInDiscovery: true
      },
      {
        _id: mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a5'),
        email: 'user5@example.com',
        password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', // 'password123'
        fullName: 'Nguyễn Văn Hùng',
        gender: 'male',
        birthDate: new Date('1993-07-15'),
        city: 'Hà Nội',
        bio: 'Nhà báo yêu thích viết lách và trà sữa',
        occupation: 'Nhà báo',
        education: 'Học viện Báo chí và Tuyên truyền',
        interests: ['Thời sự', 'Văn học', 'Xã hội'],
        hobbies: ['Viết lách', 'Đọc sách', 'Cà phê'],
        photos: [
          'https://res.cloudinary.com/dtzbug8nl/image/upload/v1713804000/hen-ho-tra-sua/sample/male2_1.jpg',
          'https://res.cloudinary.com/dtzbug8nl/image/upload/v1713804000/hen-ho-tra-sua/sample/male2_2.jpg'
        ],
        avatar: 'https://res.cloudinary.com/dtzbug8nl/image/upload/v1713804000/hen-ho-tra-sua/sample/male2_1.jpg',
        teaPreferences: ['Trà đen', 'Trà chanh', 'Trà đào'],
        sugarLevel: '25%',
        iceLevel: '50%',
        favoriteTea: 'Trà đen',
        lookingFor: 'casual',
        interestedIn: ['female'],
        showInDiscovery: true
      },
      {
        _id: mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a6'),
        email: 'user6@example.com',
        password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', // 'password123'
        fullName: 'Trần Văn Nam',
        gender: 'male',
        birthDate: new Date('1997-04-20'),
        city: 'Hà Nội',
        bio: 'Kỹ sư IT, thích công nghệ và trà sữa',
        occupation: 'Kỹ sư IT',
        education: 'Đại học Bách Khoa Hà Nội',
        interests: ['Công nghệ', 'Lập trình', 'Game'],
        hobbies: ['Chơi game', 'Xem phim', 'Nghe nhạc'],
        photos: [
          'https://res.cloudinary.com/dtzbug8nl/image/upload/v1713804000/hen-ho-tra-sua/sample/male3_1.jpg',
          'https://res.cloudinary.com/dtzbug8nl/image/upload/v1713804000/hen-ho-tra-sua/sample/male3_2.jpg'
        ],
        avatar: 'https://res.cloudinary.com/dtzbug8nl/image/upload/v1713804000/hen-ho-tra-sua/sample/male3_1.jpg',
        teaPreferences: ['Trà sữa trân châu đường đen', 'Trà sữa matcha', 'Trà sữa socola'],
        sugarLevel: '75%',
        iceLevel: '100%',
        favoriteTea: 'Trà sữa trân châu đường đen',
        lookingFor: 'relationship',
        interestedIn: ['female'],
        showInDiscovery: true
      }
    ];

    // Lưu người dùng vào cơ sở dữ liệu
    await User.insertMany(users);
    console.log('Sample users created');

    // Tạo các địa điểm gợi ý
    const locations = [
      {
        name: 'Highlands Coffee',
        address: '54A Nguyễn Chí Thanh, Đống Đa, Hà Nội',
        coordinates: [105.8099, 21.0219],
        type: 'cafe'
      },
      {
        name: 'The Coffee House',
        address: '8 Thái Hà, Đống Đa, Hà Nội',
        coordinates: [105.8224, 21.0138],
        type: 'cafe'
      },
      {
        name: 'Phúc Long Coffee & Tea',
        address: 'TTTM Vincom Bà Triệu, Hai Bà Trưng, Hà Nội',
        coordinates: [105.8491, 21.0119],
        type: 'cafe'
      },
      {
        name: 'Gong Cha',
        address: '76 Thái Hà, Đống Đa, Hà Nội',
        coordinates: [105.8229, 21.0134],
        type: 'cafe'
      }
    ];

    // Tạo một số blindate mẫu
    const blindates = [
      {
        _id: mongoose.Types.ObjectId('61d5ec9af682fbd12a8952a1'),
        users: [
          mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a1'),
          mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a4')
        ],
        status: 'pending',
        initiator: mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a1'),
        createdAt: new Date()
      },
      {
        _id: mongoose.Types.ObjectId('61d5ec9af682fbd12a8952a2'),
        users: [
          mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a2'),
          mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a5')
        ],
        status: 'accepted',
        initiator: mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a2'),
        scheduledDate: new Date(Date.now() + 86400000), // 1 day from now
        location: 'Highlands Coffee, 54A Nguyễn Chí Thanh',
        createdAt: new Date()
      }
    ];

    await Blindate.insertMany(blindates);
    console.log('Sample blindates created');

    // Tạo báo cáo mẫu
    const reports = [
      {
        _id: mongoose.Types.ObjectId('62d5ec9af682fbd12a8952a1'),
        reporter: mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a1'),
        reported: mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a5'),
        type: 'harassment',
        reason: 'Quấy rối',
        description: 'Người dùng này đã gửi tin nhắn quấy rối nhiều lần',
        status: 'chờ_xử_lý',
        createdAt: new Date(),
        evidence: []
      },
      {
        _id: mongoose.Types.ObjectId('62d5ec9af682fbd12a8952a2'),
        reporter: mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a2'),
        reported: mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a6'),
        type: 'fake_profile',
        reason: 'Tài khoản giả mạo',
        description: 'Tôi nghĩ đây là tài khoản giả mạo',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        evidence: []
      },
      {
        _id: mongoose.Types.ObjectId('62d5ec9af682fbd12a8952a3'),
        reporter: mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a3'),
        reported: mongoose.Types.ObjectId('60d5ec9af682fbd12a8952a4'),
        type: 'inappropriate_content',
        reason: 'Nội dung không phù hợp',
        description: 'Hình ảnh không phù hợp trong hồ sơ',
        status: 'resolved',
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        evidence: [],
        adminNotes: 'Đã yêu cầu người dùng thay đổi hình ảnh',
        resolution: 'Đã yêu cầu người dùng thay đổi hình ảnh và họ đã tuân thủ'
      }
    ];

    await Report.insertMany(reports);
    console.log('Sample reports created');

    console.log('All sample data created successfully');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

module.exports = {
  connect,
  closeDatabase,
  clearDatabase
};