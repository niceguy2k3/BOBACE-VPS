import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';
import Loader from '../components/Loader';
import logo from '../images/logo2.png';

const PendingVerification = () => {
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('pendingVerificationEmail') || '';
  });
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { resendVerificationEmail } = useAuth();

  const handleResendVerification = async () => {
    if (resending || countdown > 0) return;
    
    try {
      setResending(true);
      await resendVerificationEmail(email);
      showSuccessToast('Email xác thực đã được gửi lại thành công!');
      
      // Bắt đầu đếm ngược 60 giây
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Resend verification error:', error);
      showErrorToast(error.response?.data?.message || 'Không thể gửi lại email xác thực. Vui lòng thử lại sau.');
    } finally {
      setResending(false);
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
          Xác thực Email
        </h2>
        
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Kiểm tra hộp thư của bạn</h3>
          
          <p className="text-gray-600 mb-4">
            Chúng tôi đã gửi một email xác thực đến <span className="font-semibold">{email}</span>.
            Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác thực để hoàn tất quá trình đăng ký.
          </p>
          
          <p className="text-gray-500 text-sm mb-6">
            Nếu bạn không nhận được email, vui lòng kiểm tra thư mục spam hoặc gửi lại email xác thực.
          </p>
          
          <div className="flex flex-col space-y-3">
            <button 
              onClick={handleResendVerification}
              disabled={resending || countdown > 0}
              className={`w-full py-2 px-4 font-semibold rounded-md transition duration-200 ${
                resending || countdown > 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {resending ? (
                <div className="flex items-center justify-center">
                  <Loader size="small" color="white" />
                  <span className="ml-2">Đang gửi...</span>
                </div>
              ) : countdown > 0 ? (
                `Gửi lại sau (${countdown}s)`
              ) : (
                'Gửi lại email xác thực'
              )}
            </button>
            
            <Link 
              to="/login" 
              className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md transition duration-200"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingVerification;