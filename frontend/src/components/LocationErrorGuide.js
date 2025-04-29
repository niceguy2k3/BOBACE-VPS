import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaTimes, FaExclamationTriangle, FaChrome, FaFirefox, FaSafari, FaEdge } from 'react-icons/fa';

const LocationErrorGuide = ({ onClose, errorType }) => {
  // Xác định nội dung hướng dẫn dựa trên loại lỗi
  const getGuideContent = () => {
    switch (errorType) {
      case 'denied':
        return {
          title: 'Quyền truy cập vị trí bị từ chối',
          description: 'Bạn đã từ chối quyền truy cập vị trí. Để sử dụng tính năng này, bạn cần cấp quyền truy cập vị trí cho trang web.',
          steps: [
            'Mở cài đặt trình duyệt của bạn',
            'Tìm phần Quyền hoặc Quyền riêng tư',
            'Tìm mục Vị trí và cho phép trang web này truy cập vị trí',
            'Làm mới trang và thử lại'
          ]
        };
      case 'unavailable':
        return {
          title: 'Không thể xác định vị trí',
          description: 'Hệ thống không thể xác định vị trí của bạn. Điều này có thể do GPS bị tắt hoặc kết nối mạng không ổn định.',
          steps: [
            'Kiểm tra xem GPS của thiết bị đã được bật chưa',
            'Đảm bảo bạn đang kết nối với mạng internet ổn định',
            'Thử sử dụng mạng Wi-Fi thay vì dữ liệu di động',
            'Làm mới trang và thử lại'
          ]
        };
      case 'timeout':
        return {
          title: 'Quá thời gian xác định vị trí',
          description: 'Việc xác định vị trí của bạn mất quá nhiều thời gian. Điều này có thể do kết nối mạng chậm hoặc GPS không hoạt động tốt.',
          steps: [
            'Kiểm tra kết nối mạng của bạn',
            'Đảm bảo bạn đang ở nơi có tín hiệu GPS tốt (không ở trong tòa nhà quá kín)',
            'Thử tắt và bật lại GPS',
            'Làm mới trang và thử lại'
          ]
        };
      default:
        return {
          title: 'Lỗi xác định vị trí',
          description: 'Đã xảy ra lỗi khi cố gắng xác định vị trí của bạn.',
          steps: [
            'Kiểm tra xem trình duyệt của bạn đã được cập nhật lên phiên bản mới nhất chưa',
            'Đảm bảo bạn đã cấp quyền truy cập vị trí cho trang web',
            'Thử sử dụng trình duyệt khác',
            'Làm mới trang và thử lại'
          ]
        };
    }
  };

  const guideContent = getGuideContent();

  // Hướng dẫn cụ thể cho từng trình duyệt
  const browserGuides = [
    {
      name: 'Chrome',
      icon: <FaChrome className="text-blue-500" />,
      steps: [
        'Nhấp vào biểu tượng khóa/thông tin bên cạnh URL',
        'Chọn "Quyền truy cập trang web"',
        'Tìm "Vị trí" và thay đổi thành "Cho phép"'
      ]
    },
    {
      name: 'Firefox',
      icon: <FaFirefox className="text-orange-500" />,
      steps: [
        'Nhấp vào biểu tượng khóa bên cạnh URL',
        'Chọn "Xóa cài đặt"',
        'Làm mới trang và cấp quyền khi được hỏi'
      ]
    },
    {
      name: 'Safari',
      icon: <FaSafari className="text-blue-400" />,
      steps: [
        'Mở Tùy chọn Safari',
        'Chọn tab "Websites"',
        'Tìm "Vị trí" và cho phép trang web này'
      ]
    },
    {
      name: 'Edge',
      icon: <FaEdge className="text-blue-600" />,
      steps: [
        'Nhấp vào biểu tượng khóa bên cạnh URL',
        'Chọn "Quyền truy cập trang web"',
        'Tìm "Vị trí" và thay đổi thành "Cho phép"'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center">
              <FaExclamationTriangle className="mr-3 text-yellow-300" size={24} />
              {guideContent.title}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-red-100 transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-red-700 flex items-start">
              <FaMapMarkerAlt className="mr-2 mt-1 flex-shrink-0" />
              <span>{guideContent.description}</span>
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Các bước khắc phục:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              {guideContent.steps.map((step, index) => (
                <li key={index} className="text-gray-700">{step}</li>
              ))}
            </ol>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Hướng dẫn theo trình duyệt:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {browserGuides.map((browser, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    {browser.icon}
                    <span className="ml-2 font-medium">{browser.name}</span>
                  </div>
                  <ol className="list-decimal pl-5 text-sm space-y-1">
                    {browser.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-gray-600">{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
            <p className="text-blue-700 text-sm">
              <strong>Lưu ý:</strong> Nếu bạn không muốn chia sẻ vị trí, bạn vẫn có thể sử dụng ứng dụng nhưng một số tính năng có thể bị hạn chế.
            </p>
          </div>
          
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={onClose}
              className="py-2.5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                onClose();
                window.location.reload();
              }}
              className="py-2.5 px-6 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Làm mới trang
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LocationErrorGuide;