import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEyeSlash, FaEye, FaTimes } from 'react-icons/fa';

const IncognitoModeModal = ({ isOpen, onClose, isIncognitoEnabled }) => {
  // Ref để lưu trữ timer
  const timerRef = useRef(null);
  
  // Tự động đóng modal sau 5 giây
  useEffect(() => {
    if (isOpen) {
      // Xóa timer cũ nếu có
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Tạo timer mới để đóng modal sau 5 giây
      timerRef.current = setTimeout(() => {
        onClose();
      }, 2000);
    }
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isOpen, onClose]);

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Xử lý click bên ngoài modal để đóng
  const handleBackdropClick = (e) => {
    // Đảm bảo chỉ đóng khi click vào backdrop, không phải modal
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose} // Đóng modal khi click vào backdrop
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md relative z-10 overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Ngăn sự kiện lan truyền
          >
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Ngăn chặn sự kiện lan truyền
                onClose(); // Gọi hàm đóng modal
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-20 p-2"
              aria-label="Đóng"
            >
              <FaTimes size={20} />
            </button>

            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  isIncognitoEnabled 
                    ? 'bg-yellow-100 text-yellow-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {isIncognitoEnabled ? <FaEyeSlash size={28} /> : <FaEye size={28} />}
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {isIncognitoEnabled 
                    ? 'Chế độ ẩn danh đã được bật' 
                    : 'Chế độ ẩn danh đã được tắt'}
                </h3>
              </div>

              <div className="text-gray-600 mb-6">
                {isIncognitoEnabled ? (
                  <p>
                    Hồ sơ của bạn hiện đang ẩn và sẽ không xuất hiện trong kết quả tìm kiếm của người dùng khác. 
                    Bạn vẫn có thể xem và tương tác với các hồ sơ khác như bình thường.
                  </p>
                ) : (
                  <p>
                    Hồ sơ của bạn hiện đang hiển thị và có thể được tìm thấy bởi người dùng khác. 
                    Bạn có thể bật lại chế độ ẩn danh bất cứ lúc nào.
                  </p>
                )}
                <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200 text-sm">
                  <p className="font-medium text-yellow-700">
                    <span className="inline-block px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full mr-2 text-xs">Premium</span>
                    Chế độ ẩn danh chỉ khả dụng cho người dùng premium.
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn chặn sự kiện lan truyền
                    onClose(); // Gọi hàm đóng modal
                  }}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors shadow-md"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default IncognitoModeModal;