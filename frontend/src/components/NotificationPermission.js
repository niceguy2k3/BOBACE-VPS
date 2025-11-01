import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import webPushService from '../services/webPushService';
import NotificationGuide from './NotificationGuide';

// Alias functions from webPushService for compatibility
const isPushNotificationSupported = webPushService.isNotificationSupported;
const askUserPermission = Notification.requestPermission.bind(Notification);
const initializePushNotifications = webPushService.updateSubscriptionUser;

const NotificationPermission = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const { currentUser } = useAuth();

  // Sử dụng useMemo để tối ưu hóa việc kiểm tra điều kiện hiển thị
  const shouldShowPrompt = React.useMemo(() => {
    // Nếu không có người dùng hoặc trình duyệt không hỗ trợ thông báo, không hiển thị
    if (!currentUser || !isPushNotificationSupported()) {
      return false;
    }
    
    // Kiểm tra các điều kiện để không hiển thị prompt
    const permanentlyDismissed = localStorage.getItem('notificationPermanentlyDismissed') === 'true';
    const permissionGranted = Notification.permission === 'granted';
    
    // Nếu đã được cấp quyền hoặc đã từ chối vĩnh viễn, không hiển thị
    if (permissionGranted || permanentlyDismissed) {
      return false;
    }
    
    // Kiểm tra xem thông báo đã bị bỏ qua tạm thời và thời gian hết hạn
    const dismissedDataStr = localStorage.getItem('notificationPromptDismissedData');
    if (dismissedDataStr) {
      try {
        const dismissedData = JSON.parse(dismissedDataStr);
        const now = new Date().getTime();
        
        // Nếu thời gian hiện tại < thời gian hết hạn, thì vẫn còn hiệu lực
        if (dismissedData.expiry > now) {
          return false;
        } else {
          // Nếu đã hết hạn, xóa dữ liệu
          localStorage.removeItem('notificationPromptDismissed');
          localStorage.removeItem('notificationPromptDismissedData');
        }
      } catch (error) {
        // Xóa dữ liệu không hợp lệ
        localStorage.removeItem('notificationPromptDismissedData');
      }
    } else if (localStorage.getItem('notificationPromptDismissed') === 'true') {
      // Trường hợp cũ: chỉ có flag mà không có dữ liệu hết hạn
      return false;
    }
    
    // Nếu qua tất cả các điều kiện trên, hiển thị prompt
    return true;
  }, [currentUser]);
  
  useEffect(() => {
    // Chỉ hiển thị khi điều kiện đã được kiểm tra và cho phép
    if (shouldShowPrompt) {
      // Đợi 2 giây trước khi hiển thị prompt để tránh ảnh hưởng đến thời gian tải trang
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [shouldShowPrompt]);

  // Kiểm tra và hiển thị thông báo test khi được cấp quyền
  useEffect(() => {
    if (currentUser && isPushNotificationSupported() && Notification.permission === 'granted') {
      // Hiển thị thông báo test sau khi được cấp quyền
      const testNotification = () => {
        const notification = new Notification('Thông báo đã được kích hoạt', {
          body: 'Bạn sẽ nhận được thông báo khi có tin nhắn mới',
          icon: '/logo192.png'
        });
        
        notification.onclick = function() {
          window.focus();
        };
      };
      
      // Chỉ hiển thị thông báo test nếu người dùng vừa cấp quyền
      if (localStorage.getItem('notificationJustGranted') === 'true') {
        testNotification();
        localStorage.removeItem('notificationJustGranted');
      }
    }
  }, [currentUser]);

  const handleRequestPermission = async () => {
    // Đánh dấu đang xử lý
    setShowPrompt(false);
    
    // Hiển thị toast đang xử lý
    const processingToast = toast.info('Đang đăng ký thông báo...', {
      autoClose: false,
      hideProgressBar: false
    });
    
    try {
      // Kiểm tra trạng thái quyền hiện tại
      console.log('Trạng thái quyền thông báo hiện tại:', Notification.permission);
      
      // Hiển thị hướng dẫn cho người dùng
      if (Notification.permission === 'default') {
        toast.info('Vui lòng chọn "Cho phép" trong hộp thoại sắp hiện ra để nhận thông báo', {
          autoClose: 5000,
          position: 'top-center'
        });
      } else if (Notification.permission === 'denied') {
        toast.warning('Bạn đã từ chối quyền thông báo trước đó. Vui lòng vào cài đặt trình duyệt để cấp quyền', {
          autoClose: 5000,
          position: 'top-center'
        });
      }
      
      // Yêu cầu quyền thông báo
      const permissionResult = await askUserPermission();
      console.log('Kết quả yêu cầu quyền:', permissionResult);
      
      // Đóng toast đang xử lý
      toast.dismiss(processingToast);
      
      if (permissionResult === 'granted') {
        // Yêu cầu quyền thành công, đăng ký subscription
        const subscription = await webPushService.requestNotificationPermission();
        
        if (subscription) {
          // Lưu thông tin vào localStorage
          localStorage.setItem('notificationJustGranted', 'true');
          localStorage.setItem('notification_registered', 'true');
          localStorage.setItem('notification_user_id', currentUser._id);
          
          // Sử dụng toast với thời gian ngắn hơn
          toast.success('Đã bật thông báo thành công!', {
            autoClose: 2000,
            hideProgressBar: true
          });
          
          // Kích hoạt sự kiện tùy chỉnh để thông báo cho các component khác
          const event = new CustomEvent('notificationPermissionChanged', { 
            detail: { permission: 'granted', subscription } 
          });
          window.dispatchEvent(event);
        } else {
          // Nếu đã được cấp quyền nhưng không đăng ký được subscription
          toast.warning('Đã được cấp quyền thông báo nhưng không thể đăng ký thiết bị', {
            autoClose: 3000
          });
        }
      } else if (permissionResult === 'denied') {
        // Nếu quyền bị từ chối
        toast.error('Quyền thông báo đã bị từ chối. Bạn cần thay đổi cài đặt trình duyệt để nhận thông báo.', {
          autoClose: 8000,
          onClick: () => setShowGuide(true)
        });
        
        setTimeout(() => {
          setShowGuide(true);
        }, 1000);
        
        localStorage.setItem('notificationPermanentlyDismissed', 'true');
      } else {
        // Nếu hủy hoặc không cấp quyền
        toast.info('Bạn đã hủy yêu cầu quyền thông báo', {
          autoClose: 2000
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Có lỗi xảy ra khi đăng ký thông báo', {
        autoClose: 3000
      });
    }
  };

  const dismissPrompt = (permanently = false) => {
    setShowPrompt(false);
    
    if (permanently) {
      // Lưu vào localStorage để không bao giờ hiển thị lại
      localStorage.setItem('notificationPermanentlyDismissed', 'true');
    } else {
      // Lưu vào localStorage để không hiển thị lại trong 7 ngày
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // Thêm 7 ngày
      
      const dismissData = {
        dismissed: true,
        expiry: expiryDate.getTime()
      };
      
      localStorage.setItem('notificationPromptDismissed', 'true');
      localStorage.setItem('notificationPromptDismissedData', JSON.stringify(dismissData));
    }
  };

  if (!showPrompt || 
      Notification.permission === 'granted' || 
      localStorage.getItem('notificationPermanentlyDismissed') === 'true' ||
      localStorage.getItem('notificationPromptDismissed') === 'true') {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50 border border-yellow-200">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              Bật thông báo
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Cho phép thông báo để nhận tin nhắn mới từ các kết nối của bạn, ngay cả khi bạn không mở ứng dụng.
            </p>
            <div className="mt-4 flex flex-col space-y-3">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Cho phép
                </button>
                <button
                  type="button"
                  onClick={() => dismissPrompt(false)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Để sau
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hiển thị hướng dẫn cách bật thông báo nếu cần */}
      {showGuide && (
        <NotificationGuide onClose={() => setShowGuide(false)} />
      )}
    </>
  );
};

export default NotificationPermission;