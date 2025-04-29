import React from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaVideo, FaInfoCircle, FaCheck, FaTimes, FaHourglass } from 'react-icons/fa';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { vi } from 'date-fns/locale';

const BlindateCard = ({ blindate, currentUser, onSelect, onSchedule, onVideoCall }) => {
  // Xác định trạng thái của người dùng hiện tại trong blindate
  const userResponse = blindate.userResponses.find(
    ur => ur.user === currentUser._id || ur.user._id === currentUser._id
  );
  
  // Xác định trạng thái của đối phương trong blindate
  const partnerResponse = blindate.userResponses.find(
    ur => ur.user !== currentUser._id && ur.user._id !== currentUser._id
  );
  
  // Xác định đối tác
  const partner = blindate.users.find(
    user => user._id !== currentUser._id
  );
  
  // Format thời gian
  const formatTime = (date) => {
    if (!date) return 'Chưa xác định';
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
  };
  
  // Xác định trạng thái hiển thị
  const getStatusDisplay = () => {
    switch (blindate.status) {
      case 'pending':
        return {
          text: 'Đang chờ phản hồi',
          color: 'bg-yellow-100 text-yellow-800',
          icon: <FaHourglass className="mr-1" />
        };
      case 'accepted':
        return {
          text: 'Đã chấp nhận',
          color: 'bg-green-100 text-green-800',
          icon: <FaCheck className="mr-1" />
        };
      case 'rejected':
        return {
          text: 'Đã từ chối',
          color: 'bg-red-100 text-red-800',
          icon: <FaTimes className="mr-1" />
        };
      case 'completed':
        return {
          text: 'Đã hoàn thành',
          color: 'bg-blue-100 text-blue-800',
          icon: <FaCheck className="mr-1" />
        };
      case 'cancelled':
        return {
          text: 'Đã hủy',
          color: 'bg-gray-100 text-gray-800',
          icon: <FaTimes className="mr-1" />
        };
      default:
        return {
          text: 'Không xác định',
          color: 'bg-gray-100 text-gray-800',
          icon: <FaInfoCircle className="mr-1" />
        };
    }
  };
  
  const status = getStatusDisplay();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold">Cuộc hẹn bí ẩn</h3>
          <p className="text-sm text-gray-500">
            Tạo {formatTime(blindate.createdAt)}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs flex items-center ${status.color}`}>
          {status.icon} {status.text}
        </span>
      </div>
      
      {blindate.status === 'accepted' && blindate.dateDetails && blindate.dateDetails.scheduledFor && (
        <div className="mb-3 p-2 bg-purple-50 rounded-md">
          <div className="flex items-center text-sm text-purple-700 mb-1">
            <FaCalendarAlt className="mr-2" />
            <span>
              {new Date(blindate.dateDetails.scheduledFor).toLocaleString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          {blindate.dateDetails.type === 'offline' && blindate.dateDetails.location && blindate.dateDetails.location.name && (
            <div className="flex items-center text-sm text-purple-700">
              <FaMapMarkerAlt className="mr-2" />
              <span>{blindate.dateDetails.location.name}</span>
            </div>
          )}
          
          {blindate.dateDetails.type === 'online' && (
            <div className="flex items-center text-sm text-purple-700">
              <FaVideo className="mr-2" />
              <span>Cuộc hẹn trực tuyến</span>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-between mt-4">
        <button
          onClick={onSelect}
          className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-2 px-4 rounded-md text-sm transition-colors"
        >
          <FaInfoCircle className="inline-block mr-1" /> Chi tiết
        </button>
        
        {/* Chỉ hiển thị nút Chi tiết */}
      </div>
    </motion.div>
  );
};

export default BlindateCard;