import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaArrowLeft, FaInfoCircle, FaSearch, FaTimes } from 'react-icons/fa';
import { API_URL } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';

const Admirers = () => {
  const [admirers, setAdmirers] = useState([]);
  const [admirerCount, setAdmirerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [revealLoading, setRevealLoading] = useState(false);
  const [revealedAdmirer, setRevealedAdmirer] = useState(null);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
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
        toast.error('Rất tiếc! Không thể tải dữ liệu người thích bạn lúc này');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchAdmirers();
    }
  }, [currentUser]);
  
  const handleReveal = async (admirerId) => {
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
      
      toast.success('🎉 Bất ngờ chưa! Đã tiết lộ người thích bạn!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          background: 'linear-gradient(to right, #f59e0b, #f97316)',
          color: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }
      });
      
      // Update admirers list
      setAdmirers(prev => prev.filter(admirer => admirer.id !== admirerId));
      setAdmirerCount(prev => prev - 1);
      
      // Show the revealed admirer
      setRevealedAdmirer(response.data.admirer);
      
    } catch (error) {
      console.error('Error revealing admirer:', error);
      toast.error(error.response?.data?.message || 'Rất tiếc! Không thể hiện người thích bạn lúc này', {
        position: "top-center",
        style: {
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }
      });
    } finally {
      setRevealLoading(false);
    }
  };
  
  const handleLike = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Gửi yêu cầu API để thích người dùng
      const response = await axios.post(`${API_URL}/api/likes`, {
        to: userId,
        type: 'like'
      }, config);
      
      // Hiển thị thông báo thành công
      if (response.data.isMatch) {
        toast.success('Chúc mừng! Bạn đã có một kết đôi mới!', {
          position: "top-center",
          autoClose: 3000
        });
      } else {
        toast.success('Đã thích người dùng này!', {
          position: "top-center",
          autoClose: 3000
        });
      }
      
      // Đóng modal
      closeRevealedModal();
      
    } catch (error) {
      console.error('Error liking user:', error);
      
      // Kiểm tra nếu lỗi là do đạt giới hạn lượt thích
      if (error.response?.status === 403 && error.response?.data?.message?.includes('giới hạn lượt thích')) {
        toast.error('Bạn đã sử dụng hết lượt thích hôm nay!', {
          position: "top-center",
          autoClose: 3000
        });
      } else if (error.response?.status === 403) {
        // Hiển thị thông báo lỗi từ server nếu có
        toast.error(error.response?.data?.message || 'Không thể thích người dùng này', {
          position: "top-center",
          autoClose: 3000
        });
      } else {
        console.error('Chi tiết lỗi:', error);
        toast.error('Đã xảy ra lỗi khi thích người dùng. Vui lòng thử lại sau.', {
          position: "top-center",
          autoClose: 3000
        });
      }
    }
  };
  
  const handleDislike = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Gửi yêu cầu API để bỏ qua người dùng
      await axios.post(`${API_URL}/api/likes`, {
        to: userId,
        type: 'dislike'
      }, config);
      
      // Đóng modal
      closeRevealedModal();
      
      toast.info('Đã bỏ qua người dùng này', {
        position: "top-center",
        autoClose: 3000
      });
      
    } catch (error) {
      console.error('Error disliking user:', error);
      
      if (error.response?.status === 403) {
        // Hiển thị thông báo lỗi từ server nếu có
        toast.error(error.response?.data?.message || 'Không thể bỏ qua người dùng này', {
          position: "top-center",
          autoClose: 3000
        });
      } else {
        console.error('Chi tiết lỗi:', error);
        toast.error('Đã xảy ra lỗi khi bỏ qua người dùng. Vui lòng thử lại sau.', {
          position: "top-center",
          autoClose: 3000
        });
      }
    }
  };
  
  const closeRevealedModal = () => {
    setRevealedAdmirer(null);
  };
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50" style={{ paddingTop: "4rem" }}>
        <Loader />
      </div>
    );
  }
  
  return (
    <div id="admirers-page" className="h-screen w-screen overflow-y-auto bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="w-full px-3 sm:px-4 md:px-6" style={{ paddingTop: "4rem" }}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between py-4 mt-6"
          style={{ paddingTop: "1rem", paddingBottom: "0" }}
        >
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md text-yellow-600 hover:bg-yellow-500 hover:text-white transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaArrowLeft className="h-5 w-5" />
          </motion.button>
          
          <motion.h1 
            className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-yellow-600 to-orange-500 text-transparent bg-clip-text"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Người Thích Bạn
          </motion.h1>
          
          <div className="w-10"></div> {/* Spacer for alignment */}
        </motion.div>
      
        {admirerCount === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-4 pb-8 bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto"
        >
          <motion.div 
            className="text-yellow-500 mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, 0] }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <FaHeart className="h-20 w-20 mx-auto drop-shadow-md" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Chưa có ai thích bạn trong bí mật</h2>
          <p className="text-gray-600 text-lg mb-2">Đừng lo lắng! Điều đó sẽ sớm thay đổi.</p>
          <p className="text-gray-500 mb-8">Hãy tiếp tục khám phá để tìm kiếm người phù hợp với bạn!</p>
          
          <motion.button
            onClick={() => navigate('/')}
            className="mt-4 mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Khám phá ngay
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-4 mb-4 border-l-4 border-yellow-500"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="text-yellow-500 mr-4">
                <FaInfoCircle className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                  <span className="hidden sm:inline">Bạn có {admirerCount} người thích bí mật!</span>
                  <span className="sm:hidden">{admirerCount} người thích</span>
                </h3>
                <p className="text-gray-700 text-sm sm:text-base">
                  <span className="hidden sm:inline">Hãy khám phá xem ai đang thầm thương trộm nhớ bạn! Mỗi người đều có thể là một cơ hội tuyệt vời.</span>
                  <span className="sm:hidden">Khám phá ai thích bạn nhé! 💕</span>
                </p>
              </div>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {admirers.map((admirer, index) => (
              <motion.div 
                key={admirer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
                onClick={() => handleReveal(admirer.id)}
                whileHover={{ y: -5 }}
              >
                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                  <img 
                    src={admirer.blurredAvatar} 
                    alt="Secret admirer" 
                    className="w-full h-full object-cover filter blur-md scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center">
                    <motion.div 
                      className="bg-yellow-500 text-white p-4 rounded-full shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <FaHeart className="h-8 w-8" />
                    </motion.div>
                  </div>
                </div>
                
                <div className="bg-white p-4 text-center">
                  <p className="font-bold text-gray-800 mb-1">Người thích bí mật</p>
                  <div className="flex items-center justify-center text-yellow-500 space-x-1">
                    <FaSearch className="h-3 w-3" />
                    <p className="text-sm text-yellow-600 font-medium">Nhấn để khám phá</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Revealed Admirer Modal */}
      <AnimatePresence>
        {revealedAdmirer && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-yellow-600">Người thích bạn</h3>
                <motion.button 
                  onClick={closeRevealedModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  &times;
                </motion.button>
              </div>
              
              <motion.div 
                className="text-center mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="h-40 w-40 rounded-full overflow-hidden mx-auto mb-4 border-4 border-yellow-200 shadow-lg"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <img 
                    src={revealedAdmirer.avatar || '/default-avatar.jpg'} 
                    alt={revealedAdmirer.fullName} 
                    className="h-full w-full object-cover"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h4 className="text-2xl font-bold text-gray-800 mb-1">{revealedAdmirer.fullName}</h4>
                  <p className="text-yellow-600 font-medium">
                    {new Date().getFullYear() - new Date(revealedAdmirer.birthDate).getFullYear()} tuổi
                  </p>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="mb-6 bg-yellow-50 p-4 rounded-xl"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-gray-700 italic">{revealedAdmirer.bio || "Chưa có thông tin giới thiệu."}</p>
              </motion.div>
              
              <motion.div 
                className="flex justify-center flex-wrap gap-3 mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {currentUser?.premium && (
                  <>
                    <motion.button
                      onClick={() => handleDislike(revealedAdmirer._id)}
                      className="px-6 py-3 border border-gray-300 rounded-full text-red-500 hover:bg-red-50 transition-colors font-medium flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaTimes className="mr-2" />
                      Bỏ qua
                    </motion.button>
                    <motion.button
                      onClick={() => handleLike(revealedAdmirer._id)}
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full hover:from-pink-600 hover:to-pink-700 transition-colors font-medium shadow-md flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaHeart className="mr-2" />
                      Thích lại
                    </motion.button>
                  </>
                )}
                <motion.button
                  onClick={closeRevealedModal}
                  className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Đóng
                </motion.button>
                <motion.button
                  onClick={() => {
                    closeRevealedModal();
                    navigate('/');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full hover:shadow-lg transition-all font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Tiếp tục khám phá
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default Admirers;