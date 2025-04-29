import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaEllipsisV, FaFlag, FaBan } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import ReportUserModal from './ReportUserModal';

const UserActionMenu = ({ user }) => {
  const { blockUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleBlockUser = async () => {
    try {
      setLoading(true);
      await blockUser(user._id);
      toast.success(`Đã chặn ${user.fullName}`);
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error(error.response?.data?.message || 'Không thể chặn người dùng');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        aria-label="Tùy chọn"
      >
        <FaEllipsisV className="text-gray-500" />
      </button>
      
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-100">
          <button
            onClick={() => {
              setIsMenuOpen(false);
              setShowReportModal(true);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            disabled={loading}
          >
            <FaFlag className="mr-2 text-red-500" /> Báo cáo người dùng
          </button>
          <button
            onClick={handleBlockUser}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            disabled={loading}
          >
            <FaBan className="mr-2 text-red-500" /> 
            {loading ? 'Đang chặn...' : 'Chặn người dùng'}
          </button>
        </div>
      )}
      
      {showReportModal && (
        <ReportUserModal 
          user={user} 
          onClose={() => setShowReportModal(false)} 
        />
      )}
    </div>
  );
};

export default UserActionMenu;