import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { showInfoToast, showErrorToast, showWarningToast, ensureToastCloses, showMessageNotification } from '../utils/toastHelper';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaArrowLeft, FaEllipsisV, FaHeart, FaSmile, FaInfoCircle, FaChevronLeft, FaChevronRight, FaUserCheck } from 'react-icons/fa';
import { API_URL } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Loader from '../components/Loader';

const Chat = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { currentUser, blockUser } = useAuth();
  const { socket, connected, joinRoom, sendMessage } = useSocket();
  
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [partner, setPartner] = useState(null);
  const [typing, setTyping] = useState(false);
  const [showUnmatchModal, setShowUnmatchModal] = useState(false);
  const [unmatchLoading, setUnmatchLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [blockingLoading, setBlockingLoading] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const partnerRef = useRef(null);
  
  // Fetch match and messages data
  useEffect(() => {
    // Đặt một timeout để đảm bảo loading state không bị kẹt mãi
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout triggered - forcing loading state to false');
        setLoading(false);
        // Hiển thị thông báo cho người dùng
        showInfoToast('Đã tải một phần dữ liệu. Một số thông tin có thể không đầy đủ.');
      }
    }, 20000); // Tăng lên 20 giây timeout
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No authentication token found');
          showErrorToast('Vui lòng đăng nhập lại');
          navigate('/login');
          return;
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Fetch match details
        console.log('Fetching match details for matchId:', matchId);
        let matchData;
        try {
          // Tạo một promise với timeout
          const fetchMatchWithTimeout = async () => {
            try {
              console.log('Fetching match details for matchId:', matchId);
              const matchResponse = await axios.get(
                `${API_URL}/api/matches/${matchId}`, 
                config
              );
              return matchResponse;
            } catch (error) {
              console.log('Error fetching match details:', error.message);
              throw error;
            }
          };
          
          // Thực hiện fetch với timeout
          const matchResponse = await fetchMatchWithTimeout();
          
          console.log('Match response:', matchResponse.data);
          matchData = matchResponse.data;
          setMatch(matchData);
        } catch (error) {
          console.error('Error fetching match details:', error.response || error);
          
          // Thử lại với URL thay thế nếu bị timeout
          if (error.name === 'AbortError' || error.name === 'CanceledError') {
            console.log('Match fetch request timed out - trying alternative URL');
            showWarningToast('Đang thử lại kết nối...');
            
            try {
              // Thử với URL thay thế
              const alternativeResponse = await axios.get(
                `${API_URL}/api/matches/detail/${matchId}`, 
                {
                  ...config,
                  params: { _t: new Date().getTime() }
                }
              );
              
              console.log('Match alternative response:', alternativeResponse.data);
              matchData = alternativeResponse.data;
              setMatch(matchData);
            } catch (altError) {
              console.error('Alternative URL failed, trying one more time with original URL');
              
              try {
                // Thử lại một lần nữa với URL gốc
                const retryResponse = await axios.get(
                  `${API_URL}/api/matches/${matchId}`, 
                  {
                    ...config,
                    params: { _t: new Date().getTime(), skipCache: true }
                  }
                );
                
                console.log('Match retry response:', retryResponse.data);
                matchData = retryResponse.data;
                setMatch(matchData);
              } catch (retryError) {
                console.error('Error on retry fetching match:', retryError);
                
                // Tạo một match object tạm thời để tiếp tục
                const tempMatch = {
                  _id: matchId,
                  users: [currentUser._id, { _id: 'unknown' }],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                
                console.log('Using temporary match data:', tempMatch);
                matchData = tempMatch;
                setMatch(tempMatch);
                
                showWarningToast('Đang sử dụng dữ liệu tạm thời, một số tính năng có thể bị hạn chế');
              }
            }
          } else {
            console.error('Non-timeout error, trying to create temporary match data');
            
            // Tạo một match object tạm thời để tiếp tục
            const tempMatch = {
              _id: matchId,
              users: [currentUser._id, { _id: 'unknown' }],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            console.log('Using temporary match data:', tempMatch);
            matchData = tempMatch;
            setMatch(tempMatch);
            
            showWarningToast('Không thể kết nối đến máy chủ, đang sử dụng dữ liệu tạm thời');
          }
        }
        
        // Determine chat partner
        if (!matchData.users || !Array.isArray(matchData.users)) {
          console.error('Invalid match data - users array missing:', matchData);
          showErrorToast('Dữ liệu match không hợp lệ');
          setLoading(false);
          navigate('/matches');
          return;
        }
        
        console.log('Match users:', matchData.users, 'Current user ID:', currentUser._id);
        const partnerId = matchData.users.find(
          user => {
            // Kiểm tra nếu user là object hay string ID
            const userId = typeof user === 'object' ? user._id : user;
            return userId.toString() !== currentUser._id.toString();
          }
        );
        
        // Xác định partnerId dựa trên kiểu dữ liệu trả về
        const partnerIdValue = typeof partnerId === 'object' ? partnerId._id : partnerId;
        
        if (!partnerIdValue) {
          console.error('Could not determine partner ID from:', matchData.users);
          showErrorToast('Không thể xác định người trò chuyện');
          setLoading(false);
          navigate('/matches');
          return;
        }
        
        console.log('Determined partner ID:', partnerIdValue);
        
        // Fetch partner details
        let partnerData;
        try {
          console.log('Fetching partner details for ID:', partnerIdValue);
          
          // Tạo một promise với timeout
          const fetchPartnerWithTimeout = async () => {
            try {
              console.log('Fetching partner details for ID:', partnerIdValue);
              const partnerResponse = await axios.get(
                `${API_URL}/api/users/${partnerIdValue}`, 
                config
              );
              return partnerResponse;
            } catch (error) {
              console.log('Error fetching partner details:', error.message);
              throw error;
            }
          };
          
          // Thực hiện fetch với timeout
          const partnerResponse = await fetchPartnerWithTimeout();
          
          console.log('Partner response:', partnerResponse.data);
          partnerData = partnerResponse.data;
          setPartner(partnerData);
        } catch (error) {
          console.error('Error fetching partner details:', error.response || error);
          
          // Kiểm tra xem có thể lấy thông tin từ match data không
          let partnerInfo = null;
          if (matchData && matchData.users) {
            // Tìm thông tin người dùng trong match data nếu có
            const partnerUser = matchData.users.find(user => {
              if (typeof user === 'object' && user._id) {
                return user._id.toString() !== currentUser._id.toString();
              }
              return false;
            });
            
            if (partnerUser && typeof partnerUser === 'object') {
              partnerInfo = partnerUser;
              console.log('Found partner info in match data:', partnerInfo);
            }
          }
          
          // Thử lại một lần cuối với URL khác nếu bị timeout
          if (error.name === 'AbortError' || error.name === 'CanceledError') {
            console.log('Partner fetch request timed out, trying alternative URL...');
            
            try {
              // Thử với URL thay thế
              const alternativeResponse = await axios.get(
                `${API_URL}/api/users/profile/${partnerIdValue}`, 
                config
              );
              
              if (alternativeResponse.data) {
                console.log('Successfully fetched partner from alternative URL:', alternativeResponse.data);
                partnerData = alternativeResponse.data;
                setPartner(partnerData);
                return; // Thoát khỏi catch block nếu thành công
              }
            } catch (altError) {
              console.error('Alternative URL also failed:', altError);
            }
            
            showWarningToast('Đang tải thông tin tạm thời cho người trò chuyện');
          } else {
            showWarningToast('Không thể kết nối đến máy chủ, đang sử dụng thông tin tạm thời');
          }
          
          // Tạo một partner object với thông tin từ match data hoặc thông tin tối thiểu
          const tempPartner = {
            _id: partnerIdValue,
            fullName: partnerInfo && partnerInfo.fullName ? partnerInfo.fullName : 'Người dùng',
            avatar: partnerInfo && partnerInfo.avatar ? partnerInfo.avatar : null,
            online: false
          };
          console.log('Using temporary partner data:', tempPartner);
          setPartner(tempPartner);
        }
        
        // Fetch messages with skipCache parameter to get fresh data
        console.log('Fetching messages for matchId:', matchId);
        let messagesData = [];
        
        try {
          // Tạo một promise với timeout
          const fetchMessagesWithTimeout = async () => {
            try {
              console.log('Fetching messages for matchId:', matchId);
              
              // Thử cả hai endpoint có thể có
              let messagesResponse;
              try {
                // Thử endpoint thứ nhất
                messagesResponse = await axios.get(
                  `${API_URL}/api/matches/${matchId}/messages`, 
                  config
                );
              } catch (error) {
                if (error.response && error.response.status === 404) {
                  console.log('Trying alternative message endpoint...');
                  // Thử endpoint thứ hai
                  messagesResponse = await axios.get(
                    `${API_URL}/api/messages/match/${matchId}`, 
                    config
                  );
                } else {
                  throw error;
                }
              }
              
              return messagesResponse;
            } catch (error) {
              console.log('Error fetching messages:', error.message);
              throw error;
            }
          };
          
          // Thực hiện fetch với timeout
          const messagesResponse = await fetchMessagesWithTimeout();
          
          console.log('Messages response:', messagesResponse.data);
          
          // Kiểm tra xem dữ liệu trả về có đúng định dạng không
          if (messagesResponse.data && messagesResponse.data.messages && Array.isArray(messagesResponse.data.messages)) {
            messagesData = messagesResponse.data.messages;
          } else if (messagesResponse.data && Array.isArray(messagesResponse.data)) {
            messagesData = messagesResponse.data;
          } else if (messagesResponse.data && typeof messagesResponse.data === 'object') {
            // Nếu là object nhưng không có messages array, thử lấy giá trị đầu tiên
            const possibleMessages = Object.values(messagesResponse.data).find(val => Array.isArray(val));
            if (possibleMessages) {
              messagesData = possibleMessages;
            } else {
              console.error('Unexpected message data format:', messagesResponse.data);
            }
          } else {
            console.error('Unexpected message data format:', messagesResponse.data);
          }
        } catch (error) {
          console.error('Error fetching messages:', error.response || error);
          
          // Tạo mảng tin nhắn trống nếu chưa có
          if (!messagesData) {
            messagesData = [];
          }
          
          if (error.name === 'AbortError' || error.name === 'CanceledError') {
            console.log('Messages fetch request timed out, trying alternative approach');
            
            // Thử ngay lập tức với một cách tiếp cận khác
            try {
              // Thử với URL thay thế và tham số khác
              const alternativeResponse = await axios.get(
                `${API_URL}/api/messages/conversation/${matchId}`, 
                {
                  ...config,
                  params: { 
                    limit: 50,
                    _t: new Date().getTime() 
                  }
                }
              );
              
              if (alternativeResponse.data) {
                let newMessages = [];
                if (alternativeResponse.data.messages && Array.isArray(alternativeResponse.data.messages)) {
                  newMessages = alternativeResponse.data.messages;
                } else if (Array.isArray(alternativeResponse.data)) {
                  newMessages = alternativeResponse.data;
                }
                
                if (newMessages.length > 0) {
                  console.log('Successfully fetched messages from alternative URL:', newMessages.length);
                  messagesData = newMessages;
                  setMessages(newMessages);
                  // Không hiển thị toast để tránh quá nhiều thông báo
                }
              }
            } catch (altError) {
              console.error('Alternative message fetch also failed:', altError);
              showWarningToast('Không thể tải tin nhắn cũ - bạn vẫn có thể gửi tin nhắn mới');
            }
          } else {
            showWarningToast('Không thể tải tin nhắn cũ - bạn vẫn có thể gửi tin nhắn mới');
          }
          
          // Thử lại sau 3 giây nếu không có tin nhắn nào
          if (messagesData.length === 0) {
            setTimeout(() => {
              console.log('Retrying to fetch messages after timeout...');
              // Thử lại việc tải tin nhắn một lần nữa
              const retryFetchMessages = async () => {
                try {
                  const token = localStorage.getItem('token');
                  if (!token) return;
                  
                  const config = {
                    headers: {
                      Authorization: `Bearer ${token}`
                    },
                    params: {
                      skipCache: true,
                      _t: new Date().getTime()
                    }
                  };
                  
                  // Thử với URL đơn giản nhất
                  const messagesResponse = await axios.get(
                    `${API_URL}/api/messages/match/${matchId}`, 
                    config
                  );
                  
                  if (messagesResponse.data) {
                    let newMessages = [];
                    if (messagesResponse.data.messages && Array.isArray(messagesResponse.data.messages)) {
                      newMessages = messagesResponse.data.messages;
                    } else if (Array.isArray(messagesResponse.data)) {
                      newMessages = messagesResponse.data;
                    }
                    
                    if (newMessages.length > 0) {
                      console.log('Successfully fetched messages on retry:', newMessages.length);
                      setMessages(newMessages);
                      // Không hiển thị toast để tránh quá nhiều thông báo
                    }
                  }
                } catch (retryError) {
                  console.error('Error on retry fetching messages:', retryError);
                  // Không hiển thị thêm thông báo lỗi
                }
              };
              
              retryFetchMessages();
            }, 3000); // Giảm xuống 3 giây
          }
          
          // Vẫn tiếp tục để hiển thị giao diện chat
        }
        
        console.log('Setting messages:', messagesData);
        setMessages(messagesData);
        
        // Đảm bảo loading state được tắt
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chat data:', error);
        showErrorToast('Không thể tải dữ liệu chat');
        setLoading(false);
        navigate('/matches');
      }
    };
    
    console.log('Chat useEffect - currentUser:', currentUser ? 'exists' : 'null', 'matchId:', matchId);
    
    if (currentUser && matchId) {
      console.log('Chat useEffect - Starting fetchData()');
      fetchData();
    } else if (!currentUser) {
      console.log('Chat useEffect - No currentUser, redirecting to login');
      setLoading(false);
      navigate('/login');
    } else {
      console.log('Chat useEffect - No matchId, setting loading to false');
      setLoading(false);
    }
    
    // Cleanup function để clear timeout
    return () => {
      clearTimeout(loadingTimeout);
    };
  }, [matchId, currentUser, navigate]);
  
  // Join socket room when connected
  useEffect(() => {
    if (connected && matchId) {
      joinRoom(matchId);
    }
  }, [connected, matchId, joinRoom]);
  
  // Định nghĩa hàm markMessageAsRead trước khi sử dụng trong useEffect
  const markMessageAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.put(`${API_URL}/api/messages/${messageId}/read`, {}, config);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Listen for new messages
  useEffect(() => {
    if (socket) {
      const messageHandler = (data) => {
        console.log('Received message via socket:', data);
        
        if (data.matchId === matchId) {
          // Chỉ thêm tin nhắn nếu nó không có trong danh sách tin nhắn hiện tại
          setMessages(prev => {
            // Kiểm tra xem tin nhắn đã tồn tại chưa - kiểm tra kỹ hơn để tránh trùng lặp
            const messageExists = prev.some(msg => {
              // Kiểm tra theo ID
              if (data._id && msg._id === data._id) return true;
              
              // Kiểm tra theo ID của message object
              if (data.message && data.message._id && msg._id === data.message._id) return true;
              
              // Kiểm tra theo nội dung, người gửi và thời gian
              if (msg.content === (data.content || (data.message ? data.message.content : null)) && 
                  msg.sender === (data.sender || (data.message ? data.message.sender : null)) && 
                  Math.abs(new Date(msg.createdAt) - new Date(data.createdAt || (data.message ? data.message.createdAt : new Date()))) < 10000) {
                return true;
              }
              
              // Kiểm tra tin nhắn tạm thời
              if (msg._id.startsWith('temp-') && 
                  msg.content === (data.content || (data.message ? data.message.content : null)) && 
                  msg.sender === (data.sender || (data.message ? data.message.sender : null))) {
                return true;
              }
              
              return false;
            });
            
            if (!messageExists) {
              // Nếu data là object tin nhắn hoàn chỉnh
              if (data._id) {
                // Tạo một tin nhắn đầy đủ từ dữ liệu nhận được
                const newMessage = {
                  _id: data._id,
                  content: data.content || (data.message ? data.message.content : "Tin nhắn mới"),
                  sender: data.sender || (data.message ? data.message.sender : null),
                  matchId: data.matchId,
                  createdAt: data.createdAt || (data.message ? data.message.createdAt : new Date().toISOString()),
                  readBy: data.readBy || (data.message ? data.message.readBy : [])
                };
                console.log('Adding new message to state:', newMessage);
                return [...prev, newMessage];
              } 
              // Nếu data là object có chứa message
              else if (data.message && data.message._id) {
                console.log('Adding message from message object:', data.message);
                return [...prev, data.message];
              }
              // Trường hợp khác
              else {
                console.log('Received message in unexpected format:', data);
                return prev;
              }
            }
            return prev;
          });
          
          // Mark as read if from partner
          if (data.sender !== currentUser._id && data._id) {
            markMessageAsRead(data._id);
          } else if (data.message && data.message.sender !== currentUser._id && data.message._id) {
            markMessageAsRead(data.message._id);
          }
        }
      };
      
      const newMessageHandler = (data) => {
        console.log('Received newMessage via socket (ignored):', data);
        // Không xử lý tin nhắn ở đây nữa để tránh trùng lặp
      };  // Chỉ một dấu chấm phẩy ở đây
            
      const typingHandler = (data) => {
        if (data.matchId === matchId && data.user !== currentUser._id) {
          setTyping(true);
          // Clear typing indicator after 3 seconds
          setTimeout(() => setTyping(false), 3000);
        }
      };
      
      // Chỉ lắng nghe một sự kiện tin nhắn để tránh trùng lặp
      socket.on('message', messageHandler);
      socket.on('typing', typingHandler);
      
      // Khi component unmount, hủy đăng ký các event
      return () => {
        socket.off('message', messageHandler);
        socket.off('typing', typingHandler);
      };
    }
  }, [socket, matchId, currentUser]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && !event.target.closest('.options-menu')) {
        setShowOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);
  
  // Update partnerRef when displayPartner changes
  useEffect(() => {
    if (partner) {
      partnerRef.current = partner;
    }
  }, [partner]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Tạo tin nhắn tạm thời để hiển thị ngay lập tức
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: newMessage.trim(),
      messageType: 'text',
      sender: currentUser._id,
      matchId: matchId,
      createdAt: new Date().toISOString(),
      readBy: [currentUser._id]
      // Đã xóa trạng thái sending
    };
    
    // Thêm tin nhắn tạm thời vào UI
    setMessages(prev => [...prev, tempMessage]);
    
    // Xóa nội dung tin nhắn trong input
    setNewMessage('');
    
    // Focus lại vào input
    inputRef.current?.focus();
    
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Lưu tin nhắn vào database
      const response = await axios.post(
        `${API_URL}/api/matches/${matchId}/messages`, 
        { 
          content: tempMessage.content,
          messageType: 'text'
        },
        config
      );
      
      // Lấy tin nhắn đã được lưu với ID từ server
      const savedMessage = response.data;
      
      // Cập nhật danh sách tin nhắn, thay thế tin nhắn tạm thời bằng tin nhắn đã lưu
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempMessage._id ? savedMessage : msg
        )
      );
      
      // Gửi tin nhắn đã lưu qua socket - gửi đầy đủ thông tin tin nhắn
      sendMessage({
        _id: savedMessage._id,
        matchId: matchId,
        message: savedMessage,
        content: savedMessage.content,
        sender: currentUser._id,
        senderDetails: {
          _id: currentUser._id,
          fullName: currentUser.fullName,
          avatar: currentUser.avatar
        },
        createdAt: savedMessage.createdAt
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Đánh dấu tin nhắn tạm thời là lỗi
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempMessage._id ? {...msg, error: true} : msg
        )
      );
      
      showErrorToast('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };
  

  
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (socket && connected) {
      socket.emit('typing', {
        matchId,
        user: currentUser._id
      });
    }
  };
  
  const handleUnmatch = async () => {
    try {
      setUnmatchLoading(true);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Gọi API để unmatch
      await axios.delete(`${API_URL}/api/matches/${matchId}`, config);
      
      toast.success('Đã hủy kết nối với người dùng này');
      navigate('/matches');
    } catch (error) {
      toast.error('Error unmatching:', error);
    } finally {
      setUnmatchLoading(false);
      setShowUnmatchModal(false);
    }
  };
  
  // Thêm state để theo dõi trạng thái gửi emoji
  const [sendingEmoji, setSendingEmoji] = useState(false);
  const [lastSentEmoji, setLastSentEmoji] = useState(null);
  
  const sendQuickReaction = async (reaction) => {
    // Nếu đang gửi emoji, không cho phép gửi thêm
    if (sendingEmoji) {
      return;
    }
    
    const reactionMessages = {
      heart: "❤️",
      like: "👍",
      laugh: "😂",
      wow: "😮",
      sad: "😢",
      angry: "😠"
    };
    
    const content = reactionMessages[reaction] || "❤️";
    
    // Cập nhật trạng thái đang gửi và emoji cuối cùng được gửi
    setSendingEmoji(true);
    setLastSentEmoji(reaction);
    
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Tạo một tin nhắn tạm thời để hiển thị ngay lập tức
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        content,
        sender: currentUser._id,
        createdAt: new Date().toISOString(),
        isTemp: true // Đánh dấu là tin nhắn tạm thời
      };
      
      // Thêm tin nhắn tạm thời vào danh sách
      setMessages(prev => [...prev, tempMessage]);
      
      // Gửi yêu cầu API
      const response = await axios.post(
        `${API_URL}/api/matches/${matchId}/messages`, 
        { content },
        config
      );
      
      // Khi có phản hồi, thay thế tin nhắn tạm thời bằng tin nhắn thật
      const savedMessage = response.data;
      setMessages(prev => prev.map(msg => 
        msg._id === tempMessage._id ? savedMessage : msg
      ));
      
      // Gửi tin nhắn qua socket
      sendMessage(savedMessage);
    } catch (error) {
      console.error('Error sending reaction:', error);
      showErrorToast('Không thể gửi biểu cảm');
      
      // Xóa tin nhắn tạm thời nếu có lỗi
      setMessages(prev => prev.filter(msg => !msg.isTemp));
    } finally {
      // Đặt lại trạng thái sau khi hoàn thành
      setSendingEmoji(false);
      setLastSentEmoji(null);
    }
  };
  
  // Hàm xử lý chặn người dùng đã được định nghĩa lại bên dưới với displayPartner
  
  // Animation variants
  const messageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };
  
  const modalVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] mt-[-1rem]">
        <Loader />
      </div>
    );
  }
  
  // Nếu không có match, hiển thị thông báo lỗi
  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-neutral-50 mt-[-1rem]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-yellow-500 text-5xl mb-4">
            <FaHeart className="mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-4">Không tìm thấy cuộc trò chuyện</h3>
          <p className="text-neutral-600 mb-6">
            Cuộc trò chuyện này không tồn tại hoặc đã bị xóa.
          </p>
          <button 
            onClick={() => navigate('/matches')}
            className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors duration-300 shadow-md"
          >
            Quay lại danh sách match
          </button>
        </div>
      </div>
    );
  }
  
  // Nếu không có partner, tạo một partner tạm thời để hiển thị giao diện
  const displayPartner = partner || {
    _id: 'unknown',
    fullName: 'Người dùng',
    avatar: null,
    online: false,
    lastActive: new Date().toISOString()
  };
  
  // Thay thế tất cả các tham chiếu đến partner trong các hàm xử lý sự kiện
  const handleBlockUser = async () => {
    try {
      if (!displayPartner || displayPartner._id === 'unknown') {
        showErrorToast('Không thể xác định người dùng để chặn');
        return;
      }
      
      setBlockingLoading(true);
      
      // Call the blockUser function from AuthContext
      await blockUser(displayPartner._id);
      
      toast.success(`Đã chặn ${displayPartner.fullName}`);
      
      // Navigate to the settings page with the blocked users tab active
      navigate('/settings', { state: { activeTab: 'blocked' } });
    } catch (error) {
      console.error('Error blocking user:', error);
      showErrorToast(error.response?.data?.message || 'Không thể chặn người dùng');
    } finally {
      setBlockingLoading(false);
      setShowBlockModal(false);
      setShowOptions(false);
    }
  };
  
  // Group messages by date
  const groupedMessages = messages && messages.length > 0 ? messages.reduce((groups, message) => {
    if (!message) {
      console.warn('Invalid message object (null or undefined)');
      return groups;
    }
    
    try {
      // Check if message.createdAt exists
      if (!message.createdAt) {
        console.warn('Message has no createdAt property:', message);
        // Use a fallback date for messages without createdAt
        const fallbackDate = 'Không có ngày';
        if (!groups[fallbackDate]) {
          groups[fallbackDate] = [];
        }
        groups[fallbackDate].push(message);
        return groups;
      }
      
      // Try to parse the date
      let messageDate;
      try {
        messageDate = new Date(message.createdAt);
      } catch (e) {
        console.warn('Error parsing date:', e, message.createdAt);
        messageDate = null;
      }
      
      // Check if the date is valid
      if (!messageDate || isNaN(messageDate.getTime())) {
        console.warn('Invalid date format:', message.createdAt);
        const fallbackDate = 'Ngày không hợp lệ';
        if (!groups[fallbackDate]) {
          groups[fallbackDate] = [];
        }
        groups[fallbackDate].push(message);
        return groups;
      }
      
      // Format the date in a user-friendly way
      let date;
      try {
        date = messageDate.toLocaleDateString('vi-VN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      } catch (e) {
        console.warn('Error formatting date:', e, messageDate);
        // Fallback to a simpler format
        try {
          date = `${messageDate.getDate()}/${messageDate.getMonth() + 1}/${messageDate.getFullYear()}`;
        } catch (e2) {
          console.error('Even simple date formatting failed:', e2);
          date = 'Ngày không hợp lệ';
        }
      }
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    } catch (error) {
      console.error('Error processing message date:', error, message);
      // Add to a fallback group if there's an error
      const fallbackDate = 'Lỗi định dạng ngày';
      if (!groups[fallbackDate]) {
        groups[fallbackDate] = [];
      }
      groups[fallbackDate].push(message);
    }
    return groups;
  }, {}) : {};
  
  return (
    <div className="flex fixed top-16 bottom-0 left-0 right-0 w-full bg-gradient-to-br from-amber-50 via-yellow-50/80 to-amber-100/60">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full transition-all duration-300">
        {/* Chat Header - Mobile & Desktop */}
        <div className="bg-white shadow-md p-4 flex items-center justify-between backdrop-blur-md bg-white/90 border-b border-amber-100">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/matches')}
              className="mr-4 text-amber-600 hover:text-amber-700 transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-amber-50 border border-amber-200"
            >
              <FaArrowLeft size={18} />
            </button>
            
            <div className="flex items-center">
              <div 
                className={`h-12 w-12 rounded-full overflow-hidden border-2 border-amber-200 ${displayPartner._id !== 'unknown' ? 'cursor-pointer hover:border-amber-400' : ''} transition-all shadow-md`}
                onClick={() => displayPartner._id !== 'unknown' ? navigate(`/profile/${displayPartner._id}`) : null}
              >
                {displayPartner.avatar ? (
                  <img 
                    src={displayPartner.avatar} 
                    alt={displayPartner.fullName} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {displayPartner.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="ml-3">
                <div className="flex items-center">
                  <h3 
                    className={`font-semibold text-neutral-800 ${displayPartner._id !== 'unknown' ? 'cursor-pointer hover:text-amber-600' : ''} transition-colors`}
                    onClick={() => displayPartner._id !== 'unknown' ? navigate(`/profile/${displayPartner._id}`) : null}
                  >
                    {displayPartner.fullName}
                  </h3>
                  {displayPartner.verified && (
                    <div className="flex items-center bg-green-100 px-2 py-0.5 rounded-full ml-2">
                      <FaUserCheck className="text-green-600 mr-1" size={10} />
                      <span className="text-xs font-medium text-green-800">Đã xác minh</span>
                    </div>
                  )}
                </div>
                {typing ? (
                  <div className="flex items-center text-xs text-amber-600">
                    <span className="mr-1">Đang nhập</span>
                    <span className="flex">
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0 }}
                        className="mx-0.5"
                      >.</motion.span>
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.2 }}
                        className="mx-0.5"
                      >.</motion.span>
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.4 }}
                        className="mx-0.5"
                      >.</motion.span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-xs text-neutral-500">
                    <div className={`h-2 w-2 rounded-full mr-1.5 ${displayPartner.online ? 'bg-green-500' : 'bg-neutral-300'}`}></div>
                    <span>{displayPartner.online ? 'Đang hoạt động' : 'Không hoạt động'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="relative options-menu">
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-colors"
              >
                <FaEllipsisV size={16} />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-20 border border-amber-100">
                  <button 
                    onClick={() => {
                      setShowOptions(false);
                      navigate(`/profile/${displayPartner._id}`);
                    }}
                    className="w-full text-left px-4 py-3 text-neutral-700 hover:bg-amber-50 transition-colors flex items-center"
                  >
                    <FaInfoCircle className="mr-3 text-amber-500" />
                    <span>Xem hồ sơ</span>
                  </button>
                  <button 
                    onClick={() => {
                      setShowOptions(false);
                      setShowUnmatchModal(true);
                    }}
                    className="w-full text-left px-4 py-3 text-amber-600 hover:bg-amber-50 transition-colors flex items-center"
                  >
                    <FaHeart className="mr-3" />
                    <span>Hủy kết nối</span>
                  </button>
                  <button 
                    onClick={() => {
                      setShowOptions(false);
                      navigate(`/report/user/${displayPartner._id}`);
                    }}
                    className="w-full text-left px-4 py-3 text-neutral-700 hover:bg-amber-50 transition-colors flex items-center"
                  >
                    <FaEllipsisV className="mr-3 text-neutral-500" />
                    <span>Báo cáo người dùng</span>
                  </button>
                  <button 
                    onClick={() => {
                      setShowOptions(false);
                      setShowBlockModal(true);
                    }}
                    className="w-full text-left px-4 py-3 text-neutral-700 hover:bg-amber-50 transition-colors flex items-center"
                  >
                    <FaEllipsisV className="mr-3 text-amber-500" />
                    <span>Chặn người dùng</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-transparent min-h-0">
          {!messages || messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-28 h-28 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <FaHeart className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-800 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-600">Bắt đầu cuộc trò chuyện</h3>
              <p className="text-neutral-600 text-center max-w-md mb-8 text-lg">
                Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện với {displayPartner.fullName}
              </p>
              <div className="flex space-x-4">
                <motion.button 
                  onClick={() => setNewMessage(`Chào ${displayPartner.fullName}, rất vui được kết nối với bạn!`)}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Gửi lời chào
                </motion.button>
                <motion.button 
                  onClick={() => sendQuickReaction('heart')}
                  className={`p-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-xl hover:from-amber-500 hover:to-yellow-600 transition-all shadow-md ${sendingEmoji ? 'opacity-70 cursor-wait' : ''}`}
                  whileHover={{ scale: sendingEmoji ? 1 : 1.05 }}
                  whileTap={{ scale: sendingEmoji ? 1 : 0.95 }}
                  disabled={sendingEmoji}
                >
                  {sendingEmoji ? (
                    <div className="flex items-center justify-center">
                      <FaHeart size={20} className="animate-pulse" />
                    </div>
                  ) : (
                    <FaHeart size={20} />
                  )}
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  <div className="flex justify-center mb-6">
                    <div className="bg-white/80 backdrop-blur-sm text-neutral-600 text-xs px-4 py-1.5 rounded-full shadow-sm border border-amber-100">
                      {date}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <AnimatePresence>
                      {dateMessages.map((message, index) => {
                        // Kiểm tra xem message.sender có phải là object không
                        const senderId = typeof message.sender === 'object' ? 
                          message.sender._id : message.sender;
                        
                        const isMe = senderId === currentUser._id;
                        const showAvatar = !isMe && (index === 0 || 
                          (typeof dateMessages[index - 1].sender === 'object' ? 
                            dateMessages[index - 1].sender._id : dateMessages[index - 1].sender) !== senderId);
                        const showTime = index === dateMessages.length - 1 || 
                          (typeof dateMessages[index + 1].sender === 'object' ? 
                            dateMessages[index + 1].sender._id : dateMessages[index + 1].sender) !== senderId;
                        
                        return (
                          <motion.div 
                            key={message._id || index} 
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
                            variants={messageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                          >
                            <div className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} max-w-[85%] items-end`}>
                              {!isMe && (
                                <div className={`${showAvatar ? 'opacity-100' : 'opacity-0'} h-10 w-10 rounded-full overflow-hidden mr-2 flex-shrink-0 transition-opacity duration-200`}>
                                  {displayPartner.avatar ? (
                                    <img 
                                      src={displayPartner.avatar} 
                                      alt={displayPartner.fullName} 
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                                      <span className="text-sm font-bold text-white">
                                        {displayPartner.fullName.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div 
                                className={`rounded-2xl px-4 py-3 ${
                                  isMe 
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-br-none shadow-md ml-2' 
                                    : 'bg-white text-neutral-800 rounded-bl-none shadow-md mr-2 border border-amber-100'
                                }`}
                              >
                                <p className="break-words text-[15px]">{message.content}</p>
                                
                                {showTime && (
                                  <div className="flex items-center mt-1">
                                    <p className={`text-xs ${isMe ? 'text-amber-100' : 'text-neutral-400'}`}>
                                      {message.createdAt && !isNaN(new Date(message.createdAt).getTime()) 
                                        ? new Date(message.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          }) 
                                        : '--:--'}
                                    </p>
                                    
                                    {/* Hiển thị trạng thái lỗi gửi tin nhắn */}
                                    {isMe && message.error && (
                                      <span className="ml-2">
                                        <span className="text-xs text-red-300">
                                          Lỗi gửi tin nhắn
                                        </span>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <div className="bg-white shadow-lg p-4 border-t border-amber-100 backdrop-blur-md bg-white/90">
          <form 
            onSubmit={handleSendMessage}
            className={`flex items-center space-x-2 mx-auto $ ? 'md:pr-[25%] lg:pr-[20%]' : ''} max-w-4xl`}
          >
            
            <div className="flex-1 relative">
              <input 
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Nhập tin nhắn..."
                className="w-full border-2 border-amber-200 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white shadow-inner"
                ref={inputRef}
              />
            </div>
            
            <motion.button 
              type="submit"
              disabled={!newMessage.trim()}
              className={`p-4 rounded-full shadow-md ${
                newMessage.trim() 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' 
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
              whileHover={newMessage.trim() ? { scale: 1.05 } : {}}
              whileTap={newMessage.trim() ? { scale: 0.95 } : {}}
            >
              <FaPaperPlane size={18} />
            </motion.button>
          </form>
          
          {/* Quick reactions */}
          <div className={`flex justify-center mt-3 space-x-3 mx-auto  ? 'md:pr-[25%] lg:pr-[20%]' : ''} max-w-4xl`}>
            <motion.button 
              onClick={() => sendQuickReaction('heart')}
              className={`p-2.5 text-red-500 hover:bg-amber-50 rounded-full transition-colors ${sendingEmoji && lastSentEmoji === 'heart' ? 'opacity-50 cursor-wait' : ''}`}
              whileHover={{ scale: sendingEmoji ? 1 : 1.1 }}
              whileTap={{ scale: sendingEmoji ? 1 : 0.9 }}
              disabled={sendingEmoji}
            >
              {sendingEmoji && lastSentEmoji === 'heart' ? (
                <span className="animate-pulse">❤️</span>
              ) : (
                <span>❤️</span>
              )}
            </motion.button>
            <motion.button 
              onClick={() => sendQuickReaction('like')}
              className={`p-2.5 text-amber-500 hover:bg-amber-50 rounded-full transition-colors ${sendingEmoji && lastSentEmoji === 'like' ? 'opacity-50 cursor-wait' : ''}`}
              whileHover={{ scale: sendingEmoji ? 1 : 1.1 }}
              whileTap={{ scale: sendingEmoji ? 1 : 0.9 }}
              disabled={sendingEmoji}
            >
              {sendingEmoji && lastSentEmoji === 'like' ? (
                <span className="animate-pulse">👍</span>
              ) : (
                <span>👍</span>
              )}
            </motion.button>
            <motion.button 
              onClick={() => sendQuickReaction('laugh')}
              className={`p-2.5 text-amber-500 hover:bg-amber-50 rounded-full transition-colors ${sendingEmoji && lastSentEmoji === 'laugh' ? 'opacity-50 cursor-wait' : ''}`}
              whileHover={{ scale: sendingEmoji ? 1 : 1.1 }}
              whileTap={{ scale: sendingEmoji ? 1 : 0.9 }}
              disabled={sendingEmoji}
            >
              {sendingEmoji && lastSentEmoji === 'laugh' ? (
                <span className="animate-pulse">😂</span>
              ) : (
                <span>😂</span>
              )}
            </motion.button>
            <motion.button 
              onClick={() => sendQuickReaction('wow')}
              className={`p-2.5 text-amber-500 hover:bg-amber-50 rounded-full transition-colors ${sendingEmoji && lastSentEmoji === 'wow' ? 'opacity-50 cursor-wait' : ''}`}
              whileHover={{ scale: sendingEmoji ? 1 : 1.1 }}
              whileTap={{ scale: sendingEmoji ? 1 : 0.9 }}
              disabled={sendingEmoji}
            >
              {sendingEmoji && lastSentEmoji === 'wow' ? (
                <span className="animate-pulse">😮</span>
              ) : (
                <span>😮</span>
              )}
            </motion.button>
            <motion.button 
              onClick={() => sendQuickReaction('sad')}
              className={`p-2.5 text-amber-500 hover:bg-amber-50 rounded-full transition-colors ${sendingEmoji && lastSentEmoji === 'sad' ? 'opacity-50 cursor-wait' : ''}`}
              whileHover={{ scale: sendingEmoji ? 1 : 1.1 }}
              whileTap={{ scale: sendingEmoji ? 1 : 0.9 }}
              disabled={sendingEmoji}
            >
              {sendingEmoji && lastSentEmoji === 'sad' ? (
                <span className="animate-pulse">😢</span>
              ) : (
                <span>😢</span>
              )}
            </motion.button>
            <motion.button 
              onClick={() => sendQuickReaction('angry')}
              className={`p-2.5 text-amber-500 hover:bg-amber-50 rounded-full transition-colors ${sendingEmoji && lastSentEmoji === 'angry' ? 'opacity-50 cursor-wait' : ''}`}
              whileHover={{ scale: sendingEmoji ? 1 : 1.1 }}
              whileTap={{ scale: sendingEmoji ? 1 : 0.9 }}
              disabled={sendingEmoji}
            >
              {sendingEmoji && lastSentEmoji === 'angry' ? (
                <span className="animate-pulse">😠</span>
              ) : (
                <span>😠</span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
      

      {/* Unmatch Confirmation Modal */}
      <AnimatePresence>
        {showUnmatchModal && (
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-3xl max-w-md w-full p-8 m-4 shadow-2xl border border-amber-100"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mb-5 shadow-md border-4 border-white">
                  <FaHeart className="text-amber-500 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-neutral-800 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-600">Xác nhận hủy kết nối</h3>
                <p className="text-neutral-600 text-center">
                  Bạn có chắc chắn muốn hủy kết nối với <span className="font-semibold text-amber-600">{displayPartner.fullName}</span>?
                </p>
              </div>
              
              <div className="bg-amber-50 rounded-2xl p-5 mb-6 border border-amber-100">
                <p className="text-amber-800 text-sm">
                  Hành động này không thể hoàn tác và tất cả tin nhắn sẽ bị xóa vĩnh viễn.
                </p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <motion.button
                  onClick={() => setShowUnmatchModal(false)}
                  className="px-6 py-3 border-2 border-amber-200 rounded-xl text-neutral-700 hover:bg-amber-50 transition-all font-medium"
                  disabled={unmatchLoading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Hủy
                </motion.button>
                <motion.button
                  onClick={handleUnmatch}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all shadow-md font-medium"
                  disabled={unmatchLoading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {unmatchLoading ? <Loader size="sm" color="white" /> : 'Xác nhận hủy kết nối'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Block User Confirmation Modal */}
      <AnimatePresence>
        {showBlockModal && (
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-3xl max-w-md w-full p-8 m-4 shadow-2xl border border-amber-100"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mb-5 shadow-md border-4 border-white">
                  <FaEllipsisV className="text-amber-500 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-neutral-800 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-600">Xác nhận chặn người dùng</h3>
                <p className="text-neutral-600 text-center">
                  Bạn có chắc chắn muốn chặn <span className="font-semibold text-amber-600">{displayPartner.fullName}</span>?
                </p>
              </div>
              
              <div className="bg-amber-50 rounded-2xl p-5 mb-6 border border-amber-100">
                <h4 className="font-semibold text-neutral-800 mb-3">Sau khi chặn:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                      <span className="text-amber-500 text-xs font-bold">1</span>
                    </div>
                    <p className="text-neutral-700">Người này sẽ không thể nhắn tin cho bạn</p>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                      <span className="text-amber-500 text-xs font-bold">2</span>
                    </div>
                    <p className="text-neutral-700">Họ sẽ không thấy bạn trong danh sách tìm kiếm</p>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                      <span className="text-amber-500 text-xs font-bold">3</span>
                    </div>
                    <p className="text-neutral-700">Bạn có thể bỏ chặn người này bất cứ lúc nào trong phần Cài đặt</p>
                  </li>
                </ul>
              </div>
              
              <div className="flex justify-center space-x-4">
                <motion.button
                  onClick={() => setShowBlockModal(false)}
                  className="px-6 py-3 border-2 border-amber-200 rounded-xl text-neutral-700 hover:bg-amber-50 transition-all font-medium"
                  disabled={blockingLoading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Hủy
                </motion.button>
                <motion.button
                  onClick={handleBlockUser}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all shadow-md font-medium"
                  disabled={blockingLoading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {blockingLoading ? <Loader size="sm" color="white" /> : 'Chặn người dùng'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;