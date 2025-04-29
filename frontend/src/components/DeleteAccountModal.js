import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

const DeleteAccountModal = ({ onClose }) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();
  
  const handleDelete = async () => {
    if (confirmText !== 'XÓA TÀI KHOẢN') {
      toast.error('Vui lòng nhập đúng cụm từ xác nhận');
      return;
    }
    
    try {
      setLoading(true);
      await deleteAccount();
      
      toast.success('Tài khoản đã được xóa thành công');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa tài khoản');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-red-600">Xóa tài khoản</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Bạn đang chuẩn bị xóa tài khoản của mình. Hành động này không thể hoàn tác và tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn, bao gồm:
          </p>
          
          <ul className="list-disc pl-5 mb-4 text-gray-700">
            <li>Hồ sơ cá nhân</li>
            <li>Lịch sử match</li>
            <li>Tin nhắn</li>
            <li>Tất cả tương tác khác</li>
          </ul>
          
          <p className="text-gray-700 mb-4">
            Để xác nhận, vui lòng nhập "XÓA TÀI KHOẢN" vào ô bên dưới:
          </p>
          
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="XÓA TÀI KHOẢN"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            disabled={loading || confirmText !== 'XÓA TÀI KHOẢN'}
          >
            {loading ? <Loader /> : 'Xóa tài khoản'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;