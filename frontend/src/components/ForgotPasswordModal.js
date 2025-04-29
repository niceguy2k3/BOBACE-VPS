import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaKey, FaLock, FaTimes, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';
import Loader from './Loader';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  // Kiểm tra độ mạnh của mật khẩu
  const passwordChecks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword)
  };
  
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;
  
  // Xác định màu và thông báo dựa trên độ mạnh
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Yếu';
    if (passwordStrength <= 3) return 'Trung bình';
    return 'Mạnh';
  };

  const resetForm = () => {
    setStep(1);
    setEmail('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showErrorToast('Vui lòng nhập email của bạn');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      
      showSuccessToast(response.data.message || 'Mã xác nhận đã được gửi đến email của bạn');
      setStep(2);
    } catch (error) {
      console.error('Error sending verification code:', error);
      showErrorToast(error.response?.data?.message || 'Không thể gửi mã xác nhận');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode) {
      showErrorToast('Vui lòng nhập mã xác nhận');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.post(`${API_URL}/api/auth/verify-reset-code`, { 
        email, 
        resetCode: verificationCode 
      });
      
      showSuccessToast(response.data.message || 'Chúng tôi đã xác nhận mã xác nhận của bạn');
      setStep(3);
    } catch (error) {
      console.error('Error verifying code:', error);
      showErrorToast(error.response?.data?.message || 'Mã xác nhận không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      showErrorToast('Vui lòng nhập mật khẩu mới và xác nhận mật khẩu');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showErrorToast('Mật khẩu không khớp');
      return;
    }
    
    // Kiểm tra độ mạnh của mật khẩu
    if (newPassword.length < 8) {
      showErrorToast('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    
    if (passwordStrength < 3) {
      showErrorToast('Mật khẩu quá yếu. Vui lòng tạo mật khẩu mạnh hơn với chữ hoa, chữ thường, số và ký tự đặc biệt');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        email,
        resetCode: verificationCode,
        newPassword
      });
      
      showSuccessToast(response.data.message || 'Đặt lại mật khẩu thành công');
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error resetting password:', error);
      showErrorToast(error.response?.data?.message || 'Không thể đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={overlayVariants}
        onClick={handleClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
          variants={modalVariants}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 text-white relative">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-white hover:text-yellow-200 transition-colors"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-xl font-bold text-center">Quên mật khẩu</h2>
            <p className="text-center text-yellow-100 text-sm mt-1">
              {step === 1 && "Nhập email của bạn để nhận mã xác nhận"}
              {step === 2 && "Nhập mã xác nhận đã được gửi đến email của bạn"}
              {step === 3 && "Tạo mật khẩu mới cho tài khoản của bạn"}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-6">
              <div className={`flex flex-col items-center ${step >= 1 ? 'text-yellow-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <span className="text-xs mt-1">Email</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-yellow-600' : 'bg-gray-200'}`}></div>
              <div className={`flex flex-col items-center ${step >= 2 ? 'text-yellow-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <span className="text-xs mt-1">Xác nhận</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-yellow-600' : 'bg-gray-200'}`}></div>
              <div className={`flex flex-col items-center ${step >= 3 ? 'text-yellow-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  3
                </div>
                <span className="text-xs mt-1">Mật khẩu mới</span>
              </div>
            </div>
          </div>

          {/* Form content */}
          <div className="p-6 pt-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form
                  key="step1"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleSendVerificationCode}
                >
                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className="block text-gray-700 text-sm font-medium mb-2"
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
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-yellow-500 text-white py-3 px-4 rounded-xl hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <Loader size="sm" color="yellow" />
                    ) : (
                      "Gửi mã xác nhận"
                    )}
                  </button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form
                  key="step2"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleVerifyCode}
                >
                  <div className="mb-4">
                    <label
                      htmlFor="verificationCode"
                      className="block text-gray-700 text-sm font-medium mb-2"
                    >
                      Mã xác nhận
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaKey className="text-neutral-500" />
                      </div>
                      <input
                        type="text"
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        placeholder="Nhập mã xác nhận"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Mã xác nhận đã được gửi đến email {email}
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-yellow-500 text-white py-3 px-4 rounded-xl hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors duration-300 flex items-center justify-center"
                    >
                      {loading ? (
                        <Loader size="sm" color="yellow" />
                      ) : (
                        "Xác nhận"
                      )}
                    </button>
                  </div>
                </motion.form>
              )}

              {step === 3 && (
                <motion.form
                  key="step3"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleResetPassword}
                >
                  <div className="mb-4">
                    <label
                      htmlFor="newPassword"
                      className="block text-gray-700 text-sm font-medium mb-2"
                    >
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-neutral-500" />
                      </div>
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onFocus={() => setPasswordFocus(true)}
                        onBlur={() => setPasswordFocus(false)}
                        className="w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        placeholder="Nhập mật khẩu mới"
                        required
                      />
                    </div>
                    
                    {/* Password strength indicator */}
                    {(passwordFocus || newPassword) && (
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">Độ mạnh mật khẩu:</span>
                          <span className={`text-xs font-medium ${
                            passwordStrength <= 2 ? 'text-red-500' : 
                            passwordStrength <= 3 ? 'text-yellow-500' : 
                            'text-green-500'
                          }`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          ></div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="flex items-center text-xs">
                            <span className={`mr-1 ${passwordChecks.length ? 'text-green-500' : 'text-red-500'}`}>
                              {passwordChecks.length ? <FaCheck size={12} /> : <FaTimes size={12} />}
                            </span>
                            <span className="text-gray-600">Ít nhất 8 ký tự</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <span className={`mr-1 ${passwordChecks.uppercase ? 'text-green-500' : 'text-red-500'}`}>
                              {passwordChecks.uppercase ? <FaCheck size={12} /> : <FaTimes size={12} />}
                            </span>
                            <span className="text-gray-600">Chữ hoa (A-Z)</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <span className={`mr-1 ${passwordChecks.lowercase ? 'text-green-500' : 'text-red-500'}`}>
                              {passwordChecks.lowercase ? <FaCheck size={12} /> : <FaTimes size={12} />}
                            </span>
                            <span className="text-gray-600">Chữ thường (a-z)</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <span className={`mr-1 ${passwordChecks.number ? 'text-green-500' : 'text-red-500'}`}>
                              {passwordChecks.number ? <FaCheck size={12} /> : <FaTimes size={12} />}
                            </span>
                            <span className="text-gray-600">Số (0-9)</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <span className={`mr-1 ${passwordChecks.special ? 'text-green-500' : 'text-red-500'}`}>
                              {passwordChecks.special ? <FaCheck size={12} /> : <FaTimes size={12} />}
                            </span>
                            <span className="text-gray-600">Ký tự đặc biệt</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-gray-700 text-sm font-medium mb-2"
                    >
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-neutral-500" />
                      </div>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        placeholder="Xác nhận mật khẩu mới"
                        required
                      />
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">Mật khẩu không khớp</p>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-yellow-500 text-white py-3 px-4 rounded-xl hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors duration-300 flex items-center justify-center"
                    >
                      {loading ? (
                        <Loader size="sm" color="yellow" />
                      ) : (
                        "Đặt lại mật khẩu"
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;