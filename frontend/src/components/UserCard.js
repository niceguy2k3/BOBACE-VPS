import React, { useState, useEffect } from 'react';
import { FaHeart, FaTimes, FaInfoCircle, FaMapMarkerAlt, FaSearch, FaMugHot, FaRunning, FaChevronLeft, FaChevronRight, FaCrown, FaUserCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const UserCard = ({ user, onLike, onDislike, onViewProfile }) => {
  // Kiểm tra dữ liệu người dùng
  console.log('User data in UserCard:', user);
  console.log('User verified status:', user?.verified);
  
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Kiểm tra xem người dùng có nhiều ảnh không
  const hasPhotos = user.photos && user.photos.length > 0;
  const hasMultipleImages = user.photos && user.photos.length > 1;
  
  // Đảm bảo rằng currentImageIndex không vượt quá số lượng ảnh
  useEffect(() => {
    if (hasPhotos && currentImageIndex >= user.photos.length) {
      setCurrentImageIndex(0);
    }
  }, [user.photos, hasPhotos, currentImageIndex]);
  
  // Xử lý chuyển ảnh trước đó
  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (hasPhotos) {
      setCurrentImageIndex(prevIndex => 
        prevIndex === 0 ? user.photos.length - 1 : prevIndex - 1
      );
    }
  };
  
  // Xử lý chuyển ảnh tiếp theo
  const handleNextImage = (e) => {
    e.stopPropagation();
    if (hasPhotos) {
      setCurrentImageIndex(prevIndex => 
        prevIndex === user.photos.length - 1 ? 0 : prevIndex + 1
      );
    }
  };
  
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getLookingForText = (value) => {
    switch(value) {
      case 'relationship': return 'Mối quan hệ nghiêm túc';
      case 'friendship': return 'Tình bạn';
      case 'casual': return 'Hẹn hò không ràng buộc';
      case 'marriage': return 'Hướng đến hôn nhân';
      case 'not-sure': return 'Chưa chắc chắn';
      default: return '';
    }
  };
  
  // Hiển thị thông tin giới tính bằng tiếng Việt
  const getGenderText = (gender) => {
    if (!gender) return '';
    
    // Chuyển đổi giá trị tiếng Anh sang tiếng Việt
    const genderMap = {
      'male': 'Nam',
      'female': 'Nữ',
      'non-binary': 'Phi nhị nguyên',
      'transgender': 'Chuyển giới',
      'genderqueer': 'Phi giới tính',
      'genderfluid': 'Giới tính linh hoạt',
      'agender': 'Không xác định giới tính',
      'other': 'Khác'
    };
    
    return genderMap[gender] || gender;
  };

  return (
    <motion.div 
      className="relative w-full max-w-sm mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* User Image */}
      <div className="h-96 overflow-hidden relative">
        {user.avatar ? (
          <motion.img 
            src={user.avatar} 
            alt={user.fullName} 
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : hasPhotos ? (
          <>
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentImageIndex}
                src={hasPhotos && currentImageIndex < user.photos.length ? user.photos[currentImageIndex] : ''} 
                alt={`${user.fullName} - ảnh ${currentImageIndex + 1}`} 
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>
            
            {/* Hiển thị điều khiển slide khi có nhiều hơn 1 ảnh */}
            {hasMultipleImages && (
              <>
                {/* Nút điều hướng trái */}
                <button 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  onClick={handlePrevImage}
                  aria-label="Ảnh trước"
                >
                  <FaChevronLeft />
                </button>
                
                {/* Nút điều hướng phải */}
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  onClick={handleNextImage}
                  aria-label="Ảnh tiếp theo"
                >
                  <FaChevronRight />
                </button>
                
                {/* Chỉ báo vị trí ảnh */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1.5">
                  {user.photos.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      aria-label={`Chuyển đến ảnh ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
            <span className="text-neutral-500 text-xl">Không có ảnh</span>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-70"></div>
        
        {/* User name and age on image */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="flex items-center">
            <h3 className="text-2xl font-bold">
              {user.fullName}, {calculateAge(user.birthDate)}
            </h3>
            <div className="flex ml-2 space-x-1">
              {user.premium && (
                <div className="flex items-center bg-yellow-400/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  <FaCrown className="text-yellow-800 mr-1" size={12} />
                  <span className="text-xs font-medium text-yellow-800">Premium</span>
                </div>
              )}
              {user.verified && (
                <div className="flex items-center bg-green-400/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  <FaUserCheck className="text-green-800 mr-1" size={10} />
                  <span className="text-xs font-medium text-green-800">Đã xác minh</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center mt-1">
            <FaMapMarkerAlt className="mr-1 text-yellow-400" />
            <p className="text-sm text-white/90">
              {user.city ? user.city : ''}
              {user.distance !== undefined && (
                <span className="ml-1">
                  {user.distance < 1000 
                    ? `(${Math.round(user.distance)} m)` 
                    : `(${(user.distance / 1000).toFixed(1)} km)`}
                </span>
              )}
            </p>
          </div>
        </div>
        
        {/* Info button */}
        <button 
          onClick={() => onViewProfile(user)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300"
          aria-label="Xem thông tin chi tiết"
        >
          <FaInfoCircle size={20} />
        </button>
      </div>
      
      {/* User Info */}
      <div className="p-5">
        {/* Gender and Looking For */}
        <div className="mb-3">
          <div className="flex flex-col space-y-2">
            {user.gender && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm font-medium text-neutral-700">
                  Giới tính: <span className="text-purple-600">{getGenderText(user.gender)}</span>
                </p>
              </div>
            )}
            
            {user.lookingFor && (
              <div className="flex items-center">
                <FaSearch className="mr-2 text-yellow-500" />
                <p className="text-sm font-medium text-neutral-700">
                  Đang tìm: <span className="text-yellow-600">{getLookingForText(user.lookingFor)}</span>
                </p>
              </div>
            )}
            
            {user.education && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                <p className="text-sm font-medium text-neutral-700">
                  Học vấn: <span className="text-blue-600">{user.education}</span>
                </p>
              </div>
            )}
            
            {user.occupation && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium text-neutral-700">
                  Nghề nghiệp: <span className="text-gray-600">{user.occupation}</span>
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Tea Preferences */}
        {user.teaPreferences && user.teaPreferences.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center mb-1">
              <FaMugHot className="mr-2 text-yellow-500" />
              <p className="text-sm font-medium text-neutral-700">Yêu thích trà sữa:</p>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {user.teaPreferences.slice(0, 3).map((tea, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full"
                >
                  {tea}
                </span>
              ))}
              {user.teaPreferences.length > 3 && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  +{user.teaPreferences.length - 3}
                </span>
              )}
            </div>
            
            {/* Thông tin về đường và đá */}
            {(user.sugarLevel || user.iceLevel) && (
              <div className="flex flex-wrap gap-3 mt-2">
                {user.sugarLevel && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-neutral-600">Đường: {user.sugarLevel}</span>
                  </div>
                )}
                {user.iceLevel && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-neutral-600">Đá: {user.iceLevel}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Hiển thị trà sữa yêu thích nhất */}
            {user.favoriteTea && (
              <div className="mt-2 text-xs text-neutral-600 italic">
                Yêu thích nhất: {user.favoriteTea}
              </div>
            )}
          </div>
        )}
        
        {/* Hobbies */}
        {user.hobbies && user.hobbies.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center mb-1">
              <FaRunning className="mr-2 text-blue-500" />
              <p className="text-sm font-medium text-neutral-700">Sở thích:</p>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {user.hobbies.slice(0, 3).map((hobby, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                >
                  {hobby}
                </span>
              ))}
              {user.hobbies.length > 3 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  +{user.hobbies.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Thông tin thêm: Cung hoàng đạo, chiều cao */}
        <div className="flex flex-wrap gap-3 mb-3">
          {user.zodiacSign && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="text-sm text-neutral-600">{user.zodiacSign}</span>
            </div>
          )}
          
          {user.height && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm text-neutral-600">{user.height} cm</span>
            </div>
          )}
        </div>
        
        {/* Bio */}
        {user.bio && (
          <div className="mt-3 bg-gray-50 p-3 rounded-lg">
            <p className="text-neutral-600 text-sm line-clamp-3">
              {user.bio}
            </p>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-center p-5 border-t border-neutral-100">
        <motion.button 
          onClick={() => onDislike(user._id)}
          className="mx-3 p-4 rounded-full bg-white text-red-500 shadow-md hover:shadow-lg transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Không thích"
        >
          <FaTimes size={24} />
        </motion.button>
        <motion.button 
          onClick={() => onLike(user._id)}
          className="mx-3 p-4 rounded-full bg-white text-green-500 shadow-md hover:shadow-lg transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Thích"
        >
          <FaHeart size={24} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default UserCard;