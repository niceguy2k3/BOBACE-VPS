import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';
import ChatMessageToast from '../components/ChatMessageToast';

// Cấu hình mặc định cho tất cả các toast
const defaultOptions = {
  position: "top-center",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
  closeButton: false,   
  transition: toast.Flip,
  style: {
    background: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
    borderRadius: '16px',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    padding: '12px 20px',
    fontFamily: '"Poppins", sans-serif',
    fontSize: '15px',
    fontWeight: '500',
    color: '#333',
    backdropFilter: 'blur(10px)',
    transform: 'translateY(0)',
    transition: 'all 0.3s ease',
  },
};

// Các hàm helper để hiển thị toast với cấu hình nhất quán
export const showSuccessToast = (message, options = {}) => {
  return toast.success(message, {
    ...defaultOptions,
    ...options,
    transition: toast.Flip
  });
};

export const showErrorToast = (message, options = {}) => {
  return toast.error(message, {
    ...defaultOptions,
    ...options,
    transition: toast.Bounce
  });
};

export const showInfoToast = (message, options = {}) => {
  return toast.info(message, {
    ...defaultOptions,
    ...options,
    transition: toast.Slide
  });
};

export const showWarningToast = (message, options = {}) => {
  return toast.warning(message, {
    ...defaultOptions,
    ...options,
    transition: toast.Zoom
  });
};

// Hàm để đóng một toast cụ thể
export const closeToast = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  }
};

// Hàm để đóng tất cả các toast
export const closeAllToasts = () => {
  toast.dismiss();
};

// Hàm để đảm bảo tất cả các toast đều tự động đóng
export const ensureToastCloses = (toastId, timeout = 3000) => {
  if (toastId) {
    setTimeout(() => {
      toast.dismiss(toastId);
    }, timeout);
  }
};

// Hàm hiển thị thông báo tin nhắn với avatar
export const showMessageNotification = (sender, avatar, message, options = {}) => {
  // Kiểm tra xem có phải là thông báo ở giữa màn hình không
  const isCentered = options.className && options.className.includes('centered-message-notification');
  
  return toast(
    <ChatMessageToast 
      sender={sender} 
      avatar={avatar} 
      message={message}
      isCentered={isCentered}
    />, 
    {
      ...defaultOptions,
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
      className: "message-notification-toast",
      bodyClassName: "message-notification-body",
      ...options,
      transition: isCentered ? toast.Zoom : toast.Slide
    }
  );
};

// Hàm tổng hợp để hiển thị toast với loại tùy chọn
export const showToast = (type, message, options = {}) => {
  switch (type) {
    case 'success':
      return showSuccessToast(message, options);
    case 'error':
      return showErrorToast(message, options);
    case 'info':
      return showInfoToast(message, options);
    case 'warning':
      return showWarningToast(message, options);
    case 'message':
      // Kiểm tra xem message có phải là object với các thuộc tính cần thiết không
      if (typeof message === 'object' && message.sender && message.content) {
        return showMessageNotification(message.sender, message.avatar, message.content, options);
      }
      return toast(message, {
        ...defaultOptions,
        ...options,
        transition: toast.Flip
      });
    default:
      return toast(message, {
        ...defaultOptions,
        ...options,
        transition: toast.Flip
      });
  }
};