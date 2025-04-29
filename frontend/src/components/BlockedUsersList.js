import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

const BlockedUsersList = () => {
  const { getBlockedUsers, unblockUser } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState(null);
  
  useEffect(() => {
    fetchBlockedUsers();
  }, []);
  
  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      const users = await getBlockedUsers();
      setBlockedUsers(users);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      toast.error('Không thể tải danh sách người dùng bị chặn', {
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        closeButton: true,
        toastId: `blocked-list-error-${Date.now()}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUnblock = async (userId) => {
    try {
      setUnblockingId(userId);
      await unblockUser(userId);
      setBlockedUsers(blockedUsers.filter(user => user._id !== userId));
      toast.success('Đã bỏ chặn người dùng', {
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        closeButton: true,
        toastId: `unblock-success-${Date.now()}`
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error(error.response?.data?.message || 'Không thể bỏ chặn người dùng', {
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        closeButton: true,
        toastId: `unblock-error-${Date.now()}`
      });
    } finally {
      setUnblockingId(null);
    }
  };
  
  if (loading) {
    return <Loader />;
  }
  
  if (blockedUsers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Bạn chưa chặn người dùng nào.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {blockedUsers.map(user => (
        <div 
          key={user._id} 
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-200">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.fullName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-500 text-white font-bold">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-800">{user.fullName}</p>
            </div>
          </div>
          
          <button
            onClick={() => handleUnblock(user._id)}
            disabled={unblockingId === user._id}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition-colors duration-200"
          >
            {unblockingId === user._id ? 'Đang bỏ chặn...' : 'Bỏ chặn'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default BlockedUsersList;