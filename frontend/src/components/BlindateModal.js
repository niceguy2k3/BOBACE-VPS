import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaVideo, FaUserSecret, FaTimes, FaCheck, FaStar, FaStarHalfAlt, FaRegStar, FaExternalLinkAlt, FaShieldAlt, FaExclamationTriangle, FaInfoCircle, FaComments } from 'react-icons/fa';
import VerificationBadge from './VerificationBadge';
import SafetyCenter from './SafetyCenter';
import LocationPickerModal from './LocationPickerModal';
import AnonymousChatModal from './AnonymousChatModal';
import ConfirmLocationBox from './ConfirmLocationBox';
import DateScheduler from './DateScheduler';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { toast } from 'react-toastify';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { vi } from 'date-fns/locale';

const BlindateModal = ({ blindate, currentUser, onClose, onRespond, onSchedule, onVideoCall, onCancel, onReview }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showSafetyCenter, setShowSafetyCenter] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showDateScheduler, setShowDateScheduler] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);
  const [chatRoomId, setChatRoomId] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [locations, setLocations] = useState([]);
  
  // Fetch suggested locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get(`${API_URL}/api/locations/suggested`, config);
        setLocations(response.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    if (blindate.status === 'accepted') {
      fetchLocations();
    }
  }, [blindate.status]);
  
  // Fetch location status
  useEffect(() => {
    const fetchLocationStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get(`${API_URL}/api/blindates/${blindate._id}/location-status`, config);
        setLocationStatus(response.data);
        
        // If there's a chat room, store its ID
        if (response.data.locationVoting && response.data.locationVoting.chatRoomId) {
          setChatRoomId(response.data.locationVoting.chatRoomId);
        }
      } catch (error) {
        console.error('Error fetching location status:', error);
      }
    };

    if (blindate.status === 'accepted') {
      fetchLocationStatus();
    }
  }, [blindate._id, blindate.status]);
  
  // Xác định trạng thái của người dùng hiện tại trong blindate
  const userResponse = blindate.userResponses.find(
    ur => {
      const userId = typeof ur.user === 'object' ? ur.user._id : ur.user;
      const currentId = currentUser._id;
      return userId.toString() === currentId.toString();
    }
  );
  
  // Xác định trạng thái của đối phương trong blindate
  const partnerResponse = blindate.userResponses.find(
    ur => {
      const userId = typeof ur.user === 'object' ? ur.user._id : ur.user;
      const currentId = currentUser._id;
      return userId.toString() !== currentId.toString();
    }
  );
  
  // Xác định đối tác
  const partner = blindate.users.find(
    user => user._id.toString() !== currentUser._id.toString()
  );
  
  // Kiểm tra xem người dùng hiện tại đã đánh giá chưa
  const userReview = blindate.reviews && blindate.reviews.find(
    review => {
      const reviewerId = typeof review.user === 'object' ? review.user._id : review.user;
      return reviewerId.toString() === currentUser._id.toString();
    }
  );
  
  // Format thời gian
  const formatTime = (date) => {
    if (!date) return 'Chưa xác định';
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
  };
  
  // Kiểm tra xem cuộc hẹn đã diễn ra chưa
  const isDatePassed = () => {
    if (!blindate.dateDetails || !blindate.dateDetails.scheduledFor) return false;
    return new Date(blindate.dateDetails.scheduledFor) < new Date();
  };
  
  // Render stars for rating
  const renderStars = (value) => {
    const stars = [];
    const fullStars = Math.floor(value);
    const hasHalfStar = value - fullStars >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-amber-500" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-amber-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-amber-300" />);
      }
    }
    
    return stars;
  };
  
  // Handle rating click
  const handleRatingClick = (value) => {
    setRating(value);
  };
  
  // Handle review submit
  const handleReviewSubmit = () => {
    if (rating === 0) return;
    onReview(blindate._id, rating, comment);
    setShowReviewForm(false);
  };
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
        {showSafetyCenter ? (
          <SafetyCenter 
            blindate={blindate} 
            onClose={() => setShowSafetyCenter(false)} 
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center">
                  <FaUserSecret className="mr-3 text-amber-100" size={24} />
                  Chi tiết cuộc hẹn bí ẩn
                </h2>
                <button
                  onClick={onClose}
                  className="text-white hover:text-amber-100 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-amber-100 flex items-center">
                  <FaCalendarAlt className="mr-1" /> Tạo {formatTime(blindate.createdAt)}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  blindate.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  blindate.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  blindate.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  blindate.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {blindate.status === 'pending' ? 'Đang chờ phản hồi' :
                   blindate.status === 'accepted' ? 'Đã chấp nhận' :
                   blindate.status === 'rejected' ? 'Đã từ chối' :
                   blindate.status === 'completed' ? 'Đã hoàn thành' :
                   blindate.status === 'cancelled' ? 'Đã hủy' : 'Không xác định'}
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Thông tin người dùng và trạng thái */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Thông tin đối phương */}
                <div className="bg-amber-50 p-5 rounded-xl shadow-sm border border-amber-200">
                  <div className="flex items-center mb-4">
                    <h3 className="text-lg font-bold text-amber-700">
                      Thông tin đối phương
                    </h3>
                  </div>
                  
                  {partner ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="flex items-center">
                          <span className="font-semibold text-amber-900 mr-2">Giới tính:</span> 
                          <span className="text-amber-800">{partner.gender === 'male' ? 'Nam' : partner.gender === 'female' ? 'Nữ' : 'Khác'}</span>
                        </p>
                        <VerificationBadge isVerified={partner.premium || false} size="sm" />
                      </div>
                      
                      <p className="flex items-center">
                        <span className="font-semibold text-amber-900 mr-2">Tuổi:</span> 
                        <span className="text-amber-800">{partner.birthDate ? new Date().getFullYear() - new Date(partner.birthDate).getFullYear() : 'Không xác định'}</span>
                      </p>
                      
                      {partner.occupation && (
                        <p className="flex items-center">
                          <span className="font-semibold text-amber-900 mr-2">Nghề nghiệp:</span> 
                          <span className="text-amber-800">{partner.occupation}</span>
                        </p>
                      )}
                      
                      {partner.education && (
                        <p className="flex items-center">
                          <span className="font-semibold text-amber-900 mr-2">Học vấn:</span> 
                          <span className="text-amber-800">{partner.education}</span>
                        </p>
                      )}
                      
                      {partner.interests && partner.interests.length > 0 && (
                        <div>
                          <p className="font-semibold text-amber-900 mb-2">Sở thích:</p>
                          <div className="flex flex-wrap gap-2">
                            {partner.interests.slice(0, 3).map((interest, index) => (
                              <span key={index} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {partner.hobbies && partner.hobbies.length > 0 && (
                        <div>
                          <p className="font-semibold text-amber-900 mb-2">Hoạt động yêu thích:</p>
                          <div className="flex flex-wrap gap-2">
                            {partner.hobbies.slice(0, 3).map((hobby, index) => (
                              <span key={index} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                                {hobby}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-amber-500 italic">Không có thông tin</p>
                  )}
                </div>
                
                {/* Trạng thái phản hồi */}
                <div className="bg-amber-50 p-5 rounded-xl shadow-sm border border-amber-200">
                  <h3 className="text-lg font-bold text-amber-700 mb-4">Trạng thái phản hồi</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                      <span className="font-medium text-amber-800">Bạn:</span>
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        userResponse?.response === 'accepted' ? 'bg-green-100 text-green-800' :
                        userResponse?.response === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {userResponse?.response === 'accepted' ? 'Đã chấp nhận' :
                         userResponse?.response === 'rejected' ? 'Đã từ chối' :
                         'Đang chờ'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                      <span className="font-medium text-amber-800">Đối phương:</span>
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        partnerResponse?.response === 'accepted' ? 'bg-green-100 text-green-800' :
                        partnerResponse?.response === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {partnerResponse?.response === 'accepted' ? 'Đã chấp nhận' :
                         partnerResponse?.response === 'rejected' ? 'Đã từ chối' :
                         'Đang chờ'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Thông tin cuộc hẹn */}
              {blindate.status === 'accepted' && (
                <div className="bg-amber-50 p-5 rounded-xl shadow-sm border border-amber-200">
                  <h3 className="text-lg font-bold text-amber-700 mb-4">Thông tin cuộc hẹn</h3>
                  
                  {/* Hiển thị phần chọn địa điểm nếu chưa có lịch hẹn */}
                  {!blindate.dateDetails?.scheduledFor ? (
                    <>
                      {locationStatus && locationStatus.status === 'confirmed' && locationStatus.locationVoting?.finalLocation ? (
                        <ConfirmLocationBox 
                          location={locationStatus.locationVoting.finalLocation}
                          onScheduleDate={() => setShowDateScheduler(true)}
                          showScheduleButton={true}
                        />
                      ) : (
                        <div className="space-y-4">
                          <div className={`p-4 rounded-lg ${
                            locationStatus?.status === 'negotiating' ? 'bg-amber-100 border border-amber-300' : 'bg-blue-50 border border-blue-200'
                          }`}>
                            <div className="flex items-center mb-2">
                              {locationStatus?.status === 'negotiating' ? (
                                <FaComments className="text-amber-600 mr-2" />
                              ) : (
                                <FaMapMarkerAlt className="text-blue-500 mr-2" />
                              )}
                              <span className={`font-medium ${
                                locationStatus?.status === 'negotiating' ? 'text-amber-700' : 'text-blue-700'
                              }`}>
                                {locationStatus?.status === 'negotiating' 
                                  ? 'Cần thương lượng về địa điểm' 
                                  : locationStatus?.userVoted && locationStatus?.otherUserVoted
                                  ? 'Cả hai đã chọn địa điểm'
                                  : locationStatus?.userVoted
                                  ? 'Bạn đã chọn địa điểm, đang chờ đối phương'
                                  : locationStatus?.otherUserVoted
                                  ? 'Đối phương đã chọn địa điểm, đang chờ bạn'
                                  : 'Chưa có ai chọn địa điểm'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between mt-3">
                              {locationStatus?.status === 'negotiating' ? (
                                <button
                                  onClick={() => setShowChatModal(true)}
                                  className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center justify-center"
                                >
                                  <FaComments className="mr-2" />
                                  Mở chat thương lượng
                                </button>
                              ) : (
                                <button
                                  onClick={() => setShowLocationPicker(true)}
                                  className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center justify-center"
                                >
                                  <FaMapMarkerAlt className="mr-2" />
                                  {locationStatus?.userVoted ? 'Xem lựa chọn của bạn' : 'Chọn địa điểm'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-white p-4 rounded-lg text-center text-amber-500 italic">
                      Chưa có thông tin cuộc hẹn
                    </div>
                  )}
                  
                  {/* Hiển thị thông tin lịch hẹn nếu đã có */}
                  {blindate.dateDetails && blindate.dateDetails.scheduledFor ? (
                    <div className="space-y-4">
                      <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                        <FaCalendarAlt className="mr-3 text-amber-600 text-lg" />
                        <span className="text-amber-800 font-medium">
                          {new Date(blindate.dateDetails.scheduledFor).toLocaleString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      {/* Hiển thị địa điểm từ lịch hẹn hoặc từ locationStatus nếu có */}
                      {blindate.dateDetails.type === 'offline' && (
                        <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                          <FaMapMarkerAlt className="mr-3 text-amber-600 text-lg" />
                          <div>
                            {blindate.dateDetails.location ? (
                              <>
                                <p className="font-medium text-amber-800">{blindate.dateDetails.location.name}</p>
                                {blindate.dateDetails.location.address && (
                                  <p className="text-amber-600 text-sm mt-1">{blindate.dateDetails.location.address}</p>
                                )}
                              </>
                            ) : locationStatus && locationStatus.status === 'confirmed' && locationStatus.locationVoting?.finalLocation ? (
                              <>
                                <p className="font-medium text-amber-800">{locationStatus.locationVoting.finalLocation.name}</p>
                                <p className="text-amber-600 text-sm mt-1">{locationStatus.locationVoting.finalLocation.address}</p>
                              </>
                            ) : (
                              <p className="font-medium text-amber-800">Chưa có thông tin địa điểm</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {blindate.dateDetails.type === 'online' && (
                        <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                          <FaVideo className="mr-3 text-amber-600 text-lg" />
                          <span className="text-amber-800 font-medium">Cuộc hẹn trực tuyến</span>
                          
                          {blindate.dateDetails.videoCallLink && (
                            <a
                              href={blindate.dateDetails.videoCallLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg flex items-center transition-colors"
                            >
                              <span>Tham gia</span>
                              <FaExternalLinkAlt className="ml-2 text-xs" />
                            </a>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <span className="text-amber-700">
                          Thời lượng: <span className="font-medium">{blindate.dateDetails.duration || 60} phút</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-lg text-center text-amber-500 italic">
                      Chưa có thông tin cuộc hẹn
                    </div>
                  )}
                </div>
              )}
              
              {/* Tính năng an toàn */}
              <div className="bg-red-50 p-5 rounded-xl shadow-sm border border-red-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-red-700 flex items-center">
                    <FaShieldAlt className="mr-2" /> Tính năng an toàn
                  </h3>
                  <button
                    onClick={() => setShowSafetyCenter(true)}
                    className="text-white hover:bg-red-700 flex items-center text-sm bg-red-600 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all"
                  >
                    Mở trung tâm an toàn
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowSafetyCenter(true)}
                    className="flex items-center p-3 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <FaExclamationTriangle className="text-red-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-red-700">Báo cáo khẩn cấp</p>
                      <p className="text-xs text-red-600">Gửi thông báo khẩn cấp tới đội ngũ hỗ trợ</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setShowSafetyCenter(true)}
                    className="flex items-center p-3 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <FaMapMarkerAlt className="text-red-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-red-700">Chia sẻ vị trí</p>
                      <p className="text-xs text-red-600">Chia sẻ vị trí hiện tại với người thân</p>
                    </div>
                  </button>
                </div>
                
                <div className="mt-4 text-xs text-red-600 bg-white p-3 rounded-lg">
                  <p className="flex items-start">
                    <FaInfoCircle className="mr-2 mt-0.5 flex-shrink-0" />
                    <span>Sử dụng các tính năng an toàn khi bạn cảm thấy không an toàn hoặc cần hỗ trợ trong cuộc hẹn. Chúng tôi luôn ưu tiên sự an toàn của bạn.</span>
                  </p>
                </div>
              </div>
              
              {/* Đánh giá */}
              {blindate.reviews && blindate.reviews.length > 0 && (
                <div className="bg-amber-50 p-5 rounded-xl shadow-sm border border-amber-200">
                  <h3 className="text-lg font-bold text-amber-700 mb-4">Đánh giá</h3>
                  
                  <div className="space-y-4">
                    {blindate.reviews.map((review, index) => {
                      const isCurrentUser = typeof review.user === 'object' 
                        ? review.user._id.toString() === currentUser._id.toString()
                        : review.user.toString() === currentUser._id.toString();
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-4 rounded-lg shadow-sm ${isCurrentUser ? 'bg-amber-100 border border-amber-200' : 'bg-white border border-amber-100'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-amber-900">
                              {isCurrentUser ? 'Đánh giá của bạn' : 'Đánh giá của đối phương'}
                            </span>
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          
                          {review.comment && (
                            <p className="text-amber-800 bg-white bg-opacity-50 p-3 rounded-lg">
                              "{review.comment}"
                            </p>
                          )}
                          
                          <p className="text-xs text-amber-600 mt-2 text-right">
                            {formatTime(review.createdAt)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="border-t border-amber-200 p-6 bg-amber-50 rounded-b-xl">
              {blindate.status === 'pending' && userResponse?.response === 'pending' && (
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => onRespond(blindate._id, 'rejected')}
                    className="bg-white border border-red-300 hover:bg-red-50 text-red-600 font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center"
                  >
                    <FaTimes className="mr-2" /> Từ chối
                  </button>
                  <button
                    onClick={() => onRespond(blindate._id, 'accepted')}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center"
                  >
                    <FaCheck className="mr-2" /> Chấp nhận
                  </button>
                </div>
              )}
              
              {blindate.status === 'accepted' && (
                <div className="flex flex-wrap justify-center gap-4">
                  {/* Đã loại bỏ nút lên lịch hẹn và nút video call */}
                  
                  {isDatePassed() && !userReview && !showReviewForm && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center"
                    >
                      <FaStar className="mr-2" /> Đánh giá
                    </button>
                  )}
                  
                  {blindate.status !== 'cancelled' && (
                    <button
                      onClick={() => {
                        // Hiện thông báo xác nhận trước khi hủy
                        if (window.confirm('Bạn có chắc chắn muốn hủy cuộc hẹn này?')) {
                          onCancel(blindate._id);
                        }
                      }}
                      className="bg-white border border-red-300 hover:bg-red-50 text-red-600 font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center"
                    >
                      <FaTimes className="mr-2" /> Hủy cuộc hẹn
                    </button>
                  )}
                </div>
              )}
              
              {/* Form đánh giá */}
              {showReviewForm && (
                <div className="mt-6 bg-white p-5 rounded-xl shadow-sm border border-amber-200">
                  <h3 className="text-lg font-bold text-amber-700 mb-4">Đánh giá cuộc hẹn</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 font-medium text-amber-800">Xếp hạng:</label>
                      <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleRatingClick(value)}
                            className="text-3xl focus:outline-none transition-transform hover:scale-110"
                          >
                            {value <= rating ? (
                              <FaStar className="text-amber-500" />
                            ) : (
                              <FaRegStar className="text-amber-300" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block mb-2 font-medium text-amber-800">Nhận xét (không bắt buộc):</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        rows="4"
                        placeholder="Chia sẻ cảm nhận của bạn về cuộc hẹn..."
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="bg-white border border-amber-300 hover:bg-amber-50 text-amber-700 font-medium py-2.5 px-5 rounded-lg transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleReviewSubmit}
                        disabled={rating === 0}
                        className={`font-medium py-2.5 px-5 rounded-lg transition-colors ${
                          rating === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                      >
                        Gửi đánh giá
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Location Picker Modal */}
        {showLocationPicker && (
          <LocationPickerModal
            blindate={blindate}
            currentUser={currentUser}
            onClose={() => setShowLocationPicker(false)}
            onLocationVoted={(data) => {
              setLocationStatus(data);
              setShowLocationPicker(false);
              if (data.status === 'negotiating') {
                setChatRoomId(data.locationVoting.chatRoomId);
                setTimeout(() => {
                  setShowChatModal(true);
                }, 500);
              }
            }}
            onOpenChat={() => {
              setShowLocationPicker(false);
              setShowChatModal(true);
            }}
          />
        )}
        
        {/* Anonymous Chat Modal */}
        {showChatModal && chatRoomId && (
          <AnonymousChatModal
            blindateId={blindate._id}
            chatRoomId={chatRoomId}
            onClose={() => setShowChatModal(false)}
            onLocationConfirmed={(location) => {
              // Update location status
              if (locationStatus) {
                setLocationStatus({
                  ...locationStatus,
                  status: 'confirmed',
                  locationVoting: {
                    ...locationStatus.locationVoting,
                    finalLocation: location
                  }
                });
              }
              setShowChatModal(false);
              toast.success('Địa điểm đã được chốt thành công!');
            }}
          />
        )}
        
        {/* Date Scheduler Modal */}
        {showDateScheduler && (
          <DateScheduler
            blindate={blindate}
            locations={locations}
            confirmedLocation={locationStatus?.status === 'confirmed' ? locationStatus.locationVoting?.finalLocation : null}
            onClose={() => setShowDateScheduler(false)}
            onSave={(dateDetails) => {
              onSchedule(blindate._id, dateDetails);
              setShowDateScheduler(false);
            }}
          />
        )}
      </div>
    </AnimatePresence>
  );
};

export default BlindateModal;