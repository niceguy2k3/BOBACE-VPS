import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../config/constants';
import { showToast } from '../utils/toastHelper';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const { currentUser } = useAuth();

  // Hàm để khởi tạo kết nối socket
  const initializeSocket = useCallback(() => {
    if (!currentUser) return null;
    
    const token = localStorage.getItem('token');
    
    // Initialize socket connection with optimized config
    const socketInstance = io(SOCKET_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'], // Sử dụng cả websocket và polling để tăng khả năng kết nối
      reconnectionAttempts: 10,   // Tăng số lần thử kết nối lại
      reconnectionDelay: 1000,   // Thời gian giữa các lần thử kết nối lại (ms)
      timeout: 20000,            // Tăng thời gian timeout kết nối (ms)
      autoConnect: true,         // Tự động kết nối
      forceNew: true             // Tạo kết nối mới mỗi lần
    });
    
    // Set up event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      
      // Join user's personal room for notifications
      if (currentUser._id) {
        socketInstance.emit('joinUser', currentUser._id);
      }
    });
    
    return socketInstance;
  }, [currentUser]);

  // Lắng nghe sự kiện thay đổi quyền thông báo
  useEffect(() => {
    const handlePermissionChange = () => {
      // Nếu đã có kết nối socket, ngắt kết nối và kết nối lại
      if (socket) {
        socket.disconnect();
        const newSocket = initializeSocket();
        if (newSocket) setSocket(newSocket);
      }
    };
    
    window.addEventListener('notificationPermissionChanged', handlePermissionChange);
    
    return () => {
      window.removeEventListener('notificationPermissionChanged', handlePermissionChange);
    };
  }, [socket, initializeSocket]);

  useEffect(() => {
    // Only connect to socket if user is logged in
    if (currentUser) {
      const socketInstance = initializeSocket();
      
      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setConnected(false);
        
        // Tự động kết nối lại nếu bị ngắt kết nối do lỗi mạng
        if (reason === 'io server disconnect' || reason === 'transport close') {
          // Đợi 1 giây trước khi thử kết nối lại
          setTimeout(() => {
            socketInstance.connect();
          }, 1000);
        }
      });
      
      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
      });
      
      // Thêm sự kiện reconnect để cập nhật trạng thái
      socketInstance.on('reconnect', (attemptNumber) => {
        console.log(`Socket reconnected after ${attemptNumber} attempts`);
      });
      
      // Biến để theo dõi thời gian thông báo cuối cùng
      let lastNotificationTime = 0;
      const NOTIFICATION_THROTTLE = 1000; // Giới hạn 1 thông báo mỗi giây
      
      // Hàm tối ưu để hiển thị thông báo
      const showOptimizedNotification = (data) => {
        const now = Date.now();
        
        // Kiểm tra xem người dùng có đang ở trang chat với người gửi không
        const currentPath = window.location.pathname;
        const isChatting = currentPath.includes(`/chat/${data.matchId}`);
        
        // Lấy thông tin người gửi
        let senderName = '';
        let senderAvatar = '/logo192.png';
        let messageContent = 'Đã gửi một tin nhắn mới';
        
        // Xử lý các định dạng dữ liệu khác nhau
        if (data.senderDetails && data.senderDetails.fullName) {
          senderName = data.senderDetails.fullName;
          senderAvatar = data.senderDetails.avatar || '/logo192.png';
        } else if (data.message && data.message.sender && typeof data.message.sender === 'object') {
          senderName = data.message.sender.fullName || '';
          senderAvatar = data.message.sender.avatar || '/logo192.png';
        }
        
        // Đảm bảo luôn có tên người gửi
        if (!senderName) {
          // Lấy tên từ matchId nếu có
          if (data.matchId) {
            // Tìm thông tin match từ localStorage nếu có
            try {
              const matchesData = localStorage.getItem('matches');
              if (matchesData) {
                const matches = JSON.parse(matchesData);
                const match = matches.find(m => m._id === data.matchId);
                if (match && match.user && match.user.fullName) {
                  senderName = match.user.fullName;
                }
              }
            } catch (e) {
              console.error('Lỗi khi đọc thông tin match:', e);
            }
          }
          
          // Nếu vẫn không có tên, sử dụng tên người gửi
          if (!senderName) {
            // Kiểm tra nếu data.sender là object
            if (data.sender && typeof data.sender === 'object') {
              senderName = data.sender.fullName || data.sender.name || data.sender.username || 'Người gửi';
            } else {
              senderName = data.sender || data.senderId || 'Người gửi';
            }
            
            // Kiểm tra nếu data.message.sender là object
            if (!senderName || senderName === 'Người gửi') {
              if (data.message && data.message.sender) {
                if (typeof data.message.sender === 'object') {
                  senderName = data.message.sender.fullName || data.message.sender.name || data.message.sender.username || 'Người gửi';
                } else {
                  senderName = data.message.sender;
                }
              }
            }
            
            // Đảm bảo senderName là string
            if (typeof senderName !== 'string') {
              senderName = 'Người gửi';
            }
          }
        }
        
        if (data.content) {
          messageContent = data.content;
        } else if (data.message && data.message.content) {
          messageContent = data.message.content;
        } else if (data.imageUrl || (data.message && data.message.imageUrl)) {
          messageContent = 'Đã gửi một hình ảnh';
        }
        
        // Chỉ hiển thị thông báo nếu người dùng không đang chat với người gửi
        // và đã qua thời gian giới hạn từ thông báo trước
        if (!isChatting && (now - lastNotificationTime > NOTIFICATION_THROTTLE)) {
          lastNotificationTime = now;
          
          // Phát âm thanh thông báo - sử dụng preloaded audio để tránh tải lại
          if (window.notificationSound) {
            window.notificationSound.play().catch(e => {
              console.log('Không thể phát âm thanh thông báo:', e);
            });
          }
          
          // Hiển thị thông báo trên trình duyệt
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              const notification = new Notification(`Tin nhắn mới từ ${senderName}`, {
                body: messageContent,
                icon: senderAvatar,
                tag: `message-${data.matchId}`, // Tránh hiển thị nhiều thông báo từ cùng một người
                requireInteraction: false, // Thông báo sẽ tự động biến mất sau một thời gian
                silent: true // Tắt âm thanh mặc định của trình duyệt, sử dụng âm thanh tùy chỉnh
              });
              
              notification.onclick = function() {
                window.focus();
                window.location.href = `/chat/${data.matchId}`;
                this.close();
              };
            } catch (error) {
              // Hiển thị toast thay thế với kiểu tùy chỉnh
              const toastId = `message-${Date.now()}-${Math.random()}`;
              showToast('info', 
                <div className="toast-message-notification">
                  <img src={senderAvatar} alt={senderName} className="sender-avatar" />
                  <div className="message-content">
                    <div className="sender-name">{senderName}</div>
                    <div className="message-text">{messageContent}</div>
                  </div>
                </div>,
                {
                  hideProgressBar: false,
                  className: 'toast-message-custom',
                  progress: undefined,
                  toastId
                }
              );
            }
          } else {
            // Hiển thị toast thay thế với kiểu tùy chỉnh
            const toastId = `message-${Date.now()}-${Math.random()}`;
            showToast('info', 
              <div className="toast-message-notification">
                <img src={senderAvatar} alt={senderName} className="sender-avatar" />
                <div className="message-content">
                  <div className="sender-name">{senderName}</div>
                  <div className="message-text">{messageContent}</div>
                </div>
              </div>,
              {
                hideProgressBar: false,
                className: 'toast-message-custom',
                progress: undefined,
                toastId
              }
            );
          }
        }
      };
      
      // Preload notification sound
      if ('Audio' in window) {
        window.notificationSound = new Audio('/notification.mp3');
        window.notificationSound.load();
      }
      
      // Xử lý tin nhắn mới và cập nhật thông tin người gửi
      socketInstance.on('newMessage', (data) => {
        // Lưu thông tin người gửi vào localStorage nếu có
        if (data.matchId && data.senderDetails) {
          try {
            // Lấy danh sách matches từ localStorage
            const matchesData = localStorage.getItem('matches');
            if (matchesData) {
              const matches = JSON.parse(matchesData);
              
              // Kiểm tra xem match đã tồn tại chưa
              const matchIndex = matches.findIndex(m => m._id === data.matchId);
              
              if (matchIndex >= 0) {
                // Cập nhật thông tin người dùng trong match
                if (!matches[matchIndex].user || !matches[matchIndex].user.fullName) {
                  matches[matchIndex].user = {
                    ...matches[matchIndex].user,
                    fullName: data.senderDetails.fullName,
                    avatar: data.senderDetails.avatar
                  };
                  // Lưu lại vào localStorage
                  localStorage.setItem('matches', JSON.stringify(matches));
                }
              } else {
                // Thêm match mới vào danh sách
                matches.push({
                  _id: data.matchId,
                  user: {
                    fullName: data.senderDetails.fullName,
                    avatar: data.senderDetails.avatar
                  }
                });
                // Lưu lại vào localStorage
                localStorage.setItem('matches', JSON.stringify(matches));
              }
            } else {
              // Tạo mới danh sách matches
              const newMatches = [{
                _id: data.matchId,
                user: {
                  fullName: data.senderDetails.fullName,
                  avatar: data.senderDetails.avatar
                }
              }];
              // Lưu vào localStorage
              localStorage.setItem('matches', JSON.stringify(newMatches));
            }
          } catch (e) {
            console.error('Lỗi khi cập nhật thông tin match:', e);
          }
        }
        
        // Hiển thị thông báo
        showOptimizedNotification(data);
      });
      
      // Xử lý thông báo lời mời hẹn hò mới
      socketInstance.on('newBlindateInvitation', (data) => {
        const { sender, blindateId } = data;
        const senderName = sender?.fullName || 'Một người dùng';
        const senderAvatar = sender?.avatar || '/logo192.png';
        
        // Hiển thị thông báo
        showToast('info', 
          <div className="toast-blindate-notification">
            <img src={senderAvatar} alt={senderName} className="sender-avatar" />
            <div className="notification-content">
              <div className="notification-title">Lời mời hẹn hò mới</div>
              <div className="notification-text">{senderName} đã gửi cho bạn lời mời Blind date!</div>
            </div>
          </div>,
          {
            autoClose: 5000,
            className: 'toast-blindate-custom',
            onClick: () => {
              window.location.href = '/blindate';
            }
          }
        );
        
        // Phát âm thanh thông báo
        if (window.notificationSound) {
          window.notificationSound.play().catch(e => {
            console.log('Không thể phát âm thanh thông báo:', e);
          });
        }
      });
      
      // Xử lý thông báo chấp nhận lời mời hẹn hò
      socketInstance.on('blindateAccepted', (data) => {
        const { partner, blindateId } = data;
        const partnerName = partner?.fullName || 'Một người dùng';
        const partnerAvatar = partner?.avatar || '/logo192.png';
        
        // Hiển thị thông báo
        showToast('success', 
          <div className="toast-blindate-notification">
            <img src={partnerAvatar} alt={partnerName} className="sender-avatar" />
            <div className="notification-content">
              <div className="notification-title">Lời mời hẹn hò được chấp nhận</div>
              <div className="notification-text">{partnerName} đã chấp nhận lời mời hẹn hò của bạn!</div>
            </div>
          </div>,
          {
            autoClose: 5000,
            className: 'toast-blindate-custom',
            onClick: () => {
              window.location.href = '/blindate';
            }
          }
        );
        
        // Phát âm thanh thông báo
        if (window.notificationSound) {
          window.notificationSound.play().catch(e => {
            console.log('Không thể phát âm thanh thông báo:', e);
          });
        }
      });
      
      // Xử lý thông báo từ chối lời mời hẹn hò
      socketInstance.on('blindateRejected', (data) => {
        const { partner, blindateId } = data;
        const partnerName = partner?.fullName || 'Một người dùng';
        const partnerAvatar = partner?.avatar || '/logo192.png';
        
        // Hiển thị thông báo
        showToast('warning', 
          <div className="toast-blindate-notification">
            <img src={partnerAvatar} alt={partnerName} className="sender-avatar" />
            <div className="notification-content">
              <div className="notification-title">Lời mời hẹn hò bị từ chối</div>
              <div className="notification-text">{partnerName} đã từ chối lời mời hẹn hò của bạn.</div>
            </div>
          </div>,
          {
            autoClose: 5000,
            className: 'toast-blindate-custom'
          }
        );
      });
      
      // Xử lý thông báo tin nhắn thương lượng địa điểm
      socketInstance.on('negotiation_message', (data) => {
        // Kiểm tra xem người dùng có đang mở chat thương lượng không
        const isChatOpen = window.location.pathname.includes('/blindate') && 
                          document.querySelector('.anonymous-chat-modal');
        
        if (!isChatOpen && data.message) {
          const senderName = "Đối phương";
          
          // Hiển thị thông báo
          showToast('info', 
            <div className="toast-blindate-notification">
              <div className="notification-content">
                <div className="notification-title">Tin nhắn thương lượng mới</div>
                <div className="notification-text">{senderName} đã gửi tin nhắn thương lượng địa điểm</div>
              </div>
            </div>,
            {
              autoClose: 5000,
              className: 'toast-blindate-custom',
              onClick: () => {
                // Chuyển đến trang blindate
                if (!window.location.pathname.includes('/blindate')) {
                  window.location.href = '/blindate';
                }
              }
            }
          );
          
          // Phát âm thanh thông báo
          if (window.notificationSound) {
            window.notificationSound.play().catch(e => {
              console.log('Không thể phát âm thanh thông báo:', e);
            });
          }
        }
      });
      
      // Xử lý thông báo khi địa điểm được xác nhận
      socketInstance.on('location_confirmed', (data) => {
        // Kiểm tra xem người dùng có đang mở chat thương lượng không
        const isChatOpen = window.location.pathname.includes('/blindate') && 
                          document.querySelector('.anonymous-chat-modal');
        
        if (!isChatOpen && data.location) {
          // Hiển thị thông báo
          showToast('success', 
            <div className="toast-blindate-notification">
              <div className="notification-content">
                <div className="notification-title">Địa điểm đã được xác nhận</div>
                <div className="notification-text">
                  <strong>{data.location.name}</strong><br/>
                  {data.location.address}
                </div>
              </div>
            </div>,
            {
              autoClose: 7000,
              className: 'toast-blindate-custom',
              onClick: () => {
                // Chuyển đến trang blindate
                if (!window.location.pathname.includes('/blindate')) {
                  window.location.href = '/blindate';
                }
              }
            }
          );
          
          // Phát âm thanh thông báo
          if (window.notificationSound) {
            window.notificationSound.play().catch(e => {
              console.log('Không thể phát âm thanh thông báo:', e);
            });
          }
        }
      });
      
      // Save socket instance
      setSocket(socketInstance);
      
      // Clean up on unmount
      return () => {
        if (socketInstance) {
          // Xóa tất cả các event listener trước khi ngắt kết nối
          socketInstance.off('connect');
          socketInstance.off('disconnect');
          socketInstance.off('error');
          socketInstance.off('reconnect');
          socketInstance.off('newMessage');
          socketInstance.off('newBlindateInvitation');
          socketInstance.off('blindateAccepted');
          socketInstance.off('blindateRejected');
          
          // Ngắt kết nối
          socketInstance.disconnect();
        }
      };
    } else {
      // Disconnect if user logs out
      if (socket) {
        // Xóa tất cả các event listener trước khi ngắt kết nối
        socket.off('connect');
        socket.off('disconnect');
        socket.off('error');
        socket.off('reconnect');
        socket.off('newMessage');
        socket.off('newBlindateInvitation');
        socket.off('blindateAccepted');
        socket.off('blindateRejected');
        
        // Ngắt kết nối
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [currentUser]);

  // Join a chat room
  const joinRoom = (matchId) => {
    if (socket && connected) {
      socket.emit('join', matchId);
    }
  };

  // Send a message
  const sendMessage = (messageData) => {
    if (socket && connected) {
      console.log('Sending message via socket:', messageData);
      
      // Gửi tin nhắn qua socket - chỉ sử dụng một sự kiện để tránh tin nhắn trùng lặp
      socket.emit('message', messageData);
      
      return true;
    }
    return false;
  };

  // Send typing indicator
  const sendTyping = (data) => {
    if (socket && connected) {
      socket.emit('typing', data);
    }
  };

  const value = {
    socket,
    connected,
    joinRoom,
    sendMessage,
    sendTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};