import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';
import ChangePasswordModal from '../components/ChangePasswordModal';
import DeleteAccountModal from '../components/DeleteAccountModal';
import BlockedUsersList from '../components/BlockedUsersList';
import NotificationSettings from '../components/settings/NotificationSettings';
import TestNotification from '../components/TestNotification';
import { API_URL } from '../config/constants';
import axios from 'axios';
import { showToast } from '../utils/toastHelper';
import { FaUser, FaExclamationTriangle, FaBell, FaShieldAlt, FaBan } from 'react-icons/fa';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  
  // Notification settings
  const [notifyNewMatches, setNotifyNewMatches] = useState(true);
  const [notifyNewMessages, setNotifyNewMessages] = useState(true);
  
  // Privacy settings
  const [allowLocationSearch, setAllowLocationSearch] = useState(true);
  
  // Load user settings
  useEffect(() => {
    if (currentUser && currentUser.settings) {
      // Load notification settings
      if (currentUser.settings.notifications) {
        setNotifyNewMatches(currentUser.settings.notifications.newMatches ?? true);
        setNotifyNewMessages(currentUser.settings.notifications.newMessages ?? true);
      }
      
      // Load privacy settings
      if (currentUser.settings.privacy) {
        setAllowLocationSearch(currentUser.settings.privacy.allowLocationSearch ?? true);
      }
    }
  }, [currentUser]);
  
  // Check if we have a tab parameter from navigation
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);
  
  // Save settings to backend
  const saveSettings = async (type, settings) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/api/users/settings`,
        { [type]: settings },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      showToast('success', 'Cài đặt đã được lưu', {
        toastId: `settings-save-${Date.now()}`
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('error', 'Không thể lưu cài đặt. Vui lòng thử lại sau.', {
        toastId: `settings-error-${Date.now()}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle notification settings change
  const handleNotificationChange = async (setting, value) => {
    if (setting === 'newMatches') {
      setNotifyNewMatches(value);
      await saveSettings('notifications', { newMatches: value, newMessages: notifyNewMessages });
    } else if (setting === 'newMessages') {
      setNotifyNewMessages(value);
      await saveSettings('notifications', { newMatches: notifyNewMatches, newMessages: value });
    }
  };
  
  // Handle privacy settings change
  const handlePrivacyChange = async (setting, value) => {
    if (setting === 'allowLocationSearch') {
      setAllowLocationSearch(value);
      await saveSettings('privacy', { 
        showProfile: !value, // Inverse of incognito mode
        allowLocationSearch: allowLocationSearch,
      });
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    showToast('success', 'Đăng xuất thành công', {
      toastId: `logout-${Date.now()}`
    });
  };
  
  if (!currentUser) {
    return <Loader />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-neutral-50 to-neutral-100 pt-20 pb-12 px-4">
      {/* Background decorative elements */}
      <div className="fixed top-0 left-0 w-full h-full opacity-30 pointer-events-none z-0">
        <div className="absolute -inset-10 bg-[radial-gradient(#FFD700_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">
            Cài đặt
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base">
            Quản lý tài khoản và tùy chọn của bạn
          </p>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-yellow-100">
          <div className="border-b border-yellow-100 bg-gradient-to-r from-yellow-50/50 to-amber-50/50">
            <nav className="flex justify-center">
              <button
                onClick={() => setActiveTab('account')}
                className={`px-3 py-4 text-xs font-medium transition-all duration-200 ${
                  activeTab === 'account'
                    ? 'border-b-2 border-yellow-500 text-yellow-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="hidden sm:inline">Tài khoản</span>
                <span className="sm:hidden">Cá nhân</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-3 py-4 text-xs font-medium transition-all duration-200 ${
                  activeTab === 'notifications'
                    ? 'border-b-2 border-yellow-500 text-yellow-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="hidden sm:inline">Thông báo</span>
                <span className="sm:hidden">TB</span>
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`px-3 py-4 text-xs font-medium transition-all duration-200 ${
                  activeTab === 'privacy'
                    ? 'border-b-2 border-yellow-500 text-yellow-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="hidden sm:inline">Quyền riêng tư</span>
                <span className="sm:hidden">Bảo mật</span>
              </button>
              <button
                onClick={() => setActiveTab('blocked')}
                className={`px-3 py-4 text-xs font-medium transition-all duration-200 ${
                  activeTab === 'blocked'
                    ? 'border-b-2 border-yellow-500 text-yellow-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="hidden sm:inline">Người bị chặn</span>
                <span className="sm:hidden">Chặn</span>
              </button>
            </nav>
          </div>
        
        <div className="p-6 sm:p-8">
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Account Info Section */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                    <FaUser className="text-white text-lg" />
                  </div>
                  Thông tin tài khoản
                </h3>
                <div className="bg-white rounded-lg p-4 mb-4 border border-yellow-100">
                  <p className="text-sm text-gray-600 mb-1">Email đăng nhập</p>
                  <p className="text-base font-medium text-gray-800">{currentUser.email}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex-1 bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    <span className="hidden sm:inline">Chỉnh sửa hồ sơ</span>
                    <span className="sm:hidden">Sửa hồ sơ</span>
                  </button>
                  
                  <button
                    onClick={() => setShowChangePasswordModal(true)}
                    className="flex-1 bg-white text-yellow-600 border-2 border-yellow-500 py-3 px-4 rounded-lg hover:bg-yellow-50 transition-all duration-200 font-medium"
                  >
                    <span className="hidden sm:inline">Đổi mật khẩu</span>
                    <span className="sm:hidden">Đổi MK</span>
                  </button>
                </div>
              </div>
              
              {/* Danger Zone */}
              <div className="border-t-2 border-red-200 pt-6 mt-6">
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-red-500" />
                    Khu vực nguy hiểm
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    Các hành động dưới đây không thể hoàn tác. Hãy cẩn thận!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleLogout}
                      className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                    >
                      Đăng xuất
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteAccountModal(true)}
                      className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                    >
                      Xóa tài khoản
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Notifications Header */}
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mr-4">
                  <FaBell className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Thông báo</h2>
                  <p className="text-sm text-gray-600">Tùy chỉnh thông báo của bạn</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tùy chọn thông báo</h3>
                <div className="space-y-4">
                  <label className="flex items-center p-4 bg-white rounded-lg border border-blue-100 cursor-pointer hover:border-yellow-300 transition-all duration-200">
                    <input
                      type="checkbox"
                      className="mr-4 h-5 w-5 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                      checked={notifyNewMatches}
                      onChange={(e) => handleNotificationChange('newMatches', e.target.checked)}
                      disabled={loading}
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-800 block">Thông báo khi có match mới</span>
                      <span className="text-sm text-gray-600">Nhận thông báo khi có ai đó match với bạn</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 bg-white rounded-lg border border-blue-100 cursor-pointer hover:border-yellow-300 transition-all duration-200">
                    <input
                      type="checkbox"
                      className="mr-4 h-5 w-5 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                      checked={notifyNewMessages}
                      onChange={(e) => handleNotificationChange('newMessages', e.target.checked)}
                      disabled={loading}
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-800 block">Thông báo khi có tin nhắn mới</span>
                      <span className="text-sm text-gray-600">Nhận thông báo khi có tin nhắn mới</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <NotificationSettings />
                <div className="mt-6">
                  <TestNotification />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              {/* Privacy Header */}
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-4">
                  <FaShieldAlt className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Quyền riêng tư</h2>
                  <p className="text-sm text-gray-600">Bảo vệ thông tin của bạn</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Cài đặt vị trí</h3>
                <label className="flex items-center p-4 bg-white rounded-lg border border-green-100 cursor-pointer hover:border-yellow-300 transition-all duration-200">
                  <input
                    type="checkbox"
                    className="mr-4 h-5 w-5 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                    checked={allowLocationSearch}
                    onChange={(e) => handlePrivacyChange('allowLocationSearch', e.target.checked)}
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-800 block">Cho phép tìm kiếm theo vị trí</span>
                    <span className="text-sm text-gray-600">Cho phép người khác tìm bạn dựa trên vị trí của bạn</span>
                  </div>
                </label>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <FaShieldAlt className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Bảo mật dữ liệu</h4>
                    <p className="text-sm text-gray-600">
                      Thông tin cá nhân của bạn được mã hóa và bảo vệ an toàn. 
                      Chúng tôi cam kết không chia sẻ dữ liệu của bạn với bên thứ ba.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'blocked' && (
            <div className="space-y-6">
              {/* Blocked Users Header */}
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center mr-4">
                  <FaBan className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Người dùng bị chặn</h2>
                  <p className="text-sm text-gray-600">Quản lý danh sách người bị chặn</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
                <p className="text-sm text-red-800 flex items-start">
                  <FaExclamationTriangle className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>Những người dùng bạn đã chặn sẽ không thể xem hồ sơ của bạn hoặc liên hệ với bạn.</span>
                </p>
              </div>
              
              <BlockedUsersList />
            </div>
          )}
        </div>
        </div>
      </div>
      
      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
      )}
      
      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <DeleteAccountModal onClose={() => setShowDeleteAccountModal(false)} />
      )}
    </div>
  );
};

export default Settings;