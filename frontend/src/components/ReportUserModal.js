import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const ReportUserModal = ({ user, onClose, onSuccess }) => {
  const { reportUser } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error('Vui lòng chọn lý do báo cáo');
      return;
    }
    
    try {
      setLoading(true);
      await reportUser(user._id, reason, description);
      toast.success('Báo cáo đã được gửi thành công');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error reporting user:', error);
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi báo cáo người dùng');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Báo cáo người dùng</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
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
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Lý do báo cáo
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            >
              <option value="">Chọn lý do</option>
              <option value="fake_profile">Hồ sơ giả mạo</option>
              <option value="inappropriate_content">Nội dung không phù hợp</option>
              <option value="harassment">Quấy rối</option>
              <option value="spam">Spam</option>
              <option value="other">Lý do khác</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Mô tả chi tiết (không bắt buộc)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              rows="4"
              placeholder="Mô tả chi tiết về vấn đề bạn gặp phải..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportUserModal;