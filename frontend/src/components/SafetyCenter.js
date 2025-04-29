import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShieldAlt, FaExclamationTriangle, FaPhoneAlt, FaMapMarkerAlt, FaCamera, FaTimes, FaCheck, FaInfoCircle, FaShare } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import LocationErrorGuide from './LocationErrorGuide';

const SafetyCenter = ({ blindate, onClose }) => {
  const { currentUser } = useAuth();
  const [emergencyType, setEmergencyType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [showLocationGuide, setShowLocationGuide] = useState(false);
  const [locationErrorType, setLocationErrorType] = useState('');
  
  // Xử lý báo cáo khẩn cấp
  const handleEmergencyReport = async () => {
    if (!emergencyType) {
      toast.error('Vui lòng chọn loại tình huống khẩn cấp');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Lấy vị trí hiện tại nếu người dùng cho phép
      let currentLocation = location;
      if (!currentLocation) {
        try {
          if (navigator.geolocation) {
            const position = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
              });
            });
            
            currentLocation = `${position.coords.latitude},${position.coords.longitude}`;
          }
        } catch (error) {
          console.error('Error getting location:', error);
        }
      }
      
      // Gửi báo cáo khẩn cấp
      await axios.post(
        `${API_URL}/api/safety/emergency-report`,
        {
          userId: currentUser._id,
          blindateId: blindate._id,
          emergencyType,
          location: currentLocation,
          description
        },
        config
      );
      
      setShowConfirmation(true);
      
      // Giả lập gửi thông báo đến đội ngũ hỗ trợ
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      console.error('Error submitting emergency report:', error);
      toast.error('Không thể gửi báo cáo. Vui lòng gọi trực tiếp đến số khẩn cấp.');
      setIsSubmitting(false);
    }
  };
  
  // Chia sẻ vị trí với bạn bè
  const handleShareLocation = async () => {
    try {
      // Kiểm tra xem đã có vị trí chưa
      if (!location) {
        // Nếu chưa có vị trí, thử lấy vị trí hiện tại
        try {
          if (!navigator.geolocation) {
            toast.error('Trình duyệt không hỗ trợ định vị. Vui lòng nhập vị trí thủ công.');
            return;
          }
          
          toast.info('Đang lấy vị trí của bạn...');
          
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
              }
            );
          });
          
          // Cập nhật vị trí
          const newLocation = `${position.coords.latitude},${position.coords.longitude}`;
          setLocation(newLocation);
          
          // Tiếp tục với vị trí mới
          await shareLocationWithAPI(newLocation);
        } catch (error) {
          console.error('Error getting location for sharing:', error);
          
          if (error.code === 1) { // PERMISSION_DENIED
            toast.error('Bạn đã từ chối quyền truy cập vị trí. Vui lòng nhập vị trí thủ công hoặc kiểm tra cài đặt quyền trong trình duyệt.');
          } else {
            toast.error('Không thể lấy vị trí. Vui lòng nhập vị trí thủ công.');
          }
          return;
        }
      } else {
        // Nếu đã có vị trí, tiếp tục chia sẻ
        await shareLocationWithAPI(location);
      }
    } catch (error) {
      console.error('Error in handleShareLocation:', error);
      toast.error('Không thể chia sẻ vị trí. Vui lòng thử lại sau.');
    }
  };
  
  // Hàm chia sẻ vị trí qua API
  const shareLocationWithAPI = async (locationString) => {
    try {
      if (navigator.share) {
        const shareData = {
          title: 'Vị trí của tôi',
          text: 'Đây là vị trí hiện tại của tôi trong cuộc hẹn Blindate',
          url: `https://maps.google.com/?q=${locationString}`
        };
        
        await navigator.share(shareData);
        toast.success('Đã chia sẻ vị trí thành công!');
      } else {
        // Fallback cho trình duyệt không hỗ trợ Web Share API
        try {
          await navigator.clipboard.writeText(`https://maps.google.com/?q=${locationString}`);
          toast.success('Đã sao chép link vị trí vào clipboard!');
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          // Hiển thị link để người dùng có thể sao chép thủ công
          toast.info(`Link vị trí của bạn: https://maps.google.com/?q=${locationString}`);
        }
      }
    } catch (error) {
      console.error('Error in shareLocationWithAPI:', error);
      if (error.name === 'AbortError') {
        // Người dùng đã hủy chia sẻ
        toast.info('Bạn đã hủy chia sẻ vị trí.');
      } else if (error.code === 1) { // PERMISSION_DENIED
        toast.error('Bạn đã từ chối quyền truy cập vị trí.');
        setLocationErrorType('denied');
        setShowLocationGuide(true);
      } else {
        toast.error('Không thể chia sẻ vị trí. Vui lòng thử lại sau.');
        setLocationErrorType('error');
        setShowLocationGuide(true);
      }
    }
  };
  
  return (
    <AnimatePresence>
      {showLocationGuide ? (
        <LocationErrorGuide 
          onClose={() => setShowLocationGuide(false)} 
          errorType={locationErrorType} 
        />
      ) : (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-red-600 flex items-center">
                <FaShieldAlt className="mr-2" />
                Trung tâm an toàn
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            {showConfirmation ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <FaCheck className="text-green-500 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Báo cáo đã được gửi</h3>
                <p className="text-gray-600 mb-6">
                  Đội ngũ hỗ trợ của chúng tôi đã nhận được báo cáo và sẽ liên hệ với bạn trong thời gian sớm nhất.
                </p>
                <div className="bg-yellow-50 p-4 rounded-lg text-left mb-6">
                  <h4 className="font-semibold text-yellow-700 mb-2 flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    Trong trường hợp khẩn cấp
                  </h4>
                  <p className="text-yellow-700 mb-2">
                    Nếu bạn đang trong tình huống nguy hiểm, hãy gọi ngay đến số khẩn cấp:
                  </p>
                  <div className="flex justify-center gap-4 mt-4">
                    <a
                      href="tel:113"
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg flex items-center"
                    >
                      <FaPhoneAlt className="mr-2" /> Gọi 113 (Công an)
                    </a>
                    <a
                      href="tel:115"
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg flex items-center"
                    >
                      <FaPhoneAlt className="mr-2" /> Gọi 115 (Cấp cứu)
                    </a>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Báo cáo khẩn cấp</h3>
                    <button
                      onClick={() => setShowTips(!showTips)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showTips ? 'Ẩn mẹo an toàn' : 'Hiện mẹo an toàn'}
                    </button>
                  </div>
                  
                  {showTips && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-blue-700 mb-2">Mẹo an toàn khi hẹn hò:</h4>
                      <ul className="list-disc list-inside text-blue-700 space-y-1">
                        <li>Luôn gặp gỡ ở nơi công cộng đông người</li>
                        <li>Thông báo cho bạn bè/người thân về lịch hẹn và địa điểm</li>
                        <li>Chia sẻ vị trí thời gian thực với người tin cậy</li>
                        <li>Không chia sẻ thông tin cá nhân nhạy cảm</li>
                        <li>Tin tưởng trực giác của bạn - nếu cảm thấy không an toàn, hãy rời đi</li>
                        <li>Luôn mang theo điện thoại đã sạc đầy pin</li>
                        <li>Tự túc phương tiện đi lại</li>
                        <li>Không để đồ uống ngoài tầm mắt</li>
                      </ul>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 font-medium">Loại tình huống:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setEmergencyType('unsafe')}
                          className={`p-3 rounded-lg text-left ${
                            emergencyType === 'unsafe'
                              ? 'bg-red-100 text-red-700 border-2 border-red-500'
                              : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                          }`}
                        >
                          <div className="font-medium flex items-center">
                            <FaExclamationTriangle className="mr-2" />
                            Cảm thấy không an toàn
                          </div>
                          <div className="text-sm">Tôi cảm thấy không thoải mái hoặc lo ngại</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmergencyType('emergency')}
                          className={`p-3 rounded-lg text-left ${
                            emergencyType === 'emergency'
                              ? 'bg-red-100 text-red-700 border-2 border-red-500'
                              : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                          }`}
                        >
                          <div className="font-medium flex items-center">
                            <FaPhoneAlt className="mr-2" />
                            Tình huống khẩn cấp
                          </div>
                          <div className="text-sm">Tôi đang trong tình huống nguy hiểm</div>
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block mb-2 font-medium">Vị trí hiện tại (không bắt buộc):</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Nhập địa chỉ hoặc mô tả vị trí của bạn"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block mb-2 font-medium">Mô tả tình huống (không bắt buộc):</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Mô tả ngắn gọn về tình huống bạn đang gặp phải"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        rows="3"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-6 justify-center">
                      <button
                        type="button"
                        onClick={handleEmergencyReport}
                        disabled={isSubmitting || !emergencyType}
                        className={`py-3 px-6 rounded-lg flex items-center ${
                          isSubmitting || !emergencyType
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        <FaExclamationTriangle className="mr-2" />
                        {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo khẩn cấp'}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-700 mb-2 flex items-center">
                      <FaInfoCircle className="mr-2" />
                      Trong trường hợp khẩn cấp
                    </h4>
                    <p className="text-yellow-700 mb-2">
                      Nếu bạn đang trong tình huống nguy hiểm, hãy gọi ngay đến số khẩn cấp:
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      <a
                        href="tel:113"
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg flex items-center"
                      >
                        <FaPhoneAlt className="mr-2" /> Gọi 113 (Công an)
                      </a>
                      <a
                        href="tel:115"
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg flex items-center"
                      >
                        <FaPhoneAlt className="mr-2" /> Gọi 115 (Cấp cứu)
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

export default SafetyCenter;