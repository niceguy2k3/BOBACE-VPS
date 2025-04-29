import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';
import Loader from '../components/Loader';
import logo from '../images/logo2.png';

const EmailVerification = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  useEffect(() => {
    const verifyUserEmail = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Make sure the token is properly decoded from URL
        const decodedToken = decodeURIComponent(token);
        console.log('Attempting to verify email with token:', decodedToken);
        
        // Add a small delay to ensure backend is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try up to 3 times with increasing delays
        let response;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
          try {
            response = await verifyEmail(decodedToken);
            console.log('Verification response:', response);
            break; // Success, exit the loop
          } catch (retryError) {
            attempts++;
            if (attempts >= maxAttempts) {
              throw retryError; // Rethrow the last error if we've exhausted our attempts
            }
            console.log(`Verification attempt ${attempts} failed, retrying in ${attempts * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, attempts * 1000));
          }
        }
        
        setVerified(true);
        
        // Show appropriate message based on whether email was already verified
        if (response.message.includes('đã được xác thực trước đó')) {
          showSuccessToast('Email đã được xác thực trước đó!');
        } else {
          showSuccessToast('Email đã được xác thực thành công!');
        }
        
        // Xóa email đang chờ xác thực khỏi localStorage
        localStorage.removeItem('pendingVerificationEmail');
        
        // Chuyển hướng sau 3 giây
        setTimeout(() => {
          navigate('/home');
        }, 3000);
      } catch (error) {
        console.error('Email verification error:', error);
        
        // Check if we have a specific error message from the server
        const errorMessage = error.response?.data?.message || 'Không thể xác thực email. Mã xác thực không hợp lệ hoặc đã hết hạn.';
        setError(errorMessage);
        showErrorToast(errorMessage);
        
        // If we get a 500 error or token invalid error, offer to resend verification
        if (error.response?.status === 500 || errorMessage.includes('không hợp lệ')) {
          const pendingEmail = localStorage.getItem('pendingVerificationEmail');
          if (pendingEmail) {
            setTimeout(() => {
              showErrorToast(
                'Có vẻ như đã xảy ra lỗi. Bạn có thể thử gửi lại email xác thực.',
                { autoClose: 10000 }
              );
            }, 1000);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    verifyUserEmail();
  }, [token, navigate, verifyEmail]);

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
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader />
            <p className="mt-4 text-gray-600">Đang xác thực email của bạn...</p>
          </div>
        ) : verified ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Email đã được xác thực!</h3>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã xác thực email. Bạn có thể đăng nhập và sử dụng tất cả các tính năng của BOBACE.
            </p>
            <p className="text-gray-500 text-sm">
              Bạn sẽ được chuyển hướng đến trang chủ trong vài giây...
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Xác thực thất bại</h3>
            <p className="text-gray-600 mb-6">
              {error || 'Không thể xác thực email của bạn. Mã xác thực không hợp lệ hoặc đã hết hạn.'}
            </p>
            
            {localStorage.getItem('pendingVerificationEmail') && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-700 mb-2">Gửi lại email xác thực?</h4>
                <p className="text-sm text-blue-600 mb-3">
                  Nếu bạn chưa nhận được email hoặc link đã hết hạn, bạn có thể yêu cầu gửi lại.
                </p>
                <button
                  onClick={() => {
                    const email = localStorage.getItem('pendingVerificationEmail');
                    if (email) {
                      navigate('/resend-verification', { state: { email } });
                    }
                  }}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
                >
                  Gửi lại email xác thực
                </button>
              </div>
            )}
            
            <div className="flex flex-col space-y-3">
              <Link 
                to="/login" 
                className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-md transition duration-200"
              >
                Đăng nhập
              </Link>
              <Link 
                to="/register" 
                className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md transition duration-200"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;