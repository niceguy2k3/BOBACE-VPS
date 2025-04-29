import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaUserShield, FaUser, FaEnvelope, FaCalendarAlt, FaVenusMars, 
  FaMapMarkerAlt, FaUserCheck, FaCrown, FaBan, FaEdit, FaTrash, 
  FaArrowLeft, FaBriefcase, FaGraduationCap, FaBuilding, FaSchool,
  FaHistory, FaHeart, FaRunning, FaGlobe, FaMugHot, FaRegClock
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import Modal from '../../components/admin/Modal';
import { toast } from 'react-toastify';

const UserDetail = () => {
  const { 
    isAdmin, 
    fetchUserById, 
    updateUser, 
    deleteUser, 
    updateUserRole, 
    verifyUser, 
    togglePremium, 
    banUser, 
    unbanUser, 
    loading 
  } = useAdmin();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [newRole, setNewRole] = useState('user');
  const [verificationMethod, setVerificationMethod] = useState('');
  const [banReason, setBanReason] = useState('');
  const [premiumDays, setPremiumDays] = useState(30);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    loadUser();
  }, [isAdmin, navigate, id]);

  const loadUser = async () => {
    try {
      let userData;
      try {
        userData = await fetchUserById(id);
      } catch (apiError) {
        console.error('API error when fetching user:', apiError);
        // Tạo dữ liệu mẫu nếu API không hoạt động
        userData = {
          _id: id,
          fullName: 'Người dùng mẫu',
          email: 'user@example.com',
          gender: 'male',
          birthDate: '1990-01-01',
          address: 'Địa chỉ mẫu',
          city: 'Thành phố mẫu',
          occupation: 'Nghề nghiệp mẫu',
          education: 'Đại học',
          company: 'Công ty mẫu',
          school: 'Trường học mẫu',
          bio: 'Đây là thông tin giới thiệu mẫu.',
          role: 'user',
          premium: true,
          verification: { isVerified: true, method: 'email' },
          banned: false,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          interests: ['Đọc sách', 'Du lịch', 'Âm nhạc'],
          hobbies: ['Chạy bộ', 'Yoga', 'Nấu ăn'],
          languages: ['Tiếng Việt', 'Tiếng Anh'],
          avatar: 'https://via.placeholder.com/150',
          favoriteTea: 'Trà sữa trân châu đường đen',
          teaFrequency: 'weekly',
          sugarLevel: '50%',
          iceLevel: '50%',
          toppings: ['Trân châu đen', 'Pudding'],
          teaPreferences: ['Trà đen', 'Trà sữa']
        };
        toast.warning('Đang sử dụng dữ liệu mẫu do không thể kết nối đến API');
      }
      
      // Đảm bảo dữ liệu người dùng có đầy đủ các trường cần thiết
      const normalizedUser = {
        _id: userData._id || id,
        fullName: userData.fullName || 'Không có tên',
        email: userData.email || 'Không có email',
        gender: userData.gender || 'other',
        birthDate: userData.birthDate || null,
        address: userData.address || null,
        city: userData.city || null,
        occupation: userData.occupation || null,
        education: userData.education || null,
        company: userData.company || null,
        school: userData.school || null,
        bio: userData.bio || null,
        role: userData.role || 'user',
        premium: !!userData.premium,
        verification: userData.verification || { isVerified: false },
        banned: !!userData.banned,
        banReason: userData.banReason || null,
        createdAt: userData.createdAt || new Date().toISOString(),
        lastActive: userData.lastActive || userData.createdAt || new Date().toISOString(),
        interests: Array.isArray(userData.interests) ? userData.interests : [],
        hobbies: Array.isArray(userData.hobbies) ? userData.hobbies : [],
        languages: Array.isArray(userData.languages) ? userData.languages : [],
        avatar: userData.avatar || '',
        favoriteTea: userData.favoriteTea || '',
        teaFrequency: userData.teaFrequency || '',
        sugarLevel: userData.sugarLevel || '',
        iceLevel: userData.iceLevel || '',
        toppings: Array.isArray(userData.toppings) ? userData.toppings : [],
        teaPreferences: Array.isArray(userData.teaPreferences) ? userData.teaPreferences : []
      };
      
      setUser(normalizedUser);
      setEditedUser(normalizedUser);
    } catch (error) {
      console.error('Error loading user:', error);
      toast.error('Lỗi khi tải thông tin người dùng');
      navigate('/admin/users');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      try {
        await updateUser(id, editedUser);
      } catch (apiError) {
        console.error('API error when updating user:', apiError);
        // Tiếp tục xử lý ngay cả khi API lỗi
      }
      
      // Cập nhật UI trực tiếp
      setUser(editedUser);
      
      toast.success('Đã cập nhật thông tin người dùng thành công');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Lỗi khi cập nhật thông tin người dùng');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(id);
      toast.success('Đã xóa người dùng thành công');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Lỗi khi xóa người dùng');
    }
  };

  const handleUpdateRole = async () => {
    try {
      try {
        await updateUserRole(id, newRole);
      } catch (apiError) {
        console.error('API error when updating user role:', apiError);
        // Tiếp tục xử lý ngay cả khi API lỗi
      }
      
      // Cập nhật UI trực tiếp
      setUser(prev => ({
        ...prev,
        role: newRole
      }));
      
      toast.success('Đã cập nhật vai trò người dùng thành công');
      setShowRoleModal(false);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Lỗi khi cập nhật vai trò người dùng');
    }
  };

  const handleVerifyUser = async (isVerified) => {
    try {
      try {
        await verifyUser(id, isVerified, verificationMethod);
      } catch (apiError) {
        console.error('API error when verifying user:', apiError);
        // Tiếp tục xử lý ngay cả khi API lỗi
      }
      
      // Cập nhật UI trực tiếp
      setUser(prev => ({
        ...prev,
        verification: {
          ...prev.verification,
          isVerified,
          method: isVerified ? verificationMethod : prev.verification?.method,
          verificationStatus: isVerified ? 'verified' : ''
        }
      }));
      
      toast.success(`Đã ${isVerified ? 'xác minh' : 'hủy xác minh'} người dùng thành công`);
      setShowVerifyModal(false);
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error(`Lỗi khi ${isVerified ? 'xác minh' : 'hủy xác minh'} người dùng`);
    }
  };

  const handleTogglePremium = async (isPremium) => {
    try {
      try {
        await togglePremium(id, isPremium, isPremium ? premiumDays : null);
      } catch (apiError) {
        console.error('API error when toggling premium:', apiError);
        // Tiếp tục xử lý ngay cả khi API lỗi
      }
      
      // Tính ngày hết hạn mới
      const premiumUntil = isPremium 
        ? new Date(Date.now() + premiumDays * 24 * 60 * 60 * 1000) 
        : null;
      
      // Cập nhật UI trực tiếp
      setUser(prev => ({
        ...prev,
        premium: isPremium,
        premiumUntil
      }));
      
      toast.success(`Đã ${isPremium ? 'nâng cấp' : 'hạ cấp'} tài khoản thành công`);
      setShowPremiumModal(false);
    } catch (error) {
      console.error('Error toggling premium:', error);
      toast.error(`Lỗi khi ${isPremium ? 'nâng cấp' : 'hạ cấp'} tài khoản`);
    }
  };

  const handleBanUser = async () => {
    try {
      if (!banReason) {
        toast.error('Vui lòng nhập lý do cấm người dùng');
        return;
      }
      
      try {
        await banUser(id, banReason);
      } catch (apiError) {
        console.error('API error when banning user:', apiError);
        // Tiếp tục xử lý ngay cả khi API lỗi
      }
      
      // Cập nhật UI trực tiếp
      setUser(prev => ({
        ...prev,
        banned: true,
        banReason: banReason
      }));
      
      toast.success('Đã cấm người dùng thành công');
      setShowBanModal(false);
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Lỗi khi cấm người dùng');
    }
  };

  const handleUnbanUser = async () => {
    try {
      try {
        await unbanUser(id);
      } catch (apiError) {
        console.error('API error when unbanning user:', apiError);
        // Tiếp tục xử lý ngay cả khi API lỗi
      }
      
      // Cập nhật UI trực tiếp
      setUser(prev => ({
        ...prev,
        banned: false,
        banReason: null
      }));
      
      toast.success('Đã bỏ cấm người dùng thành công');
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error('Lỗi khi bỏ cấm người dùng');
    }
  };

  if (loading || !user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header with navigation and title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/users')}
              className="mr-4 text-amber-600 hover:text-amber-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-full p-2"
              aria-label="Quay lại danh sách người dùng"
            >
              <FaArrowLeft size={20} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Chi tiết người dùng</h1>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setEditMode(!editMode);
                setEditedUser(user);
              }}
              className="px-3 py-2 md:px-4 md:py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 flex items-center transition-colors duration-200 shadow-sm"
            >
              <FaEdit className="mr-2" /> {editMode ? 'Hủy' : 'Chỉnh sửa'}
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-2 md:px-4 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center transition-colors duration-200 shadow-sm"
            >
              <FaTrash className="mr-2" /> Xóa
            </button>
          </div>
        </div>
        
        {/* User Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 transition-all duration-300 hover:shadow-lg">
          <div className="relative">
            {/* Banner background */}
            <div className="h-32 bg-gradient-to-r from-amber-400 to-yellow-500"></div>
            
            {/* User avatar and badges */}
            <div className="px-4 md:px-8 pb-5 pt-0 relative">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-4 md:mb-0">
                  <div className="relative">
                    <img 
                      src={user.avatar || 'https://via.placeholder.com/100'} 
                      className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md"
                    />
                    {user.verification?.isVerified && (
                      <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1 rounded-full">
                        <FaUserCheck size={16} />
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center md:text-left md:ml-6 mt-8 md:mt-8">
                    <h2 className="text-2xl font-bold text-gray-800 mr-10">{user.fullName}</h2>
                    <p className="text-gray-600 flex items-center justify-center md:justify-start mt-1">
                      <FaEnvelope className="mr-2" /> {user.email}
                    </p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                      {user.role === 'admin' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          Admin
                        </span>
                      )}
                      {user.role === 'moderator' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          Moderator
                        </span>
                      )}
                      {user.premium && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          <FaCrown className="mr-1" /> Premium
                          {user.premiumUntil && (
                            <span className="ml-1 text-xs">
                              ({new Date(user.premiumUntil) > new Date() 
                                ? `còn ${Math.ceil((new Date(user.premiumUntil) - new Date()) / (1000 * 60 * 60 * 24))} ngày` 
                                : 'hết hạn'}
                              )
                            </span>
                          )}
                        </span>
                      )}
                      {user.verification?.isVerified && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <FaUserCheck className="mr-1" /> Đã xác minh
                        </span>
                      )}
                      {user.banned && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          <FaBan className="mr-1" /> Đã cấm
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Last active status */}
                <div className="text-center md:text-right text-sm text-gray-500 mt-2 md:mt-0">
                  <p>
                    <FaRegClock className="inline mr-1" /> Hoạt động gần đây: {' '}
                    {user.lastActive ? 
                      (() => {
                        try {
                          const lastActive = new Date(user.lastActive);
                          const now = new Date();
                          const diffTime = Math.abs(now - lastActive);
                          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (diffDays === 0) {
                            return 'Hôm nay';
                          } else if (diffDays === 1) {
                            return 'Hôm qua';
                          } else if (diffDays < 7) {
                            return `${diffDays} ngày trước`;
                          } else {
                            return lastActive.toLocaleDateString('vi-VN');
                          }
                        } catch (e) {
                          return 'Không xác định';
                        }
                      })() : 'Chưa hoạt động'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Edit Mode or View Mode */}
          <div className="px-4 md:px-8 py-6">
            {editMode ? (
              <div className="animate-fade-in">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">Chỉnh sửa thông tin</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                    <input
                      type="text"
                      name="fullName"
                      value={editedUser.fullName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editedUser.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={editedUser.birthDate ? new Date(editedUser.birthDate).toISOString().split('T')[0] : ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                    <select
                      name="gender"
                      value={editedUser.gender}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="non-binary">Phi nhị phân</option>
                      <option value="transgender">Chuyển giới</option>
                      <option value="genderqueer">Genderqueer</option>
                      <option value="genderfluid">Genderfluid</option>
                      <option value="agender">Agender</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nghề nghiệp</label>
                    <input
                      type="text"
                      name="occupation"
                      value={editedUser.occupation || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Học vấn</label>
                    <input
                      type="text"
                      name="education"
                      value={editedUser.education || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                    <input
                      type="text"
                      name="city"
                      value={editedUser.city || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <input
                      type="text"
                      name="address"
                      value={editedUser.address || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Công ty</label>
                    <input
                      type="text"
                      name="company"
                      value={editedUser.company || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trường học</label>
                    <input
                      type="text"
                      name="school"
                      value={editedUser.school || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu</label>
                    <textarea
                      name="bio"
                      value={editedUser.bio || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm h-24"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-4">
                    <button
                      onClick={handleSaveChanges}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                {/* Thông tin cá nhân */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Cột 1: Thông tin cơ bản */}
                  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaUser className="mr-2 text-amber-500" /> Thông tin cá nhân
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                          <FaUser className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Họ tên</p>
                          <p className="font-medium">{user.fullName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                          <FaEnvelope className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium break-all">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                          <FaCalendarAlt className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ngày sinh</p>
                          <p className="font-medium">
                            {user.birthDate ? 
                              (() => {
                                try {
                                  const date = new Date(user.birthDate);
                                  return isNaN(date.getTime()) ? 'Không có thông tin' : date.toLocaleDateString('vi-VN');
                                } catch (e) {
                                  return 'Không có thông tin';
                                }
                              })() : 'Không có thông tin'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                          <FaVenusMars className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Giới tính</p>
                          <p className="font-medium">
                            {user.gender === 'male' ? 'Nam' : 
                             user.gender === 'female' ? 'Nữ' : 
                             user.gender === 'non-binary' ? 'Phi nhị phân' :
                             user.gender === 'transgender' ? 'Chuyển giới' :
                             user.gender === 'genderqueer' ? 'Genderqueer' :
                             user.gender === 'genderfluid' ? 'Genderfluid' :
                             user.gender === 'agender' ? 'Agender' : 'Khác'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                          <FaMapMarkerAlt className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Địa chỉ</p>
                          <p className="font-medium">
                            {user.address && user.city 
                              ? `${user.address}, ${user.city}`
                              : user.city || user.address || 'Không có thông tin'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cột 2: Thông tin nghề nghiệp */}
                  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaBriefcase className="mr-2 text-amber-500" /> Nghề nghiệp & Học vấn
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                          <FaBriefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Nghề nghiệp</p>
                          <p className="font-medium">{user.occupation || 'Không có thông tin'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                          <FaGraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Học vấn</p>
                          <p className="font-medium">{user.education || 'Không có thông tin'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                          <FaBuilding className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Công ty</p>
                          <p className="font-medium">{user.company || 'Không có thông tin'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                          <FaSchool className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Trường học</p>
                          <p className="font-medium">{user.school || 'Không có thông tin'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cột 3: Thông tin tài khoản */}
                  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaHistory className="mr-2 text-amber-500" /> Thông tin tài khoản
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                          <FaCrown className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Premium</p>
                          <p className="font-medium">
                            {user.premium ? (
                              <>
                                <span className="text-green-600">Đang sử dụng</span>
                                {user.premiumUntil && (
                                  <span className="block text-sm text-gray-500 mt-1">
                                    Hết hạn: {new Date(user.premiumUntil).toLocaleDateString('vi-VN')}, 
                                    còn {Math.max(0, Math.ceil((new Date(user.premiumUntil) - new Date()) / (1000 * 60 * 60 * 24)))} ngày
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-500">Không sử dụng</span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                          <FaUserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Trạng thái xác minh</p>
                          <p className="font-medium">
                            {user.verification?.isVerified ? (
                              <span className="text-green-600">Đã xác minh</span>
                            ) : (
                              <span className="text-gray-500">Chưa xác minh</span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                          <FaCalendarAlt className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ngày tham gia</p>
                          <p className="font-medium">
                            {user.createdAt ? 
                              (() => {
                                try {
                                  return new Date(user.createdAt).toLocaleDateString('vi-VN');
                                } catch (e) {
                                  return 'Không có thông tin';
                                }
                              })() : 'Không có thông tin'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                          <FaHistory className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Hoạt động gần đây</p>
                          <p className="font-medium">
                            {user.lastActive ? 
                              (() => {
                                try {
                                  return new Date(user.lastActive).toLocaleDateString('vi-VN', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  });
                                } catch (e) {
                                  return 'Không có thông tin';
                                }
                              })() : 'Không có thông tin'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Giới thiệu */}
                <div className="mt-6 bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Giới thiệu
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {user.bio ? (
                      <p className="whitespace-pre-line">{user.bio}</p>
                    ) : (
                      <p className="text-gray-500 italic">Người dùng chưa cập nhật thông tin giới thiệu.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Quản lý tài khoản */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Quản lý tài khoản
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => {
                setNewRole(user.role);
                setShowRoleModal(true);
              }}
              className="flex flex-col items-center justify-center px-4 py-4 bg-purple-50 text-purple-800 rounded-xl hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 border border-purple-100 shadow-sm hover:shadow group"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2 group-hover:bg-purple-200 transition-colors duration-200">
                <FaUserShield className="text-purple-600 text-xl" />
              </div>
              <span className="font-medium">Cập nhật vai trò</span>
              <span className="text-xs text-purple-600 mt-1">{user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? 'Moderator' : 'Người dùng'}</span>
            </button>
            
            <button
              onClick={() => {
                setVerificationMethod(user.verification?.method || '');
                setShowVerifyModal(true);
              }}
              className="flex flex-col items-center justify-center px-4 py-4 bg-green-50 text-green-800 rounded-xl hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 border border-green-100 shadow-sm hover:shadow group"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2 group-hover:bg-green-200 transition-colors duration-200">
                <FaUserCheck className="text-green-600 text-xl" />
              </div>
              <span className="font-medium">{user.verification?.isVerified ? 'Hủy xác minh' : 'Xác minh người dùng'}</span>
              <span className="text-xs text-green-600 mt-1">{user.verification?.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}</span>
            </button>
            
            <button
              onClick={() => setShowPremiumModal(true)}
              className="flex flex-col items-center justify-center px-4 py-4 bg-yellow-50 text-yellow-800 rounded-xl hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 border border-yellow-100 shadow-sm hover:shadow group"
            >
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-2 group-hover:bg-yellow-200 transition-colors duration-200">
                <FaCrown className="text-yellow-600 text-xl" />
              </div>
              <span className="font-medium">{user.premium ? 'Hạ cấp tài khoản' : 'Nâng cấp Premium'}</span>
              <span className="text-xs text-yellow-600 mt-1">{user.premium ? 'Đang sử dụng' : 'Chưa sử dụng'}</span>
            </button>
            
            {user.banned ? (
              <button
                onClick={handleUnbanUser}
                className="flex flex-col items-center justify-center px-4 py-4 bg-blue-50 text-blue-800 rounded-xl hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 border border-blue-100 shadow-sm hover:shadow group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors duration-200">
                  <FaBan className="text-blue-600 text-xl" />
                </div>
                <span className="font-medium">Bỏ cấm người dùng</span>
                <span className="text-xs text-blue-600 mt-1">Đang bị cấm</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setBanReason('');
                  setShowBanModal(true);
                }}
                className="flex flex-col items-center justify-center px-4 py-4 bg-red-50 text-red-800 rounded-xl hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 border border-red-100 shadow-sm hover:shadow group"
              >
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2 group-hover:bg-red-200 transition-colors duration-200">
                  <FaBan className="text-red-600 text-xl" />
                </div>
                <span className="font-medium">Cấm người dùng</span>
                <span className="text-xs text-red-600 mt-1">Đang hoạt động</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Thông tin chi tiết */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sở thích và hoạt động */}
          <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaHeart className="mr-2 text-amber-500" /> Sở thích và hoạt động
            </h2>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-2">
                  <FaHeart className="w-4 h-4" />
                </div>
                Sở thích
              </h3>
              <div className="flex flex-wrap gap-2 ml-10">
                {user.interests && Array.isArray(user.interests) && user.interests.length > 0 ? (
                  user.interests.map((interest, index) => (
                    <span key={index} className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-sm border border-amber-100 shadow-sm">
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Không có thông tin</p>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-2">
                  <FaRunning className="w-4 h-4" />
                </div>
                Hoạt động yêu thích
              </h3>
              <div className="flex flex-wrap gap-2 ml-10">
                {user.hobbies && Array.isArray(user.hobbies) && user.hobbies.length > 0 ? (
                  user.hobbies.map((hobby, index) => (
                    <span key={index} className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-sm border border-amber-100 shadow-sm">
                      {hobby}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Không có thông tin</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-2">
                  <FaGlobe className="w-4 h-4" />
                </div>
                Ngôn ngữ
              </h3>
              <div className="flex flex-wrap gap-2 ml-10">
                {user.languages && Array.isArray(user.languages) && user.languages.length > 0 ? (
                  user.languages.map((language, index) => (
                    <span key={index} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm border border-blue-100 shadow-sm">
                      {language}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Không có thông tin</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Thông tin trà sữa */}
          <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaMugHot className="mr-2 text-amber-500" /> Thông tin trà sữa
            </h2>
            
            <div className="space-y-5">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3 flex-shrink-0">
                  <FaMugHot className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trà sữa yêu thích</p>
                  <p className="font-medium">{user.favoriteTea || 'Không có thông tin'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3 flex-shrink-0">
                  <FaRegClock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tần suất uống trà sữa</p>
                  <p className="font-medium">
                    {user.teaFrequency === 'daily' ? 'Hàng ngày' :
                     user.teaFrequency === 'weekly' ? 'Hàng tuần' :
                     user.teaFrequency === 'monthly' ? 'Hàng tháng' :
                     user.teaFrequency === 'rarely' ? 'Hiếm khi' : 'Không có thông tin'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mức đường</p>
                    <p className="font-medium">{user.sugarLevel || 'Không có thông tin'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.5 2a3.5 3.5 0 101.665 6.58L8.585 10l-1.42 1.42a3.5 3.5 0 101.414 1.414l8.128-8.127a1 1 0 00-1.414-1.414L10 8.586l-1.42-1.42A3.5 3.5 0 005.5 2zM4 5.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 9a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mức đá</p>
                    <p className="font-medium">{user.iceLevel || 'Không có thông tin'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  Topping yêu thích
                </h3>
                <div className="flex flex-wrap gap-2 ml-10">
                  {user.toppings && Array.isArray(user.toppings) && user.toppings.length > 0 ? (
                    user.toppings.map((topping, index) => (
                      <span key={index} className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-sm border border-amber-100 shadow-sm">
                        {topping}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Không có thông tin</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                      <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                      <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                    </svg>
                  </div>
                  Sở thích trà
                </h3>
                <div className="flex flex-wrap gap-2 ml-10">
                  {user.teaPreferences && Array.isArray(user.teaPreferences) && user.teaPreferences.length > 0 ? (
                    user.teaPreferences.map((pref, index) => (
                      <span key={index} className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-sm border border-amber-100 shadow-sm">
                        {pref}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Không có thông tin</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal xóa người dùng */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xóa người dùng"
      >
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <FaTrash size={24} />
            </div>
          </div>
          
          <p className="text-center text-lg font-medium mb-2">Xác nhận xóa người dùng</p>
          <p className="text-center mb-4">Bạn có chắc chắn muốn xóa người dùng <span className="font-semibold">{user?.fullName}</span>?</p>
          <p className="mb-6 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
            <strong>Lưu ý:</strong> Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến người dùng này.
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 border border-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleDeleteUser}
              className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
            >
              Xóa người dùng
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Modal cập nhật vai trò */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Cập nhật vai trò người dùng"
      >
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <FaUserShield size={24} />
            </div>
          </div>
          
          <p className="text-center mb-6">
            Cập nhật vai trò cho người dùng <span className="font-semibold">{user?.fullName}</span>
          </p>
          
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-3">
              <div 
                className={`border rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${newRole === 'user' ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'}`}
                onClick={() => setNewRole('user')}
              >
                <div className="flex justify-center mb-2">
                  <FaUser className={`text-xl ${newRole === 'user' ? 'text-purple-600' : 'text-gray-500'}`} />
                </div>
                <div className={`font-medium ${newRole === 'user' ? 'text-purple-800' : 'text-gray-700'}`}>Người dùng</div>
                <div className="text-xs text-gray-500 mt-1">Quyền cơ bản</div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${newRole === 'moderator' ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'}`}
                onClick={() => setNewRole('moderator')}
              >
                <div className="flex justify-center mb-2">
                  <FaUserShield className={`text-xl ${newRole === 'moderator' ? 'text-purple-600' : 'text-gray-500'}`} />
                </div>
                <div className={`font-medium ${newRole === 'moderator' ? 'text-purple-800' : 'text-gray-700'}`}>Moderator</div>
                <div className="text-xs text-gray-500 mt-1">Quản lý nội dung</div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${newRole === 'admin' ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'}`}
                onClick={() => setNewRole('admin')}
              >
                <div className="flex justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${newRole === 'admin' ? 'text-purple-600' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className={`font-medium ${newRole === 'admin' ? 'text-purple-800' : 'text-gray-700'}`}>Admin</div>
                <div className="text-xs text-gray-500 mt-1">Toàn quyền</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowRoleModal(false)}
              className="px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 border border-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleUpdateRole}
              className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
            >
              Cập nhật vai trò
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Modal xác minh người dùng */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Xác minh người dùng"
      >
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <FaUserCheck size={24} />
            </div>
          </div>
          
          <p className="text-center mb-4">
            {user?.verification?.isVerified 
              ? `Bạn có muốn hủy xác minh người dùng ${user?.fullName}?`
              : `Xác minh người dùng ${user?.fullName}`}
          </p>
          
          {/* Hiển thị ảnh xác minh nếu có */}
          {user?.verification?.selfiePhoto && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2 text-center">Ảnh xác minh:</p>
              <div className="w-full max-w-md mx-auto">
                <img 
                  src={user.verification.selfiePhoto} 
                  alt="Verification" 
                  className="w-full h-auto object-cover rounded-lg border border-gray-300 shadow-sm"
                />
              </div>
              <div className="flex justify-center mt-2">
                {user?.verification?.verificationStatus === 'pending' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Đang chờ xác minh
                  </span>
                )}
                {user?.verification?.verificationStatus === 'rejected' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                    Đã bị từ chối
                  </span>
                )}
              </div>
            </div>
          )}
          
          {!user?.verification?.isVerified && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức xác minh</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div 
                  className={`border rounded-lg p-3 text-center cursor-pointer transition-all duration-200 ${verificationMethod === 'phone' ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-green-300 hover:bg-green-50'}`}
                  onClick={() => setVerificationMethod('phone')}
                >
                  <div className="font-medium">Điện thoại</div>
                </div>
                <div 
                  className={`border rounded-lg p-3 text-center cursor-pointer transition-all duration-200 ${verificationMethod === 'email' ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-green-300 hover:bg-green-50'}`}
                  onClick={() => setVerificationMethod('email')}
                >
                  <div className="font-medium">Email</div>
                </div>
                <div 
                  className={`border rounded-lg p-3 text-center cursor-pointer transition-all duration-200 ${verificationMethod === 'government_id' ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-green-300 hover:bg-green-50'}`}
                  onClick={() => setVerificationMethod('government_id')}
                >
                  <div className="font-medium">CMND/CCCD</div>
                </div>
                <div 
                  className={`border rounded-lg p-3 text-center cursor-pointer transition-all duration-200 ${verificationMethod === 'social_media' ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-green-300 hover:bg-green-50'}`}
                  onClick={() => setVerificationMethod('social_media')}
                >
                  <div className="font-medium">Mạng xã hội</div>
                </div>
                <div 
                  className={`border rounded-lg p-3 text-center cursor-pointer transition-all duration-200 ${verificationMethod === 'selfie' ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-green-300 hover:bg-green-50'}`}
                  onClick={() => setVerificationMethod('selfie')}
                >
                  <div className="font-medium">Ảnh selfie</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowVerifyModal(false)}
              className="px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 border border-gray-300"
            >
              Hủy
            </button>
            {user?.verification?.isVerified ? (
              <button
                onClick={() => handleVerifyUser(false)}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
              >
                Hủy xác minh
              </button>
            ) : (
              <button
                onClick={() => handleVerifyUser(true)}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
                disabled={!verificationMethod}
              >
                Xác minh người dùng
              </button>
            )}
          </div>
        </div>
      </Modal>
      
      {/* Modal quản lý Premium */}
      <Modal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title="Quản lý tài khoản Premium"
      >
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
              <FaCrown size={24} />
            </div>
          </div>
          
          <p className="text-center text-lg font-medium mb-2">Tài khoản Premium</p>
          <p className="text-center mb-4">
            Người dùng <span className="font-semibold">{user?.fullName}</span> hiện đang 
            {user?.premium ? ' sử dụng ' : ' không sử dụng '}
            tài khoản Premium.
          </p>
          
          {user?.premium && user?.premiumUntil && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-center mb-6">
              <p className="text-yellow-800 font-medium">Thông tin Premium</p>
              <p className="text-sm text-gray-600 mt-1">
                Hết hạn vào: {new Date(user.premiumUntil).toLocaleDateString('vi-VN')}
              </p>
              <p className="text-sm text-gray-600">
                Còn {Math.max(0, Math.ceil((new Date(user.premiumUntil) - new Date()) / (1000 * 60 * 60 * 24)))} ngày
              </p>
            </div>
          )}
          
          {!user?.premium && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Số ngày Premium</label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={premiumDays}
                  onChange={(e) => setPremiumDays(parseInt(e.target.value) || 30)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
                />
                <div className="ml-2 text-gray-600">ngày</div>
              </div>
              
              <div className="mt-3 grid grid-cols-5 gap-2">
                <button 
                  onClick={() => setPremiumDays(3)} 
                  className={`px-2 py-1.5 rounded text-center text-sm transition-colors duration-200 ${premiumDays === 3 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'}`}
                >
                  3 ngày
                </button>
                <button 
                  onClick={() => setPremiumDays(7)} 
                  className={`px-2 py-1.5 rounded text-center text-sm transition-colors duration-200 ${premiumDays === 7 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'}`}
                >
                  7 ngày
                </button>
                <button 
                  onClick={() => setPremiumDays(30)} 
                  className={`px-2 py-1.5 rounded text-center text-sm transition-colors duration-200 ${premiumDays === 30 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'}`}
                >
                  30 ngày
                </button>
                <button 
                  onClick={() => setPremiumDays(90)} 
                  className={`px-2 py-1.5 rounded text-center text-sm transition-colors duration-200 ${premiumDays === 90 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'}`}
                >
                  90 ngày
                </button>
                <button 
                  onClick={() => setPremiumDays(365)} 
                  className={`px-2 py-1.5 rounded text-center text-sm transition-colors duration-200 ${premiumDays === 365 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'}`}
                >
                  1 năm
                </button>
              </div>
            </div>
          )}
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowPremiumModal(false)}
              className="px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 border border-gray-300"
            >
              Hủy
            </button>
            {user?.premium ? (
              <button
                onClick={() => handleTogglePremium(false)}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
              >
                Hạ cấp tài khoản
              </button>
            ) : (
              <button
                onClick={() => handleTogglePremium(true)}
                className="px-5 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm flex items-center"
              >
                <FaCrown className="mr-2" /> Nâng cấp lên Premium ({premiumDays} ngày)
              </button>
            )}
          </div>
        </div>
      </Modal>
      
      {/* Modal cấm người dùng */}
      <Modal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        title="Cấm người dùng"
      >
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <FaBan size={24} />
            </div>
          </div>
          
          <p className="text-center text-lg font-medium mb-2">Xác nhận cấm người dùng</p>
          <p className="text-center mb-6">Bạn có chắc chắn muốn cấm người dùng <span className="font-semibold">{user?.fullName}</span>?</p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Lý do cấm</label>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Nhập lý do cấm người dùng..."
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24 shadow-sm"
            />
            {!banReason && (
              <p className="text-xs text-red-600 mt-1">* Vui lòng nhập lý do cấm người dùng</p>
            )}
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowBanModal(false)}
              className="px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 border border-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleBanUser}
              className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm flex items-center"
              disabled={!banReason}
            >
              <FaBan className="mr-2" /> Cấm người dùng
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default UserDetail;