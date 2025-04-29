import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';
import Loader from '../components/Loader';
import logo from '../images/logo2.png';

const ResendVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerificationEmail } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    // Check if email was passed from previous page
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // Try to get from localStorage
      const pendingEmail = localStorage.getItem('pendingVerificationEmail');
      if (pendingEmail) {
        setEmail(pendingEmail);
      }
    }
  }, [location.state]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showErrorToast('Vui lòng nhập địa chỉ email');
      return;
    }
    
    try {
      setLoading(true);
      await resendVerificationEmail(email);
      setSuccess(true);
      showSuccessToast('Email xác thực đã được gửi lại thành công!');
      
      // Store email in localStorage for future reference
      localStorage.setItem('pendingVerificationEmail', email);
    } catch (error) {
      console.error('Error resending verification email:', error);
      showErrorToast(
        error.response?.data?.message || 
        'Không thể gửi lại email xác thực. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-b from-neutral-50 to-neutral-100 z-0"></div>
      <div className="relative z-10 w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="BOBACE" className="h-24" />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-yellow-600 mb-6">
          Gửi lại email xác thực
        </h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader />
            <p className="mt-4 text-gray-600">Đang gửi email xác thực...</p>
          </div>
        ) : success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Email đã được gửi!</h3>
            <p className="text-gray-600 mb-6">
              Chúng tôi đã gửi một email xác thực mới đến <span className="font-semibold">{email}</span>. 
              Vui lòng kiểm tra hộp thư của bạn và nhấp vào liên kết xác thực.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
              <h4 className="font-medium text-blue-700 mb-2">Không nhận được email?</h4>
              <ul className="text-sm text-blue-600 list-disc list-inside">
                <li>Kiểm tra thư mục spam hoặc thư rác</li>
                <li>Đảm bảo địa chỉ email chính xác</li>
                <li>Đợi vài phút và kiểm tra lại</li>
              </ul>
            </div>
            <div className="flex flex-col space-y-3">
              <Link 
                to="/login" 
                className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-md transition duration-200"
              >
                Đăng nhập
              </Link>
              <button
                onClick={() => setSuccess(false)}
                className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md transition duration-200"
              >
                Gửi lại lần nữa
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Nhập email của bạn"
                required
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700">
                Nhập email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi một email xác thực mới đến địa chỉ này.
              </p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-md transition duration-200"
              >
                Gửi email xác thực
              </button>
              <Link 
                to="/login" 
                className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md text-center transition duration-200"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResendVerification;