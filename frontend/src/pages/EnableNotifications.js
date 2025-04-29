import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { requestNotificationPermission, isNotificationSupported } from '../services/webPushService';
import { useAuth } from '../contexts/AuthContext';

const EnableNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('initial');
  const [browserInfo, setBrowserInfo] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Get browser information
    const browser = detectBrowser();
    setBrowserInfo(browser);

    // Check current notification status
    checkNotificationStatus();
  }, []);

  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    let browserName = "Unknown";
    
    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "Chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "Firefox";
    } else if (userAgent.match(/safari/i)) {
      browserName = "Safari";
    } else if (userAgent.match(/opr\//i)) {
      browserName = "Opera";
    } else if (userAgent.match(/edg/i)) {
      browserName = "Edge";
    }
    
    return browserName;
  };

  const checkNotificationStatus = () => {
    if (!isNotificationSupported()) {
      setStatus('unsupported');
      return;
    }

    if (Notification.permission === 'granted') {
      setStatus('granted');
    } else if (Notification.permission === 'denied') {
      setStatus('denied');
    } else {
      setStatus('default');
    }
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    
    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        setStatus('granted');
        toast.success('Thông báo đã được bật thành công!', {
          autoClose: 3000
        });
        
        // Send a test notification
        setTimeout(() => {
          try {
            new Notification('Thông báo đã được bật', {
              body: 'Bạn sẽ nhận được thông báo khi có tin nhắn mới',
              icon: '/logo192.png'
            });
          } catch (error) {
            console.error('Error sending test notification:', error);
          }
        }, 1000);
      } else {
        // Check if permission was denied
        if (Notification.permission === 'denied') {
          setStatus('denied');
        } else {
          setStatus('error');
          toast.error('Không thể bật thông báo. Vui lòng thử lại sau.', {
            autoClose: 3000
          });
        }
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setStatus('error');
      toast.error('Có lỗi xảy ra khi bật thông báo', {
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const getBrowserInstructions = () => {
    switch (browserInfo) {
      case 'Chrome':
        return (
          <ol className="list-decimal pl-5 space-y-2">
            <li>Nhấp vào biểu tượng khóa hoặc "i" trong thanh địa chỉ</li>
            <li>Chọn "Thông báo" từ menu</li>
            <li>Thay đổi từ "Chặn" sang "Cho phép"</li>
            <li>Làm mới trang web</li>
          </ol>
        );
      case 'Firefox':
        return (
          <ol className="list-decimal pl-5 space-y-2">
            <li>Nhấp vào biểu tượng khóa trong thanh địa chỉ</li>
            <li>Chọn "Thông báo" từ menu</li>
            <li>Thay đổi từ "Chặn" sang "Cho phép"</li>
            <li>Làm mới trang web</li>
          </ol>
        );
      case 'Safari':
        return (
          <ol className="list-decimal pl-5 space-y-2">
            <li>Mở Tùy chọn Safari</li>
            <li>Chọn tab "Trang web"</li>
            <li>Tìm "Thông báo" trong danh sách</li>
            <li>Tìm trang web này và chọn "Cho phép"</li>
            <li>Làm mới trang web</li>
          </ol>
        );
      case 'Edge':
        return (
          <ol className="list-decimal pl-5 space-y-2">
            <li>Nhấp vào biểu tượng khóa trong thanh địa chỉ</li>
            <li>Chọn "Quyền" từ menu</li>
            <li>Tìm "Thông báo" và thay đổi từ "Chặn" sang "Cho phép"</li>
            <li>Làm mới trang web</li>
          </ol>
        );
      default:
        return (
          <ol className="list-decimal pl-5 space-y-2">
            <li>Mở cài đặt trình duyệt của bạn</li>
            <li>Tìm phần "Quyền" hoặc "Thông báo"</li>
            <li>Tìm trang web này và cho phép thông báo</li>
            <li>Làm mới trang web</li>
          </ol>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bật thông báo</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 pt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-medium text-gray-900">Tại sao cần bật thông báo?</h2>
            <p className="mt-1 text-gray-600">
              Thông báo giúp bạn không bỏ lỡ tin nhắn mới, lượt thích và các cập nhật quan trọng khác, ngay cả khi bạn không mở ứng dụng.
            </p>
          </div>
        </div>

        {status === 'unsupported' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Trình duyệt của bạn không hỗ trợ thông báo đẩy. Vui lòng sử dụng trình duyệt hiện đại hơn như Chrome, Firefox, Safari hoặc Edge.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'granted' && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Thông báo đã được bật! Bạn sẽ nhận được thông báo khi có tin nhắn mới.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'denied' && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Thông báo đã bị chặn. Bạn cần thay đổi cài đặt trong trình duyệt để bật thông báo.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Có lỗi xảy ra khi bật thông báo. Vui lòng thử lại sau.
                </p>
              </div>
            </div>
          </div>
        )}

        {(status === 'default' || status === 'error') && (
          <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Bật thông báo ngay'}
          </button>
        )}

        {status === 'denied' && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Hướng dẫn bật thông báo trong {browserInfo}</h3>
            {getBrowserInstructions()}
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Làm mới trang sau khi bật thông báo
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default EnableNotifications;