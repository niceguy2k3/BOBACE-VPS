import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaFilter, FaUserEdit, FaTrash, FaUserShield, 
  FaCrown, FaUserCheck, FaBan, FaSync, FaDownload, 
  FaChartBar, FaEllipsisV, FaSort, FaSortUp, FaSortDown,
  FaUser, FaCheckSquare, FaSquare, FaUsers
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import Modal from '../../components/admin/Modal';
import { toast } from 'react-toastify';

const Users = () => {
  const { 
    isAdmin, 
    fetchUsers, 
    deleteUser, 
    updateUserRole, 
    verifyUser, 
    togglePremium, 
    banUser, 
    unbanUser, 
    loading: contextLoading
  } = useAdmin();
  
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });
  const navigate = useNavigate();
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    premium: '',
    verified: '',
    verificationStatus: '',
    role: '',
    active: '',
    sort: 'createdAt',
    order: 'desc'
  });
  
  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [newRole, setNewRole] = useState('user');
  const [verificationMethod, setVerificationMethod] = useState('');
  const [banReason, setBanReason] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    premium: 0,
    verified: 0,
    banned: 0,
    gender: { male: 0, female: 0, other: 0 }
  });
  
  // Advanced filters visibility
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Action menu
  const [actionMenuUser, setActionMenuUser] = useState(null);
  
  // Multi-select state
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActionMenu, setShowBulkActionMenu] = useState(false);
  const [showBulkVerifyModal, setShowBulkVerifyModal] = useState(false);
  const [showBulkPremiumModal, setShowBulkPremiumModal] = useState(false);
  const [showBulkBanModal, setShowBulkBanModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    loadUsers();
  }, [isAdmin, navigate, pagination.page, filters.sort, filters.order]);

  // Reset selected users when page changes
  useEffect(() => {
    setSelectedUsers([]);
    setSelectAll(false);
  }, [pagination.page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const data = await fetchUsers({
        page: pagination.page,
        limit: pagination.limit,
        sort: filters.sort,
        order: filters.order,
        search: filters.search,
        gender: filters.gender,
        premium: filters.premium,
        verified: filters.verified,
        role: filters.role,
        active: filters.active
      });
      
      if (data && data.users) {
        setUsers(data.users);
        setPagination(data.pagination);
        
        // Reset selected users when data changes
        setSelectedUsers([]);
        setSelectAll(false);
        
        // Calculate stats
        const totalUsers = data.users.length;
        const premiumUsers = data.users.filter(user => user.premium).length;
        const verifiedUsers = data.users.filter(user => user.verification?.isVerified).length;
        const bannedUsers = data.users.filter(user => user.banned).length;
        const maleUsers = data.users.filter(user => user.gender === 'male').length;
        const femaleUsers = data.users.filter(user => user.gender === 'female').length;
        const otherUsers = data.users.filter(user => user.gender !== 'male' && user.gender !== 'female').length;
        
        setStats({
          total: totalUsers,
          premium: premiumUsers,
          verified: verifiedUsers,
          banned: bannedUsers,
          gender: { male: maleUsers, female: femaleUsers, other: otherUsers }
        });
      } else {
        toast.error('Không thể tải dữ liệu người dùng');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle select/deselect single user
  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        // Deselect user
        const newSelected = prev.filter(id => id !== userId);
        // Update selectAll state
        if (newSelected.length === 0) {
          setSelectAll(false);
        }
        return newSelected;
      } else {
        // Select user
        const newSelected = [...prev, userId];
        // Update selectAll state
        if (newSelected.length === users.length) {
          setSelectAll(true);
        }
        return newSelected;
      }
    });
  };
  
  // Handle select/deselect all users
  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedUsers([]);
      setSelectAll(false);
    } else {
      // Select all
      setSelectedUsers(users.map(user => user._id));
      setSelectAll(true);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadUsers();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sort: field,
      order: prev.sort === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleDeleteUser = async () => {
    try {
      if (!selectedUser) return;
      
      await deleteUser(selectedUser._id);
      
      setUsers(prev => prev.filter(user => user._id !== selectedUser._id));
      toast.success('Đã xóa người dùng thành công');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Lỗi khi xóa người dùng');
    }
  };

  const handleUpdateRole = async () => {
    try {
      if (!selectedUser) return;
      
      await updateUserRole(selectedUser._id, newRole);
      
      setUsers(prev => prev.map(user => 
        user._id === selectedUser._id ? { ...user, role: newRole } : user
      ));
      
      toast.success('Đã cập nhật vai trò người dùng thành công');
      setShowRoleModal(false);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Lỗi khi cập nhật vai trò người dùng');
    }
  };

  const handleVerifyUser = async (isVerified) => {
    try {
      if (!selectedUser) return;
      
      await verifyUser(selectedUser._id, isVerified, verificationMethod);
      
      setUsers(prev => prev.map(user => 
        user._id === selectedUser._id ? { 
          ...user, 
          verification: { 
            isVerified, 
            method: isVerified ? verificationMethod : user.verification?.method 
          } 
        } : user
      ));
      
      toast.success(`Đã ${isVerified ? 'xác minh' : 'hủy xác minh'} người dùng thành công`);
      setShowVerifyModal(false);
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error(`Lỗi khi ${isVerified ? 'xác minh' : 'hủy xác minh'} người dùng`);
    }
  };

  // State cho số ngày premium
  const [premiumDays, setPremiumDays] = useState(30);

  const handleTogglePremium = async (isPremium) => {
    try {
      if (!selectedUser) return;
      
      await togglePremium(selectedUser._id, isPremium, isPremium ? premiumDays : null);
      
      // Tính ngày hết hạn mới
      const premiumUntil = isPremium 
        ? new Date(Date.now() + premiumDays * 24 * 60 * 60 * 1000) 
        : null;
      
      setUsers(prev => prev.map(user => 
        user._id === selectedUser._id ? { 
          ...user, 
          premium: isPremium,
          premiumUntil
        } : user
      ));
      
      toast.success(`Đã ${isPremium ? 'nâng cấp' : 'hạ cấp'} tài khoản thành công`);
      setShowPremiumModal(false);
    } catch (error) {
      console.error('Error toggling premium:', error);
      toast.error(`Lỗi khi ${isPremium ? 'nâng cấp' : 'hạ cấp'} tài khoản`);
    }
  };

  const handleBanUser = async () => {
    try {
      if (!selectedUser || !banReason) return;
      
      await banUser(selectedUser._id, banReason);
      
      setUsers(prev => prev.map(user => 
        user._id === selectedUser._id ? { 
          ...user, 
          banned: true,
          banReason: banReason
        } : user
      ));
      
      toast.success('Đã cấm người dùng thành công');
      setShowBanModal(false);
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Lỗi khi cấm người dùng');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await unbanUser(userId);
      
      setUsers(prev => prev.map(user => 
        user._id === userId ? { 
          ...user, 
          banned: false,
          banReason: null
        } : user
      ));
      
      toast.success('Đã bỏ cấm người dùng thành công');
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error('Lỗi khi bỏ cấm người dùng');
    }
  };
  
  // Bulk action handlers
  const handleBulkVerify = async (isVerified) => {
    try {
      if (selectedUsers.length === 0) return;
      
      setLoading(true);
      
      // Process users in batches to avoid overwhelming the server
      let successCount = 0;
      let errorCount = 0;
      
      for (const userId of selectedUsers) {
        try {
          await verifyUser(userId, isVerified, verificationMethod);
          successCount++;
        } catch (error) {
          console.error(`Error verifying user ${userId}:`, error);
          errorCount++;
        }
      }
      
      // Update UI
      setUsers(prev => prev.map(user => 
        selectedUsers.includes(user._id) ? { 
          ...user, 
          verification: { 
            isVerified, 
            method: isVerified ? verificationMethod : user.verification?.method 
          } 
        } : user
      ));
      
      // Show result message
      if (errorCount === 0) {
        toast.success(`Đã ${isVerified ? 'xác minh' : 'hủy xác minh'} ${successCount} người dùng thành công`);
      } else {
        toast.warning(`Đã xử lý ${successCount} người dùng thành công, ${errorCount} thất bại`);
      }
      
      // Reset selection
      setSelectedUsers([]);
      setSelectAll(false);
      setShowBulkVerifyModal(false);
    } catch (error) {
      console.error('Error in bulk verify:', error);
      toast.error(`Lỗi khi ${isVerified ? 'xác minh' : 'hủy xác minh'} người dùng hàng loạt`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleBulkTogglePremium = async (isPremium) => {
    try {
      if (selectedUsers.length === 0) return;
      
      setLoading(true);
      
      let successCount = 0;
      let errorCount = 0;
      
      // Tính ngày hết hạn mới
      const premiumUntil = isPremium 
        ? new Date(Date.now() + premiumDays * 24 * 60 * 60 * 1000) 
        : null;
      
      for (const userId of selectedUsers) {
        try {
          await togglePremium(userId, isPremium, isPremium ? premiumDays : null);
          successCount++;
        } catch (error) {
          console.error(`Error toggling premium for user ${userId}:`, error);
          errorCount++;
        }
      }
      
      // Update UI
      setUsers(prev => prev.map(user => 
        selectedUsers.includes(user._id) ? { 
          ...user, 
          premium: isPremium,
          premiumUntil
        } : user
      ));
      
      // Show result message
      if (errorCount === 0) {
        toast.success(`Đã ${isPremium ? 'nâng cấp' : 'hạ cấp'} ${successCount} tài khoản thành công`);
      } else {
        toast.warning(`Đã xử lý ${successCount} tài khoản thành công, ${errorCount} thất bại`);
      }
      
      // Reset selection
      setSelectedUsers([]);
      setSelectAll(false);
      setShowBulkPremiumModal(false);
    } catch (error) {
      console.error('Error in bulk toggle premium:', error);
      toast.error(`Lỗi khi ${isPremium ? 'nâng cấp' : 'hạ cấp'} tài khoản hàng loạt`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleBulkBan = async () => {
    try {
      if (selectedUsers.length === 0 || !banReason) return;
      
      setLoading(true);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const userId of selectedUsers) {
        try {
          await banUser(userId, banReason);
          successCount++;
        } catch (error) {
          console.error(`Error banning user ${userId}:`, error);
          errorCount++;
        }
      }
      
      // Update UI
      setUsers(prev => prev.map(user => 
        selectedUsers.includes(user._id) ? { 
          ...user, 
          banned: true,
          banReason: banReason
        } : user
      ));
      
      // Show result message
      if (errorCount === 0) {
        toast.success(`Đã cấm ${successCount} người dùng thành công`);
      } else {
        toast.warning(`Đã cấm ${successCount} người dùng thành công, ${errorCount} thất bại`);
      }
      
      // Reset selection
      setSelectedUsers([]);
      setSelectAll(false);
      setShowBulkBanModal(false);
    } catch (error) {
      console.error('Error in bulk ban:', error);
      toast.error('Lỗi khi cấm người dùng hàng loạt');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBulkUnban = async () => {
    try {
      if (selectedUsers.length === 0) return;
      
      setLoading(true);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const userId of selectedUsers) {
        try {
          await unbanUser(userId);
          successCount++;
        } catch (error) {
          console.error(`Error unbanning user ${userId}:`, error);
          errorCount++;
        }
      }
      
      // Update UI
      setUsers(prev => prev.map(user => 
        selectedUsers.includes(user._id) ? { 
          ...user, 
          banned: false,
          banReason: null
        } : user
      ));
      
      // Show result message
      if (errorCount === 0) {
        toast.success(`Đã bỏ cấm ${successCount} người dùng thành công`);
      } else {
        toast.warning(`Đã bỏ cấm ${successCount} người dùng thành công, ${errorCount} thất bại`);
      }
      
      // Reset selection
      setSelectedUsers([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Error in bulk unban:', error);
      toast.error('Lỗi khi bỏ cấm người dùng hàng loạt');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBulkDelete = async () => {
    try {
      if (selectedUsers.length === 0) return;
      
      setLoading(true);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const userId of selectedUsers) {
        try {
          await deleteUser(userId);
          successCount++;
        } catch (error) {
          console.error(`Error deleting user ${userId}:`, error);
          errorCount++;
        }
      }
      
      // Update UI by removing deleted users
      setUsers(prev => prev.filter(user => !selectedUsers.includes(user._id)));
      
      // Show result message
      if (errorCount === 0) {
        toast.success(`Đã xóa ${successCount} người dùng thành công`);
      } else {
        toast.warning(`Đã xóa ${successCount} người dùng thành công, ${errorCount} thất bại`);
      }
      
      // Reset selection
      setSelectedUsers([]);
      setSelectAll(false);
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error('Lỗi khi xóa người dùng hàng loạt');
    } finally {
      setLoading(false);
    }
  };
  
  const exportToCSV = () => {
    try {
      // Tạo dữ liệu CSV
      const headers = ['ID', 'Họ tên', 'Email', 'Giới tính', 'Vai trò', 'Premium', 'Đã xác minh', 'Bị cấm', 'Ngày đăng ký'];
      
      const csvData = users.map(user => [
        user._id,
        user.fullName,
        user.email,
        user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác',
        user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? 'Moderator' : 'Người dùng',
        user.premium ? 'Có' : 'Không',
        user.verification?.isVerified ? 'Có' : 'Không',
        user.banned ? 'Có' : 'Không',
        new Date(user.createdAt).toLocaleDateString('vi-VN')
      ]);
      
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');
      
      // Tạo file và download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `danh-sach-nguoi-dung-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Đã xuất dữ liệu thành công');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Lỗi khi xuất dữ liệu');
    }
  };
  
  const getSortIcon = (field) => {
    if (filters.sort !== field) return <FaSort className="text-gray-400" />;
    return filters.order === 'asc' ? <FaSortUp className="text-amber-500" /> : <FaSortDown className="text-amber-500" />;
  };
  
  const renderActionMenu = (user) => {
    if (actionMenuUser !== user._id) return null;
    
    return (
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
        <button
          onClick={() => {
            navigate(`/admin/users/${user._id}`);
            setActionMenuUser(null);
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 flex items-center"
        >
          <FaUserEdit className="mr-2" /> Xem chi tiết
        </button>
        
        <button
          onClick={() => {
            setSelectedUser(user);
            setNewRole(user.role || 'user');
            setShowRoleModal(true);
            setActionMenuUser(null);
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 flex items-center"
        >
          <FaUserShield className="mr-2" /> Cập nhật vai trò
        </button>
        
        <button
          onClick={() => {
            setSelectedUser(user);
            setVerificationMethod(user.verification?.method || '');
            setShowVerifyModal(true);
            setActionMenuUser(null);
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 flex items-center"
        >
          <FaUserCheck className="mr-2" /> {user.verification?.isVerified ? 'Hủy xác minh' : 'Xác minh'}
        </button>
        
        <button
          onClick={() => {
            setSelectedUser(user);
            setShowPremiumModal(true);
            setActionMenuUser(null);
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 flex items-center"
        >
          <FaCrown className="mr-2" /> {user.premium ? 'Hạ cấp tài khoản' : 'Nâng cấp Premium'}
        </button>
        
        {user.banned ? (
          <button
            onClick={() => {
              handleUnbanUser(user._id);
              setActionMenuUser(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center"
          >
            <FaBan className="mr-2" /> Bỏ cấm người dùng
          </button>
        ) : (
          <button
            onClick={() => {
              setSelectedUser(user);
              setBanReason('');
              setShowBanModal(true);
              setActionMenuUser(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"
          >
            <FaBan className="mr-2" /> Cấm người dùng
          </button>
        )}
        
        <button
          onClick={() => {
            setSelectedUser(user);
            setShowDeleteModal(true);
            setActionMenuUser(null);
          }}
          className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"
        >
          <FaTrash className="mr-2" /> Xóa người dùng
        </button>
      </div>
    );
  };

  const columns = [
    {
      header: 'Tên',
      accessor: 'fullName',
      cell: (value, row) => {
        if (!row) return null;
        return (
          <div className="flex items-center">
            <img 
              src={row.avatar || 'https://via.placeholder.com/40'} 
              alt={row.fullName || 'User'} 
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
            <div>
              <p className="font-medium text-gray-800">{row.fullName || 'N/A'}</p>
              <p className="text-sm text-gray-500">{row.email || 'N/A'}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Thông tin',
      accessor: 'info',
      cell: (value, row) => {
        if (!row) return null;
        return (
          <div>
            <p className="text-sm">
              <span className="font-medium">Giới tính:</span> {
                row.gender === 'male' ? 'Nam' : 
                row.gender === 'female' ? 'Nữ' : 'Khác'
              }
            </p>
            <p className="text-sm">
              <span className="font-medium">Tuổi:</span> {
                row.birthDate ? new Date().getFullYear() - new Date(row.birthDate).getFullYear() : 'N/A'
              }
            </p>
            <p className="text-sm">
              <span className="font-medium">Vai trò:</span> {
                row.role === 'admin' ? 'Admin' : 
                row.role === 'moderator' ? 'Moderator' : 'Người dùng'
              }
            </p>
          </div>
        );
      }
    },
    {
      header: 'Trạng thái',
      accessor: 'status',
      cell: (value, row) => {
        if (!row) return null;
        return (
          <div className="space-y-1">
            {row.premium && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <FaCrown className="mr-1" /> Premium
              </span>
            )}
            {row.verification?.isVerified && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <FaUserCheck className="mr-1" /> Đã xác minh
              </span>
            )}
            {row.banned && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <FaBan className="mr-1" /> Đã cấm
              </span>
            )}
            {row.online ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Online
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Offline
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Ngày đăng ký',
      accessor: 'createdAt',
      cell: (value, row) => {
        if (!row || !row.createdAt) return 'N/A';
        try {
          return new Date(row.createdAt).toLocaleDateString('vi-VN');
        } catch (e) {
          return 'N/A';
        }
      }
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      cell: (value, row) => {
        if (!row || !row._id) return null;
        return (
          <div className="flex space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/users/${row._id}`);
              }}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="Xem chi tiết"
            >
              <FaUserEdit size={18} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(row);
                setNewRole(row.role || 'user');
                setShowRoleModal(true);
              }}
              className="p-1 text-purple-600 hover:text-purple-800"
              title="Cập nhật vai trò"
            >
              <FaUserShield size={18} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(row);
                setVerificationMethod(row.verification?.method || '');
                setShowVerifyModal(true);
              }}
              className="p-1 text-green-600 hover:text-green-800"
              title="Xác minh người dùng"
            >
              <FaUserCheck size={18} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(row);
                setShowPremiumModal(true);
              }}
              className="p-1 text-yellow-600 hover:text-yellow-800"
              title="Quản lý Premium"
            >
              <FaCrown size={18} />
            </button>
            {row.banned ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(row);
                  // Thêm timeout để đảm bảo selectedUser được cập nhật trước khi gọi handleUnbanUser
                  setTimeout(() => {
                    handleUnbanUser(selectedUser._id);
                  }, 0);
                }}
                className="p-1 text-green-600 hover:text-green-800"
                title="Bỏ cấm người dùng"
              >
                <FaBan size={18} />
              </button>
            ) : (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(row);
                  setBanReason('');
                  // Thêm timeout để đảm bảo selectedUser được cập nhật trước khi hiển thị modal
                  setTimeout(() => {
                    setShowBanModal(true);
                  }, 0);
                }}
                className="p-1 text-red-600 hover:text-red-800"
                title="Cấm người dùng"
              >
                <FaBan size={18} />
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(row);
                setShowDeleteModal(true);
              }}
              className="p-1 text-red-600 hover:text-red-800"
              title="Xóa người dùng"
            >
              <FaTrash size={18} />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <AdminLayout>
      <div className="p-6 bg-gradient-to-b from-amber-50 to-white min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-800 mb-2">Quản lý người dùng</h1>
          <p className="text-amber-600">Quản lý tất cả người dùng trong hệ thống</p>
        </div>
        
        {/* Thống kê nhanh */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-amber-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-800">{pagination.total || 0}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <FaUserCheck className="text-amber-500 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Tài khoản Premium</p>
                <p className="text-2xl font-bold text-gray-800">{stats.premium}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaCrown className="text-yellow-500 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Đã xác minh</p>
                <p className="text-2xl font-bold text-gray-800">{stats.verified}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaUserCheck className="text-green-500 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Bị cấm</p>
                <p className="text-2xl font-bold text-gray-800">{stats.banned}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <FaBan className="text-red-500 text-xl" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Thanh công cụ */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div className="flex items-center mb-4 md:mb-0">
              <h2 className="text-xl font-semibold text-amber-800 mr-4">Danh sách người dùng</h2>
              <button
                onClick={loadUsers}
                className="bg-amber-100 text-amber-700 p-2 rounded-full hover:bg-amber-200 transition-colors"
                title="Làm mới dữ liệu"
              >
                <FaSync className={loading ? "animate-spin" : ""} />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              {/* Hiển thị menu thao tác hàng loạt khi có người dùng được chọn */}
              {selectedUsers.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowBulkActionMenu(!showBulkActionMenu)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                  >
                    <FaUsers className="mr-2" /> Thao tác ({selectedUsers.length}) {showBulkActionMenu ? "▲" : "▼"}
                  </button>
                  
                  {showBulkActionMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 py-1">
                      <button
                        onClick={() => {
                          setVerificationMethod('');
                          setShowBulkVerifyModal(true);
                          setShowBulkActionMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 flex items-center"
                      >
                        <FaUserCheck className="mr-2" /> Xác minh người dùng
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowBulkPremiumModal(true);
                          setShowBulkActionMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 flex items-center"
                      >
                        <FaCrown className="mr-2" /> Quản lý Premium
                      </button>
                      
                      {/* Kiểm tra xem có người dùng bị cấm không để hiển thị nút phù hợp */}
                      {selectedUsers.some(id => users.find(user => user._id === id)?.banned) ? (
                        <button
                          onClick={() => {
                            handleBulkUnban();
                            setShowBulkActionMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center"
                        >
                          <FaBan className="mr-2" /> Bỏ cấm người dùng
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setBanReason('');
                            setShowBulkBanModal(true);
                            setShowBulkActionMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"
                        >
                          <FaBan className="mr-2" /> Cấm người dùng
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setShowBulkDeleteModal(true);
                          setShowBulkActionMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"
                      >
                        <FaTrash className="mr-2" /> Xóa người dùng
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors flex items-center justify-center"
              >
                <FaFilter className="mr-2" /> Bộ lọc {showAdvancedFilters ? "▲" : "▼"}
              </button>
              
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Xuất CSV
              </button>
            </div>
          </div>
          
          {/* Tìm kiếm cơ bản */}
          <form onSubmit={handleSearch} className="flex w-full mb-4">
            <div className="relative flex-grow">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Tìm kiếm theo tên, email..."
                className="w-full border border-gray-300 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-500 text-white rounded-r-lg px-6 py-2 hover:bg-amber-600 transition-colors flex items-center justify-center"
            >
              <FaSearch className="mr-2" /> Tìm
            </button>
          </form>
          
          {/* Bộ lọc nâng cao */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                <select
                  name="gender"
                  value={filters.gender}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                >
                  <option value="">Tất cả</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Premium</label>
                <select
                  name="premium"
                  value={filters.premium}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                >
                  <option value="">Tất cả</option>
                  <option value="true">Có</option>
                  <option value="false">Không</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đã xác minh</label>
                <select
                  name="verified"
                  value={filters.verified}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                >
                  <option value="">Tất cả</option>
                  <option value="true">Có</option>
                  <option value="false">Không</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                >
                  <option value="">Tất cả</option>
                  <option value="user">Người dùng</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  name="active"
                  value={filters.active}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                >
                  <option value="">Tất cả</option>
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({
                      search: '',
                      gender: '',
                      premium: '',
                      verified: '',
                      role: '',
                      active: '',
                      sort: 'createdAt',
                      order: 'desc'
                    });
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="w-full bg-gray-200 text-gray-800 rounded-lg px-4 py-2 hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <FaFilter className="mr-2" /> Đặt lại
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Bảng dữ liệu */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-amber-50">
                <tr>
                  {/* Checkbox chọn tất cả */}
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAll();
                        }}
                        className="text-amber-600 hover:text-amber-800 focus:outline-none"
                      >
                        {selectAll ? <FaCheckSquare size={18} /> : <FaSquare size={18} />}
                      </button>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('fullName')}>
                    <div className="flex items-center">
                      Tên người dùng
                      {getSortIcon('fullName')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('email')}>
                    <div className="flex items-center">
                      Email
                      {getSortIcon('email')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('role')}>
                    <div className="flex items-center">
                      Vai trò
                      {getSortIcon('role')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center">
                      Ngày đăng ký
                      {getSortIcon('createdAt')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-5 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-5 text-center text-gray-500">
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr 
                      key={user._id} 
                      className={`hover:bg-amber-50 transition-colors ${user.banned ? 'bg-red-50' : ''} ${selectedUsers.includes(user._id) ? 'bg-amber-50' : ''}`}
                    >
                      {/* Checkbox chọn người dùng */}
                      <td className="px-3 py-5 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectUser(user._id);
                            }}
                            className="text-amber-600 hover:text-amber-800 focus:outline-none"
                          >
                            {selectedUsers.includes(user._id) ? <FaCheckSquare size={18} /> : <FaSquare size={18} />}
                          </button>
                        </div>
                      </td>
                      <td 
                        className="px-6 py-5 whitespace-nowrap cursor-pointer"
                        onClick={() => navigate(`/admin/users/${user._id}`)}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <img 
                              className="h-10 w-10 rounded-full object-cover border-2 border-amber-200" 
                              src={user.avatar}  
                            />
                            {user.online && (
                              <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 border-2 border-white"></span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-xs text-gray-500">
                              {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}
                              {user.birthDate && `, ${new Date().getFullYear() - new Date(user.birthDate).getFullYear()} tuổi`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td 
                        className="px-6 py-5 whitespace-nowrap cursor-pointer"
                        onClick={() => navigate(`/admin/users/${user._id}`)}
                      >
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td 
                        className="px-6 py-5 whitespace-nowrap cursor-pointer"
                        onClick={() => navigate(`/admin/users/${user._id}`)}
                      >
                        {user.role === 'admin' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        ) : user.role === 'moderator' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Moderator
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Người dùng
                          </span>
                        )}
                      </td>
                      <td 
                        className="px-6 py-5 whitespace-nowrap cursor-pointer"
                        onClick={() => navigate(`/admin/users/${user._id}`)}
                      >
                        <div className="flex flex-col space-y-1">
                          {user.premium && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              <FaCrown className="mr-1" /> Premium
                              {user.premiumUntil && (
                                <span className="ml-1">
                                  ({new Date(user.premiumUntil) > new Date() 
                                    ? `còn ${Math.ceil((new Date(user.premiumUntil) - new Date()) / (1000 * 60 * 60 * 24))} ngày` 
                                    : 'hết hạn'}
                                  )
                                </span>
                              )}
                            </span>
                          )}
                          {user.verification?.isVerified && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              <FaUserCheck className="mr-1" /> Đã xác minh
                            </span>
                          )}
                          {user.banned && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              <FaBan className="mr-1" /> Đã cấm
                            </span>
                          )}
                        </div>
                      </td>
                      <td 
                        className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                        onClick={() => navigate(`/admin/users/${user._id}`)}
                      >
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Phân trang */}
          {pagination.pages > 1 && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-amber-50">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.page === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Trước
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                  disabled={pagination.page === pagination.pages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.page === pagination.pages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{users.length}</span> trong tổng số{' '}
                    <span className="font-medium">{pagination.total}</span> người dùng
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page === 1 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Trang đầu</span>
                      <span>«</span>
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page === 1 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Trang trước</span>
                      <span>‹</span>
                    </button>
                    
                    {/* Hiển thị các nút trang */}
                    {[...Array(pagination.pages).keys()].map(i => {
                      const pageNumber = i + 1;
                      // Chỉ hiển thị trang hiện tại, trang trước và trang sau
                      if (
                        pageNumber === 1 || 
                        pageNumber === pagination.pages || 
                        (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.page === pageNumber
                                ? 'z-10 bg-amber-50 border-amber-500 text-amber-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        (pageNumber === 2 && pagination.page > 3) ||
                        (pageNumber === pagination.pages - 1 && pagination.page < pagination.pages - 2)
                      ) {
                        // Hiển thị dấu ... nếu có khoảng cách
                        return (
                          <span
                            key={pageNumber}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page === pagination.pages 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Trang sau</span>
                      <span>›</span>
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.pages)}
                      disabled={pagination.page === pagination.pages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page === pagination.pages 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Trang cuối</span>
                      <span>»</span>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal xóa người dùng */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xóa người dùng"
      >
        <div className="p-6">
          <div className="flex items-center justify-center text-red-600 mb-4">
            <FaTrash size={48} />
          </div>
          <p className="text-center mb-4 text-lg">Bạn có chắc chắn muốn xóa người dùng</p>
          <p className="text-center font-semibold mb-6 text-xl">{selectedUser?.fullName}</p>
          <p className="mb-6 text-red-600 text-sm text-center">
            Lưu ý: Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến người dùng này.
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleDeleteUser}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Xóa
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
          <div className="flex items-center justify-center text-purple-600 mb-4">
            <FaUserShield size={48} />
          </div>
          <p className="text-center mb-6">
            Cập nhật vai trò cho người dùng <span className="font-semibold">{selectedUser?.fullName}</span>
          </p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
            <div className="grid grid-cols-3 gap-4">
              <div 
                className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  newRole === 'user' 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setNewRole('user')}
              >
                <FaUser className="mx-auto text-2xl mb-2 text-gray-600" />
                <div className="font-medium">Người dùng</div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  newRole === 'moderator' 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setNewRole('moderator')}
              >
                <FaUserShield className="mx-auto text-2xl mb-2 text-blue-600" />
                <div className="font-medium">Moderator</div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  newRole === 'admin' 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setNewRole('admin')}
              >
                <FaUserShield className="mx-auto text-2xl mb-2 text-purple-600" />
                <div className="font-medium">Admin</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowRoleModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleUpdateRole}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Cập nhật
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
          <div className="flex items-center justify-center text-green-600 mb-4">
            <FaUserCheck size={48} />
          </div>
          <p className="text-center mb-6">
            {selectedUser?.verification?.isVerified 
              ? `Bạn có muốn hủy xác minh người dùng ${selectedUser?.fullName}?`
              : `Xác minh người dùng ${selectedUser?.fullName}`}
          </p>
          
          {!selectedUser?.verification?.isVerified && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức xác minh</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    verificationMethod === 'phone' 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setVerificationMethod('phone')}
                >
                  <div className="font-medium">Điện thoại</div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    verificationMethod === 'email' 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setVerificationMethod('email')}
                >
                  <div className="font-medium">Email</div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    verificationMethod === 'government_id' 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setVerificationMethod('government_id')}
                >
                  <div className="font-medium">CMND/CCCD</div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    verificationMethod === 'social_media' 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setVerificationMethod('social_media')}
                >
                  <div className="font-medium">Mạng xã hội</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowVerifyModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            {selectedUser?.verification?.isVerified ? (
              <button
                onClick={() => handleVerifyUser(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hủy xác minh
              </button>
            ) : (
              <button
                onClick={() => handleVerifyUser(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                disabled={!verificationMethod}
              >
                Xác minh
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
          <div className="flex items-center justify-center text-yellow-600 mb-4">
            <FaCrown size={48} />
          </div>
          <p className="text-center mb-4">
            Người dùng <span className="font-semibold">{selectedUser?.fullName}</span> hiện đang 
            {selectedUser?.premium ? ' sử dụng ' : ' không sử dụng '}
            tài khoản Premium.
          </p>
          
          {selectedUser?.premium && selectedUser?.premiumUntil && (
            <p className="text-center mb-6 text-sm text-gray-600">
              Hết hạn vào: {new Date(selectedUser.premiumUntil).toLocaleDateString('vi-VN')} 
              ({Math.max(0, Math.ceil((new Date(selectedUser.premiumUntil) - new Date()) / (1000 * 60 * 60 * 24)))} ngày còn lại)
            </p>
          )}
          
          {!selectedUser?.premium && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Số ngày Premium</label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={premiumDays}
                  onChange={(e) => setPremiumDays(parseInt(e.target.value) || 30)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <div className="ml-2 text-gray-600">ngày</div>
              </div>
              
              <div className="mt-2 flex justify-between text-sm text-gray-600">
                <button 
                  onClick={() => setPremiumDays(3)} 
                  className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  3 ngày
                </button>
                <button 
                  onClick={() => setPremiumDays(7)} 
                  className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  7 ngày
                </button>
                <button 
                  onClick={() => setPremiumDays(30)} 
                  className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  30 ngày
                </button>
                <button 
                  onClick={() => setPremiumDays(90)} 
                  className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  90 ngày
                </button>
                <button 
                  onClick={() => setPremiumDays(365)} 
                  className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  1 năm
                </button>
              </div>
            </div>
          )}
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowPremiumModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            {selectedUser?.premium ? (
              <button
                onClick={() => handleTogglePremium(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hạ cấp tài khoản
              </button>
            ) : (
              <button
                onClick={() => handleTogglePremium(true)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Nâng cấp lên Premium ({premiumDays} ngày)
              </button>
            )}
          </div>
        </div>
      </Modal>
      
      {/* Modal cấm người dùng */}
      {showBanModal && selectedUser && (
        <Modal
          isOpen={showBanModal}
          onClose={() => setShowBanModal(false)}
          title="Cấm người dùng"
        >
          <div className="p-6">
            <div className="flex items-center justify-center text-red-600 mb-4">
              <FaBan size={48} />
            </div>
            <p className="text-center mb-6">
              Bạn có chắc chắn muốn cấm người dùng <span className="font-semibold">{selectedUser?.fullName}</span>?
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Lý do cấm</label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Nhập lý do cấm người dùng..."
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24"
              />
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowBanModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleBanUser}
                className={`px-4 py-2 ${!banReason ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg transition-colors`}
                disabled={!banReason}
              >
                Cấm người dùng
              </button>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Modal xác minh hàng loạt */}
      <Modal
        isOpen={showBulkVerifyModal}
        onClose={() => setShowBulkVerifyModal(false)}
        title="Xác minh người dùng hàng loạt"
      >
        <div className="p-6">
          <div className="flex items-center justify-center text-green-600 mb-4">
            <FaUserCheck size={48} />
          </div>
          <p className="text-center mb-6">
            Bạn đang thực hiện xác minh cho <span className="font-semibold">{selectedUsers.length}</span> người dùng
          </p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức xác minh</label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  verificationMethod === 'phone' 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setVerificationMethod('phone')}
              >
                <div className="font-medium">Điện thoại</div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  verificationMethod === 'email' 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setVerificationMethod('email')}
              >
                <div className="font-medium">Email</div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  verificationMethod === 'government_id' 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setVerificationMethod('government_id')}
              >
                <div className="font-medium">CMND/CCCD</div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  verificationMethod === 'social_media' 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setVerificationMethod('social_media')}
              >
                <div className="font-medium">Mạng xã hội</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowBulkVerifyModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => handleBulkVerify(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={!verificationMethod || loading}
            >
              {loading ? 'Đang xử lý...' : 'Xác minh'}
            </button>
            <button
              onClick={() => handleBulkVerify(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Hủy xác minh'}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Modal quản lý Premium hàng loạt */}
      <Modal
        isOpen={showBulkPremiumModal}
        onClose={() => setShowBulkPremiumModal(false)}
        title="Quản lý tài khoản Premium hàng loạt"
      >
        <div className="p-6">
          <div className="flex items-center justify-center text-yellow-600 mb-4">
            <FaCrown size={48} />
          </div>
          <p className="text-center mb-4">
            Bạn đang thực hiện thay đổi trạng thái Premium cho <span className="font-semibold">{selectedUsers.length}</span> người dùng
          </p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Số ngày Premium</label>
            <div className="flex items-center">
              <input
                type="number"
                min="1"
                max="365"
                value={premiumDays}
                onChange={(e) => setPremiumDays(parseInt(e.target.value) || 30)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <div className="ml-2 text-gray-600">ngày</div>
            </div>
            
            <div className="mt-2 flex justify-between text-sm text-gray-600">
              <button 
                onClick={() => setPremiumDays(3)} 
                className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                3 ngày
              </button>
              <button 
                onClick={() => setPremiumDays(7)} 
                className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                7 ngày
              </button>
              <button 
                onClick={() => setPremiumDays(30)} 
                className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                30 ngày
              </button>
              <button 
                onClick={() => setPremiumDays(90)} 
                className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                90 ngày
              </button>
              <button 
                onClick={() => setPremiumDays(365)} 
                className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                1 năm
              </button>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowBulkPremiumModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => handleBulkTogglePremium(true)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : `Nâng cấp lên Premium (${premiumDays} ngày)`}
            </button>
            <button
              onClick={() => handleBulkTogglePremium(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Hạ cấp tài khoản'}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Modal cấm người dùng hàng loạt */}
      <Modal
        isOpen={showBulkBanModal}
        onClose={() => setShowBulkBanModal(false)}
        title="Cấm người dùng hàng loạt"
      >
        <div className="p-6">
          <div className="flex items-center justify-center text-red-600 mb-4">
            <FaBan size={48} />
          </div>
          <p className="text-center mb-6">
            Bạn có chắc chắn muốn cấm <span className="font-semibold">{selectedUsers.length}</span> người dùng?
          </p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Lý do cấm</label>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Nhập lý do cấm người dùng..."
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24"
            />
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowBulkBanModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleBulkBan}
              className={`px-4 py-2 ${!banReason ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg transition-colors`}
              disabled={!banReason || loading}
            >
              {loading ? 'Đang xử lý...' : 'Cấm người dùng'}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Modal xóa người dùng hàng loạt */}
      <Modal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        title="Xóa người dùng hàng loạt"
      >
        <div className="p-6">
          <div className="flex items-center justify-center text-red-600 mb-4">
            <FaTrash size={48} />
          </div>
          <p className="text-center mb-4 text-lg">Bạn có chắc chắn muốn xóa <span className="font-semibold">{selectedUsers.length}</span> người dùng?</p>
          <p className="mb-6 text-red-600 text-sm text-center">
            Lưu ý: Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến những người dùng này.
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowBulkDeleteModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Xóa'}
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default Users;