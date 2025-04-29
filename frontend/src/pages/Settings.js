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
    <div className="pt-24 pb-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('account')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'account'
                  ? 'border-b-2 border-yellow-500 text-yellow-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tài khoản
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-yellow-500 text-yellow-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Thông báo
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'privacy'
                  ? 'border-b-2 border-yellow-500 text-yellow-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quyền riêng tư
            </button>
            <button
              onClick={() => setActiveTab('blocked')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'blocked'
                  ? 'border-b-2 border-yellow-500 text-yellow-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Người dùng bị chặn
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'account' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Tài khoản</h2>
              
              <div className="mb-4">
                <p className="text-gray-700">
                  <span className="font-medium">Email:</span> {currentUser.email}
                </p>
              </div>
              
              <div className="mb-4">
                <button
                  onClick={() => navigate('/profile')}
                  className="text-yellow-600 hover:text-yellow-700"
                >
                  Chỉnh sửa hồ sơ
                </button>
              </div>
              
              <div className="mb-4">
                <button
                  onClick={() => setShowChangePasswordModal(true)}
                  className="text-yellow-600 hover:text-yellow-700"
                >
                  Đổi mật khẩu
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex flex-col space-y-4">
                  <button
                    onClick={handleLogout}
                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                  >
                    Đăng xuất
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteAccountModal(true)}
                    className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    Xóa tài khoản
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông báo</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Tùy chọn thông báo</h3>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                      checked={notifyNewMatches}
                      onChange={(e) => handleNotificationChange('newMatches', e.target.checked)}
                      disabled={loading}
                    />
                    <span className="text-gray-700">Thông báo khi có match mới</span>
                  </label>
                </div>
                
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                      checked={notifyNewMessages}
                      onChange={(e) => handleNotificationChange('newMessages', e.target.checked)}
                      disabled={loading}
                    />
                    <span className="text-gray-700">Thông báo khi có tin nhắn mới</span>
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
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Quyền riêng tư</h2>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                    checked={allowLocationSearch}
                    onChange={(e) => handlePrivacyChange('allowLocationSearch', e.target.checked)}
                    disabled={loading}
                  />
                  <span className="text-gray-700">Cho phép tìm kiếm theo vị trí</span>
                </label>
              </div>
            </div>
          )}
          
          {activeTab === 'blocked' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Người dùng bị chặn</h2>
              <p className="text-gray-600 mb-4">
                Những người dùng bạn đã chặn sẽ không thể xem hồ sơ của bạn hoặc liên hệ với bạn.
              </p>
              
              <BlockedUsersList />
            </div>
          )}
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