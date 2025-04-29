import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaTimes, FaPaperPlane, FaCheck, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config/constants';
import { useSocket } from '../contexts/SocketContext';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { vi } from 'date-fns/locale';

const AnonymousChatModal = ({ blindateId, chatRoomId, onClose, onLocationConfirmed }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmLocation, setConfirmLocation] = useState(false);
  const [customLocation, setCustomLocation] = useState({ name: '', address: '' });
  const messagesEndRef = useRef(null);
  const { socket, connected } = useSocket();

  // Gợi ý câu nói nhanh
  const quickReplies = [
    'Mình thích quán này, bạn thấy sao?',
    'Bạn có thích không gian yên tĩnh không?',
    'Mình muốn đến nơi dễ tìm một chút',
    'Bạn có đề xuất địa điểm nào khác không?',
    'Mình đồng ý với lựa chọn của bạn'
  ];

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get(`${API_URL}/api/chat/negotiation/${chatRoomId}/messages`, config);
        
        // Đảm bảo mỗi tin nhắn đều có timestamp hợp lệ
        const processedMessages = response.data.messages.map(message => ({
          ...message,
          timestamp: message.createdAt || message.timestamp || new Date().toISOString()
        }));
        
        setMessages(processedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Không thể tải tin nhắn');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatRoomId]);

  // Socket connection
  useEffect(() => {
    if (socket && connected) {
      console.log('Socket connected in AnonymousChatModal, joining room:', chatRoomId);
      
      // Join chat room
      try {
        socket.emit('join_chat_room', chatRoomId);
      } catch (error) {
        console.error('Error joining chat room:', error);
      }

      // Listen for new messages
      socket.on('new_message', (message) => {
        // Đảm bảo message có timestamp hợp lệ
        const processedMessage = {
          ...message,
          timestamp: message.createdAt || message.timestamp || new Date().toISOString()
        };
        
        setMessages(prevMessages => [...prevMessages, processedMessage]);
      });

      // Listen for location confirmation
      socket.on('location_confirmed', (data) => {
        toast.success('Địa điểm đã được chốt!');
        if (onLocationConfirmed) {
          onLocationConfirmed(data.location);
        }
      });

      // Cleanup
      return () => {
        try {
          socket.emit('leave_chat_room', chatRoomId);
        } catch (error) {
          console.error('Error leaving chat room:', error);
        }
        socket.off('new_message');
        socket.off('location_confirmed');
      };
    }
  }, [socket, connected, chatRoomId, onLocationConfirmed]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.post(
        `${API_URL}/api/chat/negotiation/${chatRoomId}/send`, 
        { content: newMessage },
        config
      );
      
      // Gửi sự kiện thông báo tin nhắn thương lượng mới
      if (socket && connected) {
        socket.emit('negotiation_message', {
          chatRoomId,
          blindateId,
          message: newMessage
        });
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
    }
  };

  // Handle quick reply
  const handleQuickReply = (reply) => {
    setNewMessage(reply);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format time
  const formatTime = (date) => {
    try {
      if (!date) return 'Vừa xong';
      
      // Kiểm tra xem date có phải là một giá trị hợp lệ không
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Vừa xong';
      }
      
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: vi });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Vừa xong';
    }
  };

  // Confirm final location
  const handleConfirmLocation = async () => {
    if (!customLocation.name || !customLocation.address) {
      toast.warning('Vui lòng nhập đầy đủ thông tin địa điểm');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.post(
        `${API_URL}/api/blindates/${blindateId}/confirm-location`, 
        { location: customLocation },
        config
      );
      
      toast.success('Đã chốt địa điểm thành công!');
      
      // Gửi thông báo qua socket cho người dùng khác
      if (socket && connected) {
        socket.emit('location_confirmed', {
          blindateId,
          chatRoomId,
          location: response.data.location
        });
      }
      
      if (onLocationConfirmed) {
        onLocationConfirmed(response.data.location);
      }
      
      setConfirmLocation(false);
      onClose();
    } catch (error) {
      console.error('Error confirming location:', error);
      toast.error('Không thể chốt địa điểm');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-6 rounded-t-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center">
                <FaComments className="mr-3 text-amber-100" size={24} />
                Chat thương lượng địa điểm
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:text-amber-100 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>
            <p className="text-amber-100 mt-2">
              Hãy thương lượng với đối phương để chọn địa điểm phù hợp
            </p>
          </div>
          
          {confirmLocation ? (
            <div className="p-6 flex-1 overflow-y-auto">
              <h3 className="text-lg font-medium text-amber-800 mb-4">Nhập thông tin địa điểm đã thống nhất:</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-amber-700">Tên địa điểm</label>
                  <input
                    type="text"
                    value={customLocation.name}
                    onChange={(e) => setCustomLocation({ ...customLocation, name: e.target.value })}
                    placeholder="Nhập tên địa điểm"
                    className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-amber-700">Địa chỉ</label>
                  <input
                    type="text"
                    value={customLocation.address}
                    onChange={(e) => setCustomLocation({ ...customLocation, address: e.target.value })}
                    placeholder="Nhập địa chỉ"
                    className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setConfirmLocation(false)}
                    className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleConfirmLocation}
                    className="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center"
                  >
                    <FaCheck className="mr-2" />
                    Xác nhận địa điểm
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Messages area */}
              <div className="p-4 flex-1 overflow-y-auto bg-amber-50">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-amber-700 py-8">
                    <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <div
                        key={message.id || index}
                        className={`flex ${message.isSender ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.isSystemMessage
                              ? 'bg-gray-200 text-gray-700 mx-auto'
                              : message.isSender
                              ? 'bg-amber-600 text-white'
                              : 'bg-white text-amber-900 border border-amber-200'
                          }`}
                        >
                          {!message.isSystemMessage && (
                            <div className="font-medium text-sm mb-1">
                              {message.sender}
                            </div>
                          )}
                          <div className={message.isSystemMessage ? 'text-center italic' : ''}>
                            {message.content}
                          </div>
                          <div className={`text-xs mt-1 ${message.isSender ? 'text-amber-100' : 'text-amber-500'}`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Quick replies */}
              <div className="px-4 py-2 bg-amber-100 overflow-x-auto">
                <div className="flex space-x-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="whitespace-nowrap px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-800 rounded-full text-sm"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Input area */}
              <div className="p-4 border-t border-amber-200 bg-white">
                <div className="flex items-center">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    rows="2"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className={`ml-2 p-3 rounded-full ${
                      !newMessage.trim()
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-amber-600 text-white hover:bg-amber-700'
                    }`}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
                
                <div className="mt-3 flex justify-start">
                  <button
                    onClick={() => setConfirmLocation(true)}
                    className="flex items-center py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    <FaMapMarkerAlt className="mr-2" />
                    Chốt địa điểm này
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AnonymousChatModal;