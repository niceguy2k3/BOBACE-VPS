import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaTimes, FaClock } from 'react-icons/fa';

const DateScheduler = ({ blindate, onClose, onSave, confirmedLocation }) => {
  const [date, setDate] = useState(
    blindate.dateDetails?.scheduledFor 
      ? new Date(blindate.dateDetails.scheduledFor).toISOString().slice(0, 16) 
      : ''
  );
  const [duration, setDuration] = useState(blindate.dateDetails?.duration || 60);
  
  // Handle save
  const handleSave = () => {
    if (!date) {
      alert('Vui lòng chọn ngày và giờ cho cuộc hẹn');
      return;
    }
    
    // Kiểm tra thời gian có trong tương lai không
    const scheduledDate = new Date(date);
    const now = new Date();
    if (scheduledDate < now) {
      alert('Thời gian hẹn phải trong tương lai');
      return;
    }
    
    // Tạo đối tượng chi tiết cuộc hẹn
    const dateDetails = {
      type: 'offline', // Mặc định là offline
      scheduledFor: scheduledDate.toISOString(),
      duration: parseInt(duration),
      // Luôn đảm bảo có thông tin địa điểm
      location: confirmedLocation || {
        name: "Địa điểm đã thống nhất",
        address: "Địa điểm đã được xác nhận trước đó",
        coordinates: [0, 0]
      }
    };
    
    // Đóng modal trước khi lưu để tránh người dùng nhấn nhiều lần
    onClose();
    
    // Gọi hàm lưu và truyền dữ liệu
    setTimeout(() => {
      onSave(dateDetails);
    }, 100);
  };
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-6 rounded-t-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center">
                <FaCalendarAlt className="mr-3 text-amber-100" size={24} />
                Lên lịch hẹn
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:text-amber-100 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-medium text-amber-800">Thời gian:</label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium text-amber-800">Thời lượng:</label>
                <div className="flex items-center">
                  <FaClock className="text-amber-500 mr-2" />
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="30">30 phút</option>
                    <option value="60">1 giờ</option>
                    <option value="90">1 giờ 30 phút</option>
                    <option value="120">2 giờ</option>
                    <option value="180">3 giờ</option>
                  </select>
                </div>
              </div>
              
              {confirmedLocation && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-start">
                    <div>
                      <p className="font-medium text-green-800">{confirmedLocation.name}</p>
                      <p className="text-green-700 mt-1">{confirmedLocation.address}</p>
                      <p className="text-xs text-green-500 mt-2 italic">Địa điểm này đã được xác nhận bởi cả hai người</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-6 bg-white border border-amber-300 hover:bg-amber-50 text-amber-700 font-medium rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="py-2.5 px-6 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
              >
                Lưu lịch hẹn
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DateScheduler;