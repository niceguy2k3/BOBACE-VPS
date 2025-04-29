import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

const SecretAdmirers = () => {
  const [admirers, setAdmirers] = useState([]);
  const [admirerCount, setAdmirerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [revealLoading, setRevealLoading] = useState(false);
  
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchAdmirers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Get count
        const countResponse = await axios.get(`${API_URL}/api/admirers/count`, config);
        setAdmirerCount(countResponse.data.count);
        
        // Get preview
        const previewResponse = await axios.get(`${API_URL}/api/admirers/preview`, config);
        setAdmirers(previewResponse.data.admirers);
      } catch (error) {
        console.error('Error fetching admirers:', error);
        toast.error('Không thể tải dữ liệu người thích');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchAdmirers();
    }
  }, [currentUser]);
  
  const handleReveal = async (admirerId) => {
    if (!currentUser.premium) {
      toast.info('Đây là tính năng dành cho người dùng premium. Hãy nâng cấp tài khoản để xem người thích bạn!');
      return;
    }
    
    try {
      setRevealLoading(true);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.post(
        `${API_URL}/api/admirers/reveal/${admirerId}`,
        {},
        config
      );
      
      toast.success('Đã hiện người thích bạn!');
      
      // Update admirers list
      setAdmirers(prev => prev.filter(admirer => admirer.id !== admirerId));
      setAdmirerCount(prev => prev - 1);
      
      // Show the revealed admirer
      const revealedAdmirer = response.data.admirer;
      // Here you could show a modal with the revealed admirer details
      
    } catch (error) {
      console.error('Error revealing admirer:', error);
      toast.error(error.response?.data?.message || 'Không thể hiện người thích');
    } finally {
      setRevealLoading(false);
    }
  };
  
  if (loading) {
    return <Loader />;
  }
  
  if (admirerCount === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Chưa có ai thích bạn trong bí mật.</p>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">
        {admirerCount} người đã thích bạn
      </h3>
      
      <p className="text-gray-600 mb-6">
        {currentUser.premium 
          ? 'Nhấn vào ảnh để xem ai đã thích bạn!' 
          : 'Nâng cấp tài khoản premium để xem ai đã thích bạn!'}
      </p>
      
      <div className="grid grid-cols-3 gap-4">
        {admirers.map(admirer => (
          <div 
            key={admirer.id}
            className="relative cursor-pointer"
            onClick={() => handleReveal(admirer.id)}
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
              <img 
                src={admirer.blurredAvatar} 
                alt="Secret admirer" 
                className="w-full h-full object-cover filter blur-md"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-yellow-500 bg-opacity-70 text-white p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {!currentUser.premium && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                Premium
              </div>
            )}
          </div>
        ))}
      </div>
      
      {!currentUser.premium && (
        <div className="mt-6 text-center">
          <button className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">
            Nâng cấp Premium
          </button>
        </div>
      )}
    </div>
  );
};

export default SecretAdmirers;