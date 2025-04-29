import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';

const TestNotification = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { currentUser } = useAuth();

  const sendTestNotification = async () => {
    if (!currentUser) {
      toast.error('Bạn cần đăng nhập để sử dụng tính năng này');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const response = await axios.post(
        `${API_URL}/api/devices/test-notification`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setResult(response.data);
      
      if (response.data.success) {
        toast.success('Đã gửi thông báo test thành công');
      } else {
        toast.warning(response.data.message || 'Không thể gửi thông báo test');
      }
    } catch (error) {
      console.error('Lỗi khi gửi thông báo test:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      setResult({
        success: false,
        message: errorMessage,
        error: error.toString()
      });
      
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Kiểm tra thông báo</h3>
      
      <button
        onClick={sendTestNotification}
        disabled={loading}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {loading ? 'Đang gửi...' : 'Gửi thông báo test'}
      </button>
      
      {result && (
        <div className="mt-4">
          <div className="p-3 rounded-md bg-gray-50">
            <p className="font-medium">
              Kết quả: 
              <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                {result.success ? ' Thành công' : ' Thất bại'}
              </span>
            </p>
            <p className="text-sm mt-1">{result.message}</p>
            
            {result.deviceCount !== undefined && (
              <p className="text-sm mt-1">
                Số thiết bị đã đăng ký: <span className="font-medium">{result.deviceCount}</span>
              </p>
            )}
            
            {result.devices && result.devices.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium">Thiết bị đã đăng ký:</p>
                <ul className="text-xs mt-1 space-y-1">
                  {result.devices.map((device, index) => (
                    <li key={device.id || index} className="pl-2 border-l-2 border-gray-300">
                      <div>Platform: {device.platform}</div>
                      {device.deviceName && <div className="truncate">Device: {device.deviceName}</div>}
                      <div>Hoạt động: {new Date(device.lastActive).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.error && (
              <p className="text-xs text-red-500 mt-2">
                Chi tiết lỗi: {result.error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestNotification;