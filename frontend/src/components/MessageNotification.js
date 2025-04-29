import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const MessageNotification = () => {
  const [unreadMessages, setUnreadMessages] = useState([]);
  const { currentUser } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) return;
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get(`${API_URL}/api/messages/unread`, config);
        setUnreadMessages(response.data);
      } catch (error) {
        console.error('Error fetching unread messages:', error);
      }
    };

    if (currentUser) {
      fetchUnreadMessages();
    }
  }, [currentUser]);
  
  // Listen for new messages
  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (data) => {
        // Only add to unread if the message is not from current user
        if (data.sender !== currentUser._id) {
          setUnreadMessages(prev => {
            // Check if we already have unread messages for this match
            const matchIndex = prev.findIndex(item => item.matchId === data.matchId);
            
            if (matchIndex !== -1) {
              // Update existing match
              const updatedMessages = [...prev];
              updatedMessages[matchIndex].count += 1;
              updatedMessages[matchIndex].lastMessage = data.content;
              return updatedMessages;
            } else {
              // Add new match with unread message
              return [...prev, {
                matchId: data.matchId,
                count: 1,
                lastMessage: data.content,
                user: data.senderDetails
              }];
            }
          });
        }
      });
      
      return () => {
        socket.off('newMessage');
      };
    }
  }, [socket, currentUser]);
  
  // Mark messages as read when clicking on notification
  const handleClick = async (matchId) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.post(`${API_URL}/api/messages/read/${matchId}`, {}, config);
      
      // Remove this match from unread messages
      setUnreadMessages(prev => prev.filter(item => item.matchId !== matchId));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  if (unreadMessages.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 z-50 flex flex-col space-y-2">
      {unreadMessages.map(item => (
        <Link 
          key={item.matchId}
          to={`/chat/${item.matchId}`}
          onClick={() => handleClick(item.matchId)}
          className="bg-white text-gray-800 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 hover:bg-gray-100 transition-colors max-w-xs"
        >
          <div className="relative">
            {item.user?.avatar ? (
              <img 
                src={item.user.avatar} 
                alt={item.user?.fullName || 'User'} 
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600">
                  {(item.user?.fullName || 'U').charAt(0)}
                </span>
              </div>
            )}
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {item.count}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-medium text-sm">{item.user?.fullName || 'Người dùng'}</p>
            <p className="text-xs text-gray-600 truncate">{item.lastMessage}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MessageNotification;