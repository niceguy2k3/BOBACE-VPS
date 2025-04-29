// Danh sách bio mẫu cho nam
const maleBios = [
  "Yêu thích trà sữa và âm nhạc. Đang tìm kiếm một người bạn đồng hành cùng khám phá các quán trà sữa mới.",
  "Kỹ sư phần mềm, thích đọc sách và uống trà sữa vào cuối tuần. Mong tìm được người có cùng sở thích.",
  "Người hướng nội nhưng luôn sẵn sàng cho những cuộc trò chuyện sâu sắc. Không thể sống thiếu trà sữa mỗi ngày.",
  "Đam mê du lịch và khám phá. Luôn mang theo một ly trà sữa trong mỗi chuyến đi.",
  "Yêu thể thao và ẩm thực. Tin rằng một ly trà sữa ngon có thể làm ngày của bạn tốt hơn.",
  "Người lạc quan, thích cười và tận hưởng những điều đơn giản trong cuộc sống như một ly trà sữa ngon.",
  "Đang tìm kiếm một người bạn đồng hành cùng thưởng thức trà sữa và chia sẻ những câu chuyện thú vị.",
  "Người của công việc nhưng luôn dành thời gian cho bản thân. Trà sữa là cách tôi thư giãn mỗi ngày.",
  "Yêu thiên nhiên và động vật. Thích ngồi ở quán trà sữa yên tĩnh để đọc sách hoặc làm việc.",
  "Người hướng ngoại, thích gặp gỡ bạn bè và thưởng thức trà sữa cùng nhau. Đang tìm kiếm một nửa còn lại."
];

// Danh sách bio mẫu cho nữ
const femaleBios = [
  "Yêu thích trà sữa và âm nhạc. Đang tìm kiếm một người bạn đồng hành cùng khám phá các quán trà sữa mới.",
  "Giáo viên tiểu học, thích đọc sách và uống trà sữa vào cuối tuần. Mong tìm được người có cùng sở thích.",
  "Người hướng nội nhưng luôn sẵn sàng cho những cuộc trò chuyện sâu sắc. Không thể sống thiếu trà sữa mỗi ngày.",
  "Đam mê du lịch và khám phá. Luôn mang theo một ly trà sữa trong mỗi chuyến đi.",
  "Yêu ẩm thực và nghệ thuật. Tin rằng một ly trà sữa ngon có thể làm ngày của bạn tốt hơn.",
  "Người lạc quan, thích cười và tận hưởng những điều đơn giản trong cuộc sống như một ly trà sữa ngon.",
  "Đang tìm kiếm một người bạn đồng hành cùng thưởng thức trà sữa và chia sẻ những câu chuyện thú vị.",
  "Người của công việc nhưng luôn dành thời gian cho bản thân. Trà sữa là cách tôi thư giãn mỗi ngày.",
  "Yêu thiên nhiên và động vật. Thích ngồi ở quán trà sữa yên tĩnh để đọc sách hoặc làm việc.",
  "Người hướng ngoại, thích gặp gỡ bạn bè và thưởng thức trà sữa cùng nhau. Đang tìm kiếm một nửa còn lại."
];

// Hàm tạo người dùng ngẫu nhiên
const generateRandomUser = (index) => {
  // Xác định giới tính (60% nữ, 40% nam)
  const gender = Math.random() < 0.6 ? 'female' : 'male';
  
  // Tạo tên đầy đủ
  let fullName;
  if (gender === 'male') {
    const lastName = getRandomElement(lastNames);
    const middleName = getRandomElement(maleMiddleNames);
    const firstName = getRandomElement(maleFirstNames);
    fullName = `${lastName} ${middleName} ${firstName}`;
  } else {
    const lastName = getRandomElement(lastNames);
    const middleName = getRandomElement(femaleMiddleNames);
    const firstName = getRandomElement(femaleFirstNames);
    fullName = `${lastName} ${middleName} ${firstName}`;
  }
  
  // Tạo email
  const emailName = fullName.toLowerCase().replace(/ /g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const randomNum = getRandomInt(1, 999);
  const domain = getRandomElement(emailDomains);
  const email = `${emailName}${randomNum}@${domain}`;
  
  // Tạo mật khẩu (mã hóa)
  const password = '$2b$10$zUEQD.MeL7g8sXDkOiKJVOJL1lpBMMjfFzocUqPdVDXsPk9SXamrK'; // Mật khẩu mặc định đã mã hóa
  
  // Tạo ngày sinh (18-60 tuổi)
  const now = new Date();
  const minBirthYear = now.getFullYear() - 60;
  const maxBirthYear = now.getFullYear() - 18;
  const birthDate = getRandomDate(new Date(minBirthYear, 0, 1), new Date(maxBirthYear, 11, 31));
  
  // Tạo chiều cao (nam: 160-185cm, nữ: 150-170cm)
  const height = gender === 'male' ? getRandomInt(160, 185) : getRandomInt(150, 170);
  
  // Tạo vị trí (tọa độ ngẫu nhiên ở Việt Nam)
  const latitude = getRandomInt(8, 23) + Math.random();
  const longitude = getRandomInt(102, 109) + Math.random();
  
  // Bỏ phần avatar và photos
  let avatar = '';  // Giữ avatar rỗng cho phép upload sau
  let photos = [];  // Giữ ảnh rỗng cho phép upload sau
  
  // Tạo bio
  const bio = gender === 'male' ? getRandomElement(maleBios) : getRandomElement(femaleBios);
  
  // Tạo sở thích giới tính (90% dị tính, 5% đồng tính, 5% cả hai)
  let interestedIn;
  const orientation = Math.random();
  if (orientation < 0.9) {
    interestedIn = gender === 'male' ? ['female'] : ['male'];
  } else if (orientation < 0.95) {
    interestedIn = gender === 'male' ? ['male'] : ['female'];
  } else {
    interestedIn = ['male', 'female'];
  }
  
  // Đảm bảo mỗi người dùng có ít nhất một sở thích về trà sữa
  const userTeaPreferences = getRandomElements(teaPreferences, getRandomInt(1, 4));
  
  // Tạo thời gian
  const now_date = new Date();
  const createdAt = new Date(now_date.getTime() - getRandomInt(1, 90) * 24 * 60 * 60 * 1000);
  const lastActive = new Date(createdAt.getTime() + getRandomInt(0, (now_date - createdAt) / (24 * 60 * 60 * 1000)) * 24 * 60 * 60 * 1000);
  
  // Tạo ID ngẫu nhiên
  const oid = uuidv4().replace(/-/g, '').substring(0, 24);
  
  // Tạo người dùng
  return {
    _id: {
      $oid: oid
    },
    email,
    password,
    fullName,
    birthDate: {
      $date: birthDate.toISOString()
    },
    gender,
    interestedIn,
    avatar,  // Bỏ avatar
    photos,  // Bỏ photos
    bio,
    location: {
      type: "Point",
      coordinates: [longitude, latitude]
    },
    address: "",
    city: getRandomElement(cities),
    teaPreferences: userTeaPreferences,
    favoriteTea: userTeaPreferences.length > 0 ? getRandomElement(userTeaPreferences) : getRandomElement(teaPreferences),
    teaFrequency: getRandomElement(["Hàng ngày", "Vài lần một tuần", "Một lần một tuần", "Thỉnh thoảng"]),
    sugarLevel: getRandomElement(sugarLevels),
    iceLevel: getRandomElement(iceLevels),
    toppings: getRandomElements(toppings, getRandomInt(0, 3)),
    height,
    occupation: getRandomElement(occupations),
    company: "",
    education: getRandomElement(education),
    school: getRandomElement(schools),
    interests: getRandomElements(interests, getRandomInt(3, 8)),
    hobbies: getRandomElements(hobbies, getRandomInt(3, 8)),
    lookingFor: getRandomElement(['relationship', 'friendship', 'casual', 'marriage', 'not-sure']),
    lifestyle: {
      smoking: getRandomElement(['never', 'sometimes', 'often', 'quitting', '']),
      drinking: getRandomElement(['never', 'sometimes', 'often', 'quitting', '']),
      exercise: getRandomElement(['never', 'sometimes', 'often', 'daily', '']),
      diet: getRandomElement(['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'other', ''])
    },
    languages: getRandomElements(languages, getRandomInt(1, 3)),
    zodiacSign: getRandomElement(zodiacSigns),
    premium: Math.random() < 0.1, // 10% người dùng có premium
    role: "user",
    verification: {
      isVerified: Math.random() < 0.7, // 70% người dùng đã xác minh
      method: "selfie",
      verifiedAt: {
        $date: createdAt.toISOString()
      },
      documents: [],
      selfiePhoto: "",
      verificationStatus: ""
    },
    banned: false,
    bannedReason: "",
    bannedAt: null,
    showInDiscovery: true,
    distancePreference: getRandomInt(10, 100),
    agePreference: {
      min: 18,
      max: getRandomInt(30, 60)
    },
    blockedUsers: [],
    online: Math.random() < 0.3, // 30% người dùng đang online
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
    },
    lastActive: {
      $date: lastActive.toISOString()
    },
    reports: [],
    createdAt: {
      $date: createdAt.toISOString()
    },
    updatedAt: {
      $date: lastActive.toISOString()
    },
    __v: 0
  };
};

// Tạo người dùng ngẫu nhiên với tỷ lệ nam/nữ cụ thể
const generateUsers = (count, maleRatio = 0.4) => {
  const users = [];
  const maleCount = Math.floor(count * maleRatio);
  const femaleCount = count - maleCount;
  
  console.log(`Tạo ${maleCount} người dùng nam và ${femaleCount} người dùng nữ...`);
  
  // Tạo người dùng nam
  for (let i = 0; i < maleCount; i++) {
    const user = generateRandomUser(i);
    user.gender = 'male';
    users.push(user);
  }
  
  // Tạo người dùng nữ
  for (let i = 0; i < femaleCount; i++) {
    const user = generateRandomUser(maleCount + i);
    user.gender = 'female';
    users.push(user);
  }
  
  // Xáo trộn mảng người dùng
  return users.sort(() => 0.5 - Math.random());
};

// Tạo và lưu dữ liệu
const users = generateUsers(10, 0.4); // 40% nam, 60% nữ
fs.writeFileSync(
  path.join(__dirname, 'DATABASE', 'vietnamese-users.json'),
  JSON.stringify(users, null, 2),
  'utf8'
);

console.log(`Đã tạo thành công ${users.length} người dùng Việt Nam ngẫu nhiên.`);
console.log(`Trong đó có ${users.filter(u => u.gender === 'male').length} nam và ${users.filter(u => u.gender === 'female').length} nữ.`);
console.log(`Dữ liệu đã được lưu vào file: DATABASE/vietnamese-users.json`);
