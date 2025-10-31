// API URL with fallback to localhost for development
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const VIETNAM_CITIES = [
  { value: 'An Giang', label: 'An Giang' },
  { value: 'Bà Rịa - Vũng Tàu', label: 'Bà Rịa - Vũng Tàu' },
  { value: 'Bắc Giang', label: 'Bắc Giang' },
  { value: 'Bắc Kạn', label: 'Bắc Kạn' },
  { value: 'Bạc Liêu', label: 'Bạc Liêu' },
  { value: 'Bắc Ninh', label: 'Bắc Ninh' },
  { value: 'Bến Tre', label: 'Bến Tre' },
  { value: 'Bình Định', label: 'Bình Định' },
  { value: 'Bình Dương', label: 'Bình Dương' },
  { value: 'Bình Phước', label: 'Bình Phước' },
  { value: 'Bình Thuận', label: 'Bình Thuận' },
  { value: 'Cà Mau', label: 'Cà Mau' },
  { value: 'Cần Thơ', label: 'Cần Thơ' },
  { value: 'Cao Bằng', label: 'Cao Bằng' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  { value: 'Đắk Lắk', label: 'Đắk Lắk' },
  { value: 'Đắk Nông', label: 'Đắk Nông' },
  { value: 'Điện Biên', label: 'Điện Biên' },
  { value: 'Đồng Nai', label: 'Đồng Nai' },
  { value: 'Đồng Tháp', label: 'Đồng Tháp' },
  { value: 'Gia Lai', label: 'Gia Lai' },
  { value: 'Hà Giang', label: 'Hà Giang' },
  { value: 'Hà Nam', label: 'Hà Nam' },
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'Hà Tĩnh', label: 'Hà Tĩnh' },
  { value: 'Hải Dương', label: 'Hải Dương' },
  { value: 'Hải Phòng', label: 'Hải Phòng' },
  { value: 'Hậu Giang', label: 'Hậu Giang' },
  { value: 'Hòa Bình', label: 'Hòa Bình' },
  { value: 'Hưng Yên', label: 'Hưng Yên' },
  { value: 'Khánh Hòa', label: 'Khánh Hòa' },
  { value: 'Kiên Giang', label: 'Kiên Giang' },
  { value: 'Kon Tum', label: 'Kon Tum' },
  { value: 'Lai Châu', label: 'Lai Châu' },
  { value: 'Lâm Đồng', label: 'Lâm Đồng' },
  { value: 'Lạng Sơn', label: 'Lạng Sơn' },
  { value: 'Lào Cai', label: 'Lào Cai' },
  { value: 'Long An', label: 'Long An' },
  { value: 'Nam Định', label: 'Nam Định' },
  { value: 'Nghệ An', label: 'Nghệ An' },
  { value: 'Ninh Bình', label: 'Ninh Bình' },
  { value: 'Ninh Thuận', label: 'Ninh Thuận' },
  { value: 'Phú Thọ', label: 'Phú Thọ' },
  { value: 'Phú Yên', label: 'Phú Yên' },
  { value: 'Quảng Bình', label: 'Quảng Bình' },
  { value: 'Quảng Nam', label: 'Quảng Nam' },
  { value: 'Quảng Ngãi', label: 'Quảng Ngãi' },
  { value: 'Quảng Ninh', label: 'Quảng Ninh' },
  { value: 'Quảng Trị', label: 'Quảng Trị' },
  { value: 'Sóc Trăng', label: 'Sóc Trăng' },
  { value: 'Sơn La', label: 'Sơn La' },
  { value: 'Tây Ninh', label: 'Tây Ninh' },
  { value: 'Thái Bình', label: 'Thái Bình' },
  { value: 'Thái Nguyên', label: 'Thái Nguyên' },
  { value: 'Thanh Hóa', label: 'Thanh Hóa' },
  { value: 'Thừa Thiên Huế', label: 'Thừa Thiên Huế' },
  { value: 'Tiền Giang', label: 'Tiền Giang' },
  { value: 'TP Hồ Chí Minh', label: 'TP Hồ Chí Minh' },
  { value: 'Trà Vinh', label: 'Trà Vinh' },
  { value: 'Tuyên Quang', label: 'Tuyên Quang' },
  { value: 'Vĩnh Long', label: 'Vĩnh Long' },
  { value: 'Vĩnh Phúc', label: 'Vĩnh Phúc' },
  { value: 'Yên Bái', label: 'Yên Bái' }
];

export const TEA_PREFERENCES = [
  'Trà sữa truyền thống',
  'Trà sữa trân châu đường đen',
  'Trà sữa matcha',
  'Trà sữa socola',
  'Trà sữa khoai môn',
  'Trà sữa dâu',
  'Trà đào',
  'Trà vải',
  'Trà chanh',
  'Trà đen',
  'Trà xanh',
  'Trà ô long'
];

export const TEA_TOPPINGS = [
  'Trân châu đen',
  'Trân châu trắng',
  'Trân châu đường đen',
  'Thạch trái cây',
  'Thạch nha đam',
  'Pudding',
  'Kem cheese',
  'Đậu đỏ',
  'Sương sáo',
  'Thạch cà phê',
  'Thạch matcha'
];

export const HOBBIES = [
  'Đọc sách',
  'Xem phim',
  'Du lịch',
  'Nấu ăn',
  'Chơi thể thao',
  'Nghe nhạc',
  'Chơi nhạc cụ',
  'Vẽ tranh',
  'Chụp ảnh',
  'Viết lách',
  'Yoga',
  'Thiền',
  'Khiêu vũ',
  'Làm vườn',
  'Thủ công',
  'Chơi game',
  'Học ngoại ngữ',
  'Đi cà phê',
  'Đi trà sữa',
  'Tụ tập bạn bè'
];

export const LANGUAGES = [
  'Tiếng Việt',
  'Tiếng Anh',
  'Tiếng Trung',
  'Tiếng Nhật',
  'Tiếng Hàn',
  'Tiếng Pháp',
  'Tiếng Đức',
  'Tiếng Tây Ban Nha',
  'Tiếng Nga',
  'Tiếng Ý',
  'Tiếng Thái',
  'Khác'
];

export const LOOKING_FOR_OPTIONS = [
  { value: 'relationship', label: 'Mối quan hệ nghiêm túc' },
  { value: 'friendship', label: 'Tình bạn' },
  { value: 'casual', label: 'Hẹn hò không ràng buộc' },
  { value: 'marriage', label: 'Hướng đến hôn nhân' },
  { value: 'not-sure', label: 'Chưa chắc chắn' }
];

export const LIFESTYLE_OPTIONS = {
  smoking: [
    { value: 'never', label: 'Không bao giờ' },
    { value: 'sometimes', label: 'Thỉnh thoảng' },
    { value: 'often', label: 'Thường xuyên' },
    { value: 'quitting', label: 'Đang cai' }
  ],
  drinking: [
    { value: 'never', label: 'Không bao giờ' },
    { value: 'sometimes', label: 'Thỉnh thoảng' },
    { value: 'often', label: 'Thường xuyên' },
    { value: 'quitting', label: 'Đang cai' }
  ],
  exercise: [
    { value: 'never', label: 'Không bao giờ' },
    { value: 'sometimes', label: 'Thỉnh thoảng' },
    { value: 'often', label: 'Thường xuyên' },
    { value: 'daily', label: 'Hàng ngày' }
  ],
  diet: [
    { value: 'omnivore', label: 'Ăn tạp' },
    { value: 'vegetarian', label: 'Ăn chay' },
    { value: 'vegan', label: 'Ăn thuần chay' },
    { value: 'pescatarian', label: 'Ăn chay và hải sản' },
    { value: 'keto', label: 'Keto' },
    { value: 'other', label: 'Khác' }
  ]
};

export const TEA_FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Hàng ngày' },
  { value: 'weekly', label: 'Hàng tuần' },
  { value: 'monthly', label: 'Hàng tháng' },
  { value: 'rarely', label: 'Hiếm khi' }
];

export const SUGAR_ICE_LEVELS = [
  { value: '0%', label: '0%' },
  { value: '25%', label: '25%' },
  { value: '50%', label: '50%' },
  { value: '75%', label: '75%' },
  { value: '100%', label: '100%' }
];

export const ZODIAC_SIGNS = [
  { value: 'Bạch Dương', label: 'Bạch Dương (21/3 - 19/4)' },
  { value: 'Kim Ngưu', label: 'Kim Ngưu (20/4 - 20/5)' },
  { value: 'Song Tử', label: 'Song Tử (21/5 - 20/6)' },
  { value: 'Cự Giải', label: 'Cự Giải (21/6 - 22/7)' },
  { value: 'Sư Tử', label: 'Sư Tử (23/7 - 22/8)' },
  { value: 'Xử Nữ', label: 'Xử Nữ (23/8 - 22/9)' },
  { value: 'Thiên Bình', label: 'Thiên Bình (23/9 - 22/10)' },
  { value: 'Bọ Cạp', label: 'Bọ Cạp (23/10 - 21/11)' },
  { value: 'Nhân Mã', label: 'Nhân Mã (22/11 - 21/12)' },
  { value: 'Ma Kết', label: 'Ma Kết (22/12 - 19/1)' },
  { value: 'Bảo Bình', label: 'Bảo Bình (20/1 - 18/2)' },
  { value: 'Song Ngư', label: 'Song Ngư (19/2 - 20/3)' }
];