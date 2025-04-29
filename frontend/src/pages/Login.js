import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import Loader from '../components/Loader';
import logo from '../images/logo2.png';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import EmailVerificationAlert from '../components/EmailVerificationAlert';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showErrorToast('Vui lòng nhập email và mật khẩu');
      return;
    }
    
    try {
      setLoading(true);
      await login(email, password, rememberMe);
      showSuccessToast('Đăng nhập thành công', {
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: false
      });
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
      
      // Kiểm tra xem lỗi có phải do email chưa xác thực không
      if (error.response?.data?.requireVerification) {
        setShowVerificationAlert(true);
        setUnverifiedEmail(error.response.data.email || email);
      } else {
        showErrorToast(error.response?.data?.message || 'Đăng nhập thất bại');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <>
      <div className="flex justify-center items-center min-h-screen relative">
        {/* Background gradient - full screen */}
        <div className="fixed inset-0 bg-gradient-to-b from-neutral-50 to-neutral-100 z-0"></div>
        <div className="relative z-10 w-full flex justify-center items-center py-16">
          <motion.div 
            className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-6 text-white text-center">
              <motion.div 
                className="flex justify-center mb-4"
                variants={itemVariants}
              >
                <img src={logo} alt="BOBACE" className="h-24" />
              </motion.div>
              <motion.h2 
                className="text-2xl font-bold"
                variants={itemVariants}
              >
                Chào mừng trở lại!
              </motion.h2>
              <motion.p 
                className="text-yellow-100"
                variants={itemVariants}
              >
                Đăng nhập để tiếp tục hành trình tìm kiếm bạn trà sữa
              </motion.p>
            </div>
            
            {/* Form */}
            <div className="p-8">
              {showVerificationAlert && (
                <EmailVerificationAlert email={unverifiedEmail} />
              )}
              <form onSubmit={handleSubmit}>
                <motion.div 
                  className="mb-5"
                  variants={itemVariants}
                >
                  <label 
                    htmlFor="email" 
                    className="block text-neutral-700 text-sm font-medium mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-neutral-500" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      placeholder="Nhập email của bạn"
                      required
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  className="mb-6"
                  variants={itemVariants}
                >
                  <label 
                    htmlFor="password" 
                    className="block text-neutral-700 text-sm font-medium mb-2"
                  >
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-neutral-500" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      placeholder="Nhập mật khẩu của bạn"
                      required
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-yellow-500 border-neutral-300 rounded focus:ring-yellow-500"
                      />
                      <label htmlFor="rememberMe" className="ml-2 text-sm text-neutral-700">
                        Ghi nhớ đăng nhập
                      </label>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setForgotPasswordModalOpen(true)}
                      className="text-sm text-yellow-600 hover:text-yellow-700 transition-colors duration-200"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                </motion.div>
                
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-500 text-white py-3 px-4 rounded-xl hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <Loader size="sm" color="yellow" />
                  ) : (
                    <>
                      <FaSignInAlt className="mr-2" />
                      Đăng nhập
                    </>
                  )}
                </motion.button>
              </form>
              
              <motion.div 
                className="mt-6 text-center"
                variants={itemVariants}
              >
                <p className="text-neutral-600">
                  Chưa có tài khoản?{' '}
                  <Link to="/register" className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors duration-200">
                    Đăng ký ngay
                  </Link>
                </p>
              </motion.div>
              
              {/* Social login options */}
              <motion.div 
                className="mt-8"
                variants={itemVariants}
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-neutral-500">Hoặc đăng nhập với</span>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center py-3 px-4 border border-neutral-300 rounded-xl bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 transition-colors duration-200"
                  >
                    <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                    </svg>
                    <span className="ml-2">Google</span>
                  </button>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center py-3 px-4 border border-neutral-300 rounded-xl bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 transition-colors duration-200"
                  >
                    <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22,12.1c0-5.7-4.6-10.2-10.2-10.2c-5.7,0-10.2,4.6-10.2,10.2c0,5.1,3.7,9.3,8.5,10.1v-7.1H7.7v-3h2.5V9.4c0-2.5,1.5-3.9,3.8-3.9c1.1,0,2.2,0.2,2.2,0.2v2.5h-1.3c-1.2,0-1.6,0.8-1.6,1.6v1.9h2.8l-0.4,3h-2.3v7.1C18.3,21.4,22,17.2,22,12.1z"/>
                    </svg>
                    <span className="ml-2">Facebook</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <ForgotPasswordModal 
        isOpen={forgotPasswordModalOpen} 
        onClose={() => setForgotPasswordModalOpen(false)} 
      />
    </>
  );
}

export default Login;