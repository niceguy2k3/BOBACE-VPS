const mongoose = require('mongoose');
const User = require('../models/user.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Vietnamese names
const maleFirstNames = ['Minh', 'Hùng', 'Đức', 'Tuấn', 'Quang', 'Hải', 'Nam', 'Hoàng', 'Thành', 'Dũng', 'Trung', 'Tùng', 'Anh', 'Phong', 'Khoa', 'Bảo', 'Đạt', 'Hiếu', 'Tâm', 'Việt'];
const femaleFirstNames = ['Hương', 'Lan', 'Thảo', 'Trang', 'Hà', 'Linh', 'Mai', 'Phương', 'Anh', 'Ngọc', 'Hằng', 'Thủy', 'Quỳnh', 'Nhung', 'Yến', 'Hoa', 'Hiền', 'Thúy', 'Vân', 'Thanh'];
const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đào', 'Đinh', 'Lâm', 'Mai'];

// Occupations
const occupations = ['Giáo viên', 'Kỹ sư phần mềm', 'Bác sĩ', 'Nhân viên văn phòng', 'Nhà thiết kế', 'Kiến trúc sư', 'Nhân viên ngân hàng', 'Nhà báo', 'Đầu bếp', 'Nhân viên marketing', 'Luật sư', 'Kế toán', 'Nhân viên kinh doanh', 'Nhà quản lý', 'Nghệ sĩ', 'Nhạc sĩ', 'Nhiếp ảnh gia', 'Nhà văn', 'Dược sĩ', 'Nhà nghiên cứu'];

// Education
const education = ['Đại học', 'Cao đẳng', 'Thạc sĩ', 'Tiến sĩ', 'Trung cấp'];
const schools = ['Đại học Quốc gia Hà Nội', 'Đại học Bách khoa Hà Nội', 'Đại học Ngoại thương', 'Đại học Kinh tế Quốc dân', 'Đại học Y Hà Nội', 'Đại học Sư phạm Hà Nội', 'Đại học Luật Hà Nội', 'Đại học Quốc gia TP.HCM', 'Đại học Bách khoa TP.HCM', 'Đại học Kinh tế TP.HCM'];

// Cities
const cities = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Huế', 'Nha Trang', 'Vũng Tàu', 'Đà Lạt', 'Hạ Long'];

// Interests and hobbies
const interests = ['Âm nhạc', 'Phim ảnh', 'Du lịch', 'Đọc sách', 'Thể thao', 'Nấu ăn', 'Nhiếp ảnh', 'Công nghệ', 'Thời trang', 'Nghệ thuật', 'Thiên nhiên', 'Khoa học', 'Lịch sử', 'Triết học', 'Tâm lý học', 'Kinh doanh', 'Tài chính', 'Ngoại ngữ', 'Yoga', 'Thiền'];
const hobbies = ['Chơi đàn guitar', 'Chạy bộ', 'Bơi lội', 'Vẽ tranh', 'Nấu ăn', 'Làm bánh', 'Chơi game', 'Xem phim', 'Đọc sách', 'Đi du lịch', 'Chụp ảnh', 'Trồng cây', 'Tập gym', 'Đạp xe', 'Cắm trại', 'Học ngoại ngữ', 'Sưu tầm', 'Viết blog', 'Thiền', 'Yoga'];

// Tea preferences
const teaPreferences = ['Trà sữa truyền thống', 'Trà sữa trân châu đường đen', 'Trà sữa matcha', 'Trà đào', 'Trà vải', 'Trà chanh', 'Trà sữa ô long', 'Trà sữa khoai môn', 'Trà sữa socola', 'Trà sữa dâu', 'Trà sữa bạc hà', 'Trà sữa caramel', 'Trà sữa hoa nhài', 'Trà sữa bạc hà', 'Trà sữa khoai môn'];
const toppings = ['Trân châu đen', 'Trân châu trắng', 'Thạch trái cây', 'Thạch nha đam', 'Pudding', 'Kem cheese', 'Đậu đỏ', 'Sương sáo', 'Thạch cà phê', 'Trân châu hoàng kim'];
const sugarLevels = ['0%', '25%', '50%', '75%', '100%'];
const iceLevels = ['0%', '25%', '50%', '75%', '100%'];

// Languages
const languages = ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Trung', 'Tiếng Nhật', 'Tiếng Hàn', 'Tiếng Pháp', 'Tiếng Đức', 'Tiếng Nga', 'Tiếng Tây Ban Nha', 'Tiếng Ý'];

// Zodiac signs
const zodiacSigns = ['Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải', 'Sư Tử', 'Xử Nữ', 'Thiên Bình', 'Bọ Cạp', 'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư'];

// Helper functions
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomElements = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * count) + 1);
};
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomBool = () => Math.random() > 0.5;

// Generate a random user
const generateRandomUser = (index) => {
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  const firstName = gender === 'male' ? getRandomElement(maleFirstNames) : getRandomElement(femaleFirstNames);
  const lastName = getRandomElement(lastNames);
  const fullName = `${lastName} ${firstName}`;
  
  // Generate a birth date for someone between 18 and 45 years old
  const now = new Date();
  const minDate = new Date(now);
  minDate.setFullYear(now.getFullYear() - 45);
  const maxDate = new Date(now);
  maxDate.setFullYear(now.getFullYear() - 18);
  const birthDate = getRandomDate(minDate, maxDate);
  
  // Generate random coordinates around Vietnam
  const latitude = getRandomInt(8, 23) + Math.random();
  const longitude = getRandomInt(102, 109) + Math.random();
  
  // Generate random height between 150cm and 190cm
  const height = getRandomInt(150, 190);
  
  // Generate random interests in the opposite gender
  const interestedIn = gender === 'male' ? ['female'] : ['male'];
  if (Math.random() > 0.8) {
    interestedIn.push(gender); // 20% chance to be interested in same gender too
  }
  
  return {
    email: `user${index}@example.com`,
    password: '$2b$10$5sNmh2UCPa1//IICMHBaiOZZQ3WMuIN8FAbzcQC8rTAB6NuyEcXxm', // The provided password hash
    fullName,
    birthDate,
    gender,
    interestedIn,
    avatar: `https://randomuser.me/api/portraits/${gender === 'male' ? 'men' : 'women'}/${index % 100}.jpg`,
    photos: [
      `https://randomuser.me/api/portraits/${gender === 'male' ? 'men' : 'women'}/${(index + 10) % 100}.jpg`,
      `https://randomuser.me/api/portraits/${gender === 'male' ? 'men' : 'women'}/${(index + 20) % 100}.jpg`,
      `https://randomuser.me/api/portraits/${gender === 'male' ? 'men' : 'women'}/${(index + 30) % 100}.jpg`
    ],
    bio: `Xin chào, mình là ${firstName}. ${Math.random() > 0.5 ? 'Mình thích uống trà sữa và đi du lịch.' : 'Mình đang tìm kiếm một mối quan hệ nghiêm túc.'}`,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    },
    city: getRandomElement(cities),
    occupation: getRandomElement(occupations),
    education: getRandomElement(education),
    school: getRandomElement(schools),
    interests: getRandomElements(interests, 5),
    hobbies: getRandomElements(hobbies, 5),
    teaPreferences: getRandomElements(teaPreferences, 3),
    favoriteTea: getRandomElement(teaPreferences),
    sugarLevel: getRandomElement(sugarLevels),
    iceLevel: getRandomElement(iceLevels),
    toppings: getRandomElements(toppings, 3),
    height,
    languages: getRandomElements(languages, 3),
    zodiacSign: getRandomElement(zodiacSigns),
    lookingFor: getRandomElement(['relationship', 'friendship', 'casual', 'marriage', 'not-sure']),
    lifestyle: {
      smoking: getRandomElement(['never', 'sometimes', 'often', 'quitting']),
      drinking: getRandomElement(['never', 'sometimes', 'often', 'quitting']),
      exercise: getRandomElement(['never', 'sometimes', 'often', 'daily']),
      diet: getRandomElement(['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'other'])
    },
    premium: Math.random() > 0.9, // 10% chance to be premium
    verification: {
      isVerified: Math.random() > 0.3, // 70% chance to be verified
      method: getRandomElement(['phone', 'email', 'government_id', 'social_media']),
      verifiedAt: new Date()
    },
    showInDiscovery: true,
    distancePreference: getRandomInt(10, 100),
    agePreference: {
      min: getRandomInt(18, 30),
      max: getRandomInt(30, 50)
    },
    online: Math.random() > 0.7, // 30% chance to be online
    lastActive: new Date(),
    settings: {
      notifications: {
        newMatches: true,
        newMessages: true
      },
      privacy: {
        showProfile: true,
        allowLocationSearch: true,
        incognitoMode: false
      }
    }
  };
};

// Generate and insert 50 users
const generateUsers = async () => {
  try {
    console.log('Generating 50 random users...');
    
    const users = [];
    for (let i = 1; i <= 50; i++) {
      users.push(generateRandomUser(i));
    }
    
    // Insert users into the database
    const result = await User.insertMany(users);
    console.log(`Successfully inserted ${result.length} users`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error generating users:', error);
    await mongoose.disconnect();
  }
};

// Run the script
generateUsers();