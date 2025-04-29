import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { FaMapMarkerAlt } from 'react-icons/fa';

const LocationPermission = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser, updateUserLocation, locationPermission } = useAuth();

  useEffect(() => {
    // Chỉ hiển thị khi người dùng đã đăng nhập
    if (currentUser && 'geolocation' in navigator) {
      // Kiểm tra xem người dùng đã từng chọn "Để sau" vĩnh viễn hoặc tạm thời chưa
      const permanentlyDismissed = localStorage.getItem('locationPermanentlyDismissed') === 'true';
      const temporarilyDismissed = localStorage.getItem('locationPromptDismissed') === 'true';
      
      // Kiểm tra xem người dùng đã có vị trí trong cơ sở dữ liệu chưa
      const hasLocation = currentUser?.location?.coordinates?.length > 0;
      
      // Chỉ hiển thị prompt nếu chưa có vị trí và chưa từng chọn "Để sau" hoặc "Không hỏi lại"
      if (!hasLocation && !permanentlyDismissed && !temporarilyDismissed) {
        // Đợi 3 giây trước khi hiển thị prompt
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser]);

  const requestPermission = async () => {
    setLoading(true);
    try {
      // Hiển thị hướng dẫn cho người dùng
      toast.info('Vui lòng chấp nhận yêu cầu truy cập vị trí từ trình duyệt để tiếp tục');
      
      const result = await updateUserLocation();
      if (result.success) {
        toast.success('Đã cập nhật vị trí thành công');
        localStorage.setItem('locationJustGranted', 'true');
        
        // Xóa các cờ từ chối tạm thời hoặc vĩnh viễn
        localStorage.removeItem('locationPermanentlyDismissed');
        localStorage.removeItem('locationPromptDismissed');
        
        // Reload trang sau khi cập nhật vị trí thành công
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // Hiển thị thông báo lỗi cụ thể
        toast.error(result.message);
        
        // Nếu người dùng từ chối quyền, hiển thị hướng dẫn
        if (result.message.includes('từ chối quyền')) {
          toast.info('Bạn có thể cấp quyền vị trí trong cài đặt trình duyệt hoặc tiếp tục sử dụng ứng dụng mà không cần vị trí');
        }
      }
    } catch (error) {
      console.error('Error requesting location:', error);
      toast.error('Không thể cập nhật vị trí. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setShowPrompt(false);
    }
  };

  const dismissPrompt = (permanently = false) => {
    setShowPrompt(false);
    
    if (permanently) {
      // Lưu vào localStorage để không bao giờ hiển thị lại
      localStorage.setItem('locationPermanentlyDismissed', 'true');
      
      // Hiển thị thông báo cho người dùng
      toast.info('Bạn sẽ thấy tất cả người dùng mà không dựa trên vị trí');
      
      // Reload trang để hiển thị danh sách người dùng
      window.location.reload();
    } else {
      // Lưu vào localStorage để không hiển thị lại trong phiên này
      localStorage.setItem('locationPromptDismissed', 'true');
      
      // Hiển thị thông báo cho người dùng
      toast.info('Bạn sẽ thấy tất cả người dùng mà không dựa trên vị trí');
      
      // Reload trang để hiển thị danh sách người dùng
      window.location.reload();
    }
  };

  // Kiểm tra xem người dùng đã có vị trí trong cơ sở dữ liệu chưa
  const hasLocation = currentUser?.location?.coordinates?.length > 0;
  
  // Kiểm tra xem người dùng đã từng chọn "Để sau" vĩnh viễn hoặc tạm thời chưa
  const permanentlyDismissed = localStorage.getItem('locationPermanentlyDismissed') === 'true';
  const temporarilyDismissed = localStorage.getItem('locationPromptDismissed') === 'true';
  
  if (!showPrompt || hasLocation || permanentlyDismissed || temporarilyDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50 border border-yellow-200">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <FaMapMarkerAlt className="h-6 w-6 text-yellow-500" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">
            Chia sẻ vị trí
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Cho phép chia sẻ vị trí để tìm những người dùng gần bạn.
          </p>
          <div className="mt-4 flex flex-col space-y-3">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={requestPermission}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                {loading ? 'Đang xử lý...' : 'Cho phép'}
              </button>
              <button
                type="button"
                onClick={() => dismissPrompt(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Để sau
              </button>
            </div>
            <button
              type="button"
              onClick={() => dismissPrompt(true)}
              className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              Không hỏi lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPermission;