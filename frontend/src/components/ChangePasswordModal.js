import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config/constants';
import Loader from './Loader';

const ChangePasswordModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin', {
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        closeButton: true,
        toastId: `password-empty-${Date.now()}`
      });
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp', {
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        closeButton: true,
        toastId: `password-mismatch-${Date.now()}`
      });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự', {
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        closeButton: true,
        toastId: `password-length-${Date.now()}`
      });
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.put(
        `${API_URL}/api/users/password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        config
      );
      
      toast.success('Đổi mật khẩu thành công', {
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        closeButton: true,
        toastId: `password-success-${Date.now()}`
      });
      onClose();
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại', {
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        closeButton: true,
        toastId: `password-error-${Date.now()}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Đổi mật khẩu</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label 
              htmlFor="currentPassword" 
              className="block text-gray-700 text-sm font-medium mb-2"
            >
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label 
              htmlFor="newPassword" 
              className="block text-gray-700 text-sm font-medium mb-2"
            >
              Mật khẩu mới
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label 
              htmlFor="confirmPassword" 
              className="block text-gray-700 text-sm font-medium mb-2"
            >
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              disabled={loading}
            >
              {loading ? <Loader /> : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;