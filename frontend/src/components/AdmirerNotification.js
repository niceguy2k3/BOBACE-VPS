import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const AdmirerNotification = () => {
  const [admirerCount, setAdmirerCount] = useState(0);
  const { currentUser } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    const fetchAdmirerCount = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) return;
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get(`${API_URL}/api/admirers/count`, config);
        setAdmirerCount(response.data.count);
      } catch (error) {
        console.error('Error fetching admirer count:', error);
      }
    };

    if (currentUser) {
      fetchAdmirerCount();
      
      // Fetch count every 60 seconds as fallback
      const interval = setInterval(fetchAdmirerCount, 60000);
      
      return () => clearInterval(interval);
    }
  }, [currentUser]);
  
  // Listen for realtime admirer notifications
  useEffect(() => {
    if (socket) {
      // Listen for new admirer notifications
      socket.on('newAdmirer', (data) => {
        console.log('New admirer notification received:', data);
        setAdmirerCount(data.count);
      });
      
      return () => {
        socket.off('newAdmirer');
      };
    }
  }, [socket]);

  if (admirerCount === 0) return null;

  return (
    <Link 
      to="/admirers"
      className="fixed bottom-20 right-4 bg-yellow-500 text-white px-4 py-3 rounded-full shadow-lg flex items-center space-x-2 hover:bg-yellow-600 transition-colors z-50"
    >
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {admirerCount}
        </span>
      </div>
      <span className="font-medium">Có người thích bạn!</span>
    </Link>
  );
};

export default AdmirerNotification;