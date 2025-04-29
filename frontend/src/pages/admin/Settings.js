import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../contexts/AdminContext';
import { FaSpinner, FaCog, FaServer, FaToggleOn, FaToggleOff, FaCrown, FaSync } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getSystemStats, toggleMaintenanceMode, checkPremiumStatus } from '../../services/admin.service';

const AdminSettings = () => {
  const { loading, error } = useAdmin();
  const [systemStats, setSystemStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('Hệ thống đang bảo trì. Vui lòng quay lại sau.');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    setIsLoading(true);
    try {
      const response = await getSystemStats();
      setSystemStats(response);
      setMaintenanceMode(response.maintenanceMode || false);
      if (response.maintenanceMessage) {
        setMaintenanceMessage(response.maintenanceMessage);
      }
    } catch (error) {
      toast.error('Lỗi khi tải thông tin hệ thống');
      console.error('Error fetching system stats:', error);
      
      // Fallback to mock data if API fails
      const mockData = {
        os: 'Linux',
        nodeVersion: 'v14.17.0',
        memoryUsage: { used: 512000000, total: 1024000000 },
        cpuUsage: 25.5,
        database: {
          version: 'MongoDB 4.4.6',
          size: 256000000,
          collections: 12,
          status: 'Connected'
        },
        appVersion: '1.0.0',
        uptime: 86400 * 3 + 3600 * 5 + 60 * 30, // 3 days, 5 hours, 30 minutes
        environment: 'Production',
        apiEndpoints: 45,
        maintenanceMode: false,
        maintenanceMessage: 'Hệ thống đang bảo trì. Vui lòng quay lại sau.'
      };
      
      setSystemStats(mockData);
      setMaintenanceMode(mockData.maintenanceMode);
      setMaintenanceMessage(mockData.maintenanceMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      await toggleMaintenanceMode({
        enabled: !maintenanceMode,
        message: maintenanceMessage
      });
      setMaintenanceMode(!maintenanceMode);
      toast.success(`Đã ${!maintenanceMode ? 'bật' : 'tắt'} chế độ bảo trì`);
    } catch (error) {
      toast.error('Lỗi khi thay đổi chế độ bảo trì');
      console.error('Error toggling maintenance mode:', error);
      
      // Fallback if API fails
      setMaintenanceMode(!maintenanceMode);
      toast.info('Đã thay đổi chế độ bảo trì (chế độ demo)');
    }
  };
  
  // Hàm kiểm tra và cập nhật trạng thái premium
  const handleCheckPremium = async () => {
    try {
      const response = await checkPremiumStatus();
      
      if (response.expiredCount > 0) {
        toast.success(`Đã cập nhật trạng thái premium cho ${response.expiredCount} người dùng hết hạn`);
      } else {
        toast.info('Không có người dùng premium nào hết hạn');
      }
    } catch (error) {
      toast.error('Lỗi khi kiểm tra trạng thái premium');
      console.error('Error checking premium status:', error);
    }
  };

  if (loading && isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <FaSpinner className="animate-spin text-amber-600 text-4xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Cài đặt hệ thống</h1>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cài đặt chung
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'system'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Thông tin hệ thống
              </button>
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'maintenance'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bảo trì
              </button>
            </nav>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {activeTab === 'general' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Cài đặt chung</h2>
              <FaCog className="text-amber-600 text-2xl" />
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Cài đặt ứng dụng</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Tên ứng dụng</p>
                      <p className="text-sm text-gray-500">Tên hiển thị của ứng dụng</p>
                    </div>
                    <input
                      type="text"
                      defaultValue="BOBACE"
                      onChange={(e) => console.log('App name changed:', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Logo</p>
                      <p className="text-sm text-gray-500">Logo của ứng dụng</p>
                    </div>
                    <button className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500">
                      Thay đổi logo
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Màu chủ đạo</p>
                      <p className="text-sm text-gray-500">Màu chính của ứng dụng</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        defaultValue="#d97706"
                        onChange={(e) => console.log('Color changed:', e.target.value)}
                        className="w-10 h-10 rounded-md border border-gray-300"
                      />
                      <input
                        type="text"
                        defaultValue="#d97706"
                        onChange={(e) => console.log('Color code changed:', e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 w-24"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Cài đặt người dùng</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Xác minh email</p>
                      <p className="text-sm text-gray-500">Yêu cầu xác minh email khi đăng ký</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                      <input
                        type="checkbox"
                        className="absolute w-0 h-0 opacity-0"
                        checked={true}
                        onChange={(e) => console.log('Email verification changed:', e.target.checked)}
                      />
                      <span className="absolute left-0 top-0 right-0 bottom-0 rounded-full bg-amber-600"></span>
                      <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white transition-transform"></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Số lượt thích miễn phí</p>
                      <p className="text-sm text-gray-500">Số lượt thích miễn phí mỗi ngày</p>
                    </div>
                    <input
                      type="number"
                      defaultValue="10"
                      min="0"
                      onChange={(e) => console.log('Free likes changed:', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 w-24"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Số lượt thích premium</p>
                      <p className="text-sm text-gray-500">Số lượt thích cho người dùng premium</p>
                    </div>
                    <input
                      type="number"
                      defaultValue="100"
                      min="0"
                      onChange={(e) => console.log('Premium likes changed:', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 w-24"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500">
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && systemStats && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Thông tin hệ thống</h2>
              <FaServer className="text-amber-600 text-2xl" />
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Thông tin máy chủ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Hệ điều hành</p>
                    <p className="text-md font-medium text-gray-800">{systemStats.os || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Phiên bản Node.js</p>
                    <p className="text-md font-medium text-gray-800">{systemStats.nodeVersion || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Bộ nhớ đã sử dụng</p>
                    <p className="text-md font-medium text-gray-800">{systemStats.memoryUsage ? `${(systemStats.memoryUsage.used / 1024 / 1024).toFixed(2)} MB / ${(systemStats.memoryUsage.total / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">CPU</p>
                    <p className="text-md font-medium text-gray-800">{systemStats.cpuUsage ? `${systemStats.cpuUsage.toFixed(2)}%` : 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Thông tin cơ sở dữ liệu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Phiên bản MongoDB</p>
                    <p className="text-md font-medium text-gray-800">{systemStats.database?.version || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Kích thước DB</p>
                    <p className="text-md font-medium text-gray-800">{systemStats.database?.size ? `${(systemStats.database.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Số lượng collections</p>
                    <p className="text-md font-medium text-gray-800">{systemStats.database?.collections || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Trạng thái</p>
                    <p className="text-md font-medium text-gray-800">{systemStats.database?.status || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Thông tin ứng dụng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Phiên bản ứng dụng</p>
                    <p className="text-md font-medium text-gray-800">{systemStats.appVersion || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Thời gian hoạt động</p>
                    <p className="text-md font-medium text-gray-800">{systemStats.uptime ? `${Math.floor(systemStats.uptime / 86400)} ngày ${Math.floor((systemStats.uptime % 86400) / 3600)} giờ ${Math.floor((systemStats.uptime % 3600) / 60)} phút` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Môi trường</p>
                    <p className="text-md font-medium text-gray-800">{systemStats.environment || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Số lượng API endpoints</p>
                    <p className="text-md font-medium text-gray-800">{systemStats.apiEndpoints || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={fetchSystemStats}
                  className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  Làm mới
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Chế độ bảo trì</h2>
              {maintenanceMode ? (
                <FaToggleOn className="text-amber-600 text-2xl" />
              ) : (
                <FaToggleOff className="text-gray-400 text-2xl" />
              )}
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Trạng thái bảo trì</p>
                  <p className="text-sm text-gray-500">Bật/tắt chế độ bảo trì cho toàn bộ hệ thống</p>
                </div>
                <button
                  onClick={handleToggleMaintenance}
                  className={`relative inline-flex items-center px-4 py-2 rounded-md ${
                    maintenanceMode
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                >
                  {maintenanceMode ? 'Đang bật' : 'Đang tắt'}
                </button>
              </div>
              
              <div>
                <label htmlFor="maintenanceMessage" className="block text-sm font-medium text-gray-700 mb-2">
                  Thông báo bảo trì
                </label>
                <textarea
                  id="maintenanceMessage"
                  rows="4"
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                ></textarea>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Lịch trình bảo trì</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Thời gian bắt đầu
                    </label>
                    <input
                      type="datetime-local"
                      id="startTime"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Thời gian kết thúc (dự kiến)
                    </label>
                    <input
                      type="datetime-local"
                      id="endTime"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={handleToggleMaintenance}
                  className={`px-4 py-2 rounded-md ${
                    maintenanceMode
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-amber-600 text-white hover:bg-amber-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500`}
                >
                  {maintenanceMode ? 'Tắt chế độ bảo trì' : 'Bật chế độ bảo trì'}
                </button>
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                  Lên lịch bảo trì
                </button>
              </div>
              
              <div className="mt-8 border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-medium text-gray-700">Quản lý tài khoản Premium</h3>
                    <p className="text-sm text-gray-500">Kiểm tra và cập nhật trạng thái premium của người dùng</p>
                  </div>
                  <button
                    onClick={handleCheckPremium}
                    className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <FaCrown className="mr-2" /> Kiểm tra Premium
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Hệ thống sẽ tự động kiểm tra và cập nhật trạng thái premium hàng ngày vào lúc 00:01. 
                  Bạn cũng có thể kiểm tra thủ công bằng cách nhấn nút bên trên.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;