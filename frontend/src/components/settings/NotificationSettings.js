import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { API_URL } from '../../config/constants';
import { 
  requestNotificationPermission, 
  isNotificationSupported 
} from '../../services/firebase';
import NotificationGuide from '../NotificationGuide';

const NotificationSettings = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  // Lấy danh sách thiết bị đã đăng ký
  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Không tìm thấy token xác thực');
        setDevices([]);
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/devices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setDevices(response.data.devices || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thiết bị:', error);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  // Xóa thiết bị
  const handleRemoveDevice = async (deviceToken) => {
    try {
      // Lấy token xác thực từ localStorage
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        console.error('Không tìm thấy token xác thực');
        toast.error('Bạn cần đăng nhập lại để thực hiện thao tác này');
        return;
      }
      
      await axios.delete(`${API_URL}/api/devices/unregister`, { 
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: { token: deviceToken } 
      });
      
      toast.success('Đã xóa thiết bị thành công');
      fetchDevices();
    } catch (error) {
      console.error('Lỗi khi xóa thiết bị:', error);
      toast.error('Không thể xóa thiết bị');
    }
  };

  const handleEnableNotifications = async () => {
    if (!isNotificationSupported()) {
      toast.error('Trình duyệt của bạn không hỗ trợ thông báo đẩy');
      return;
    }
  
    try {
      const processingToast = toast.info('Đang đăng ký thiết bị...', {
        autoClose: false,
        hideProgressBar: false,
      });
  
      localStorage.removeItem('fcm_token');
      const token = await requestNotificationPermission();
      toast.dismiss(processingToast);
  
      if (token) {
        setNotificationsEnabled(true);
        toast.success('Đã bật thông báo thành công');
  
        console.log('Waiting for server to save device...');
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await fetchDevices();
  
        if (devices.length === 0) {
          console.warn('No devices found, retrying...');
          toast.warn('Không tìm thấy thiết bị đã đăng ký. Đang thử lại...');
          await new Promise((resolve) => setTimeout(resolve, 5000));
          await fetchDevices();
          if (devices.length === 0) {
            console.error('Still no devices found after retry');
            toast.error('Không thể tải danh sách thiết bị. Vui lòng thử lại sau.');
          }
        }
  
        try {
          await testNotification();
          toast.success('Đã gửi thông báo test. Vui lòng kiểm tra.');
        } catch (testError) {
          console.error('Lỗi khi gửi thông báo test:', testError);
          toast.error('Không thể gửi thông báo test');
        }
      } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        toast.warning('Đã được cấp quyền nhưng không thể đăng ký thiết bị. Đang thử lại...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const retryToken = await requestNotificationPermission();
        if (retryToken) {
          toast.success('Đã đăng ký thiết bị thành công');
          await new Promise((resolve) => setTimeout(resolve, 5000));
          await fetchDevices();
        } else {
          toast.error('Không thể đăng ký thiết bị. Vui lòng làm mới trang và thử lại.');
        }
      } else {
        toast.error('Quyền thông báo bị từ chối. Vui lòng kiểm tra cài đặt trình duyệt.');
        setShowGuide(true);
      }
    } catch (error) {
      console.error('Lỗi khi bật thông báo:', error);
      toast.error(`Không thể bật thông báo: ${error.message || 'Lỗi không xác định'}`);
      toast.dismiss();
    }
  };
  
  // Gửi thông báo test
  const testNotification = async () => {
    try {
      // Lấy token xác thực từ localStorage
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        console.error('Không tìm thấy token xác thực');
        return;
      }
      
      // Gọi API để gửi thông báo test
      await axios.post(`${API_URL}/api/notifications/test`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('Đã gửi yêu cầu thông báo test');
    } catch (error) {
      console.error('Lỗi khi gửi thông báo test:', error);
      throw error;
    }
  };

  // Format thời gian hoạt động cuối
  const formatLastActive = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true,
        locale: vi
      });
    } catch (error) {
      return 'Không xác định';
    }
  };

  // Lấy tên thiết bị
  const getDeviceName = (platform) => {
    const userAgent = navigator.userAgent;
    let deviceName = platform === 'web' ? 'Trình duyệt web' : platform;

    if (userAgent.includes('Windows')) {
      deviceName += ' - Windows';
    } else if (userAgent.includes('Mac')) {
      deviceName += ' - Mac';
    } else if (userAgent.includes('iPhone')) {
      deviceName += ' - iPhone';
    } else if (userAgent.includes('iPad')) {
      deviceName += ' - iPad';
    } else if (userAgent.includes('Android')) {
      deviceName += ' - Android';
    } else if (userAgent.includes('Linux')) {
      deviceName += ' - Linux';
    }

    return deviceName;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Cài đặt thông báo</h2>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium">Thông báo đẩy</h3>
            <p className="text-sm text-gray-500">
              Nhận thông báo ngay cả khi không mở ứng dụng
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {notificationsEnabled ? (
              <>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Đã bật
                </span>
                {typeof Notification !== 'undefined' && Notification.permission === 'denied' && (
                  <button
                    onClick={() => setShowGuide(true)}
                    className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md text-xs flex items-center"
                    title="Xem hướng dẫn cách bật thông báo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Hướng dẫn
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleEnableNotifications}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-sm"
                >
                  Bật thông báo
                </button>
                {typeof Notification !== 'undefined' && Notification.permission === 'denied' && (
                  <button
                    onClick={() => setShowGuide(true)}
                    className="px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Hướng dẫn bật thông báo
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">Thiết bị đã đăng ký</h3>
          
          <button
            onClick={() => fetchDevices()}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            title="Làm mới danh sách thiết bị"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <svg className="animate-spin h-5 w-5 mx-auto text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : devices.length === 0 ? (
          <div className="border rounded-md p-4">
            <div className="text-center py-4 text-gray-500">
              Không có thiết bị nào được đăng ký
            </div>
            <div className="mt-2 text-center">
              <button
                onClick={handleEnableNotifications}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
              >
                Đăng ký thiết bị này
              </button>
            </div>
          </div>
        ) : (
          <div className="border rounded-md divide-y">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{getDeviceName(device.platform)}</div>
                  <div className="text-sm text-gray-500">
                    Hoạt động {formatLastActive(device.lastActive)}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveDevice(device.token)}
                  className="text-red-500 hover:text-red-700"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Kiểm tra thông báo */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="font-medium mb-3">Kiểm tra thông báo</h3>
        <button
          onClick={testNotification}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm"
        >
          Gửi thông báo test
        </button>
      </div>
      
      {/* Hiển thị hướng dẫn cách bật thông báo nếu cần */}
      {showGuide && (
        <NotificationGuide onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
};

export default NotificationSettings;