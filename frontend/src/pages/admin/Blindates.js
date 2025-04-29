import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import { getBlindates, getBlindateById, updateBlindateStatus, deleteBlinddate } from '../../services/admin.service';
import { FaCalendarAlt, FaFilter, FaSearch, FaUserFriends, FaEye, FaCheck, FaTimes, FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaBan, FaCalendarCheck } from 'react-icons/fa';
import '../../styles/blindate.css';

const Blindates = () => {
  const [blindates, setBlinddates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBlindate, setSelectedBlindate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const searchTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const fetchBlinddates = async (page = 1, status = '', search = '', sort = 'createdAt', order = 'desc') => {
    setLoading(true);
    try {
      const response = await getBlindates({
        page,
        limit: 10,
        status,
        search,
        sort,
        order
      });
      
      setBlinddates(response.blindates);
      setTotalPages(response.pagination.pages);
      setCurrentPage(response.pagination.page);
    } catch (error) {
      console.error('Error fetching blindates:', error);
      toast.error('Không thể tải danh sách cuộc hẹn');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set a new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay
    
    // Cleanup function to clear timeout if component unmounts or searchTerm changes again
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Fetch data when debounced search term or other filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchBlinddates(1, statusFilter, debouncedSearchTerm, sortBy, sortOrder);
  }, [debouncedSearchTerm, statusFilter, sortBy, sortOrder]);
  
  // Handle page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchBlinddates(currentPage, statusFilter, debouncedSearchTerm, sortBy, sortOrder);
    }
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Không cần gọi fetchBlinddates ở đây nữa vì useEffect sẽ xử lý khi debouncedSearchTerm thay đổi
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetail = (blindate) => {
    setSelectedBlindate(blindate);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedBlindate(null);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateBlindateStatus(id, status);
      
      toast.success('Cập nhật trạng thái thành công');
      fetchBlinddates(currentPage, statusFilter, debouncedSearchTerm, sortBy, sortOrder);
      
      if (selectedBlindate && selectedBlindate._id === id) {
        setSelectedBlindate({...selectedBlindate, status});
      }
    } catch (error) {
      console.error('Error updating blindate status:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaHourglassHalf className="text-amber-500" />;
      case 'accepted': return <FaCheck className="text-green-500" />;
      case 'completed': return <FaCheckCircle className="text-blue-500" />;
      case 'rejected': return <FaTimesCircle className="text-red-500" />;
      case 'cancelled': return <FaBan className="text-gray-500" />;
      default: return <FaHourglassHalf className="text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Đang chờ';
      case 'accepted': return 'Đã chấp nhận';
      case 'completed': return 'Đã hoàn thành';
      case 'rejected': return 'Đã từ chối';
      case 'cancelled': return 'Đã hủy';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: '_id',
      cell: (value) => <span className="text-xs font-mono">{typeof value === 'string' ? `${value.substring(0, 10)}...` : value}</span>
    },
    {
      header: 'Người dùng',
      accessor: 'users',
      cell: (users) => (
        <div className="flex flex-col">
          {users && users.map(user => user && (
            <div key={user._id} className="flex items-center mb-1">
              {user && user.avatar && (
                <img 
                  src={user.avatar} 
                  alt={user.fullName || 'User'} 
                  className="w-6 h-6 rounded-full mr-2 object-cover border border-amber-200"
                />
              )}
              <span className="text-sm font-medium text-amber-800">
                {user ? user.fullName : 'Unknown User'}
              </span>
            </div>
          ))}
        </div>
      )
    },
    {
      header: 'Trạng thái',
      accessor: 'status',
      cell: (value) => {
        let statusClass = '';
        switch (value) {
          case 'pending':
            statusClass = 'bg-amber-100 text-amber-800 border border-amber-300';
            break;
          case 'accepted':
            statusClass = 'bg-green-100 text-green-800 border border-green-300';
            break;
          case 'completed':
            statusClass = 'bg-blue-100 text-blue-800 border border-blue-300';
            break;
          case 'rejected':
            statusClass = 'bg-red-100 text-red-800 border border-red-300';
            break;
          case 'cancelled':
            statusClass = 'bg-gray-100 text-gray-800 border border-gray-300';
            break;
          default:
            statusClass = 'bg-gray-100 text-gray-800 border border-gray-300';
        }
        
        return (
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center justify-center w-fit ${statusClass}`}>
            <span className="mr-1.5">{getStatusIcon(value)}</span>
            {getStatusText(value)}
          </span>
        );
      }
    },
    {
      header: 'Ngày tạo',
      accessor: 'createdAt',
      cell: (value) => (
        <div className="text-sm text-amber-800">
          {new Date(value).toLocaleDateString('vi-VN')}
          <div className="text-xs text-amber-600">
            {new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )
    },
    {
      header: 'Ngày hẹn',
      accessor: 'dateDetails',
      cell: (dateDetails, row) => {
        // Check if dateDetails exists and has scheduledFor property
        const scheduledFor = dateDetails && dateDetails.scheduledFor;
        
        // Check if we have date in the row object (for mock data)
        const date = row.date;
        const time = row.time;
        
        if (scheduledFor) {
          return (
            <div className="text-sm text-amber-800">
              {new Date(scheduledFor).toLocaleDateString('vi-VN')}
              <div className="text-xs text-amber-600">
                {new Date(scheduledFor).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        } else if (date) {
          return (
            <div className="text-sm text-amber-800">
              {new Date(date).toLocaleDateString('vi-VN')}
              <div className="text-xs text-amber-600">
                {time || new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        } else {
          return <span className="text-xs italic text-amber-600">Chưa lên lịch</span>;
        }
      }
    },
    {
      header: 'Thao tác',
      accessor: '_id',
      cell: (value, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetail(row)}
            className="boba-button-secondary px-3 py-1.5 flex items-center text-xs"
          >
            <FaEye className="mr-1.5" /> Chi tiết
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="boba-bg min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-amber-800 flex items-center">
              <FaCalendarAlt className="mr-3 text-amber-600" /> Quản lý Cuộc hẹn Blind Date
            </h1>
            <div className="text-sm text-amber-700">
              Tổng số: <span className="font-bold">{blindates.length > 0 ? blindates.length : 0}</span> cuộc hẹn
            </div>
          </div>
          
          <div className="boba-card p-6 mb-6 transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 mb-4 md:mb-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFilter className="text-amber-500" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    className="pl-10 pr-4 py-2.5 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-amber-800 shadow-sm"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="pending">Đang chờ</option>
                    <option value="accepted">Đã chấp nhận</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="rejected">Đã từ chối</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarCheck className="text-amber-500" />
                  </div>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="pl-10 pr-4 py-2.5 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-amber-800 shadow-sm"
                  >
                    <option value="createdAt-desc">Mới nhất trước</option>
                    <option value="createdAt-asc">Cũ nhất trước</option>
                    <option value="dateDetails.scheduledFor-asc">Ngày hẹn (sớm nhất)</option>
                    <option value="dateDetails.scheduledFor-desc">Ngày hẹn (muộn nhất)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <DataTable
              columns={columns}
              data={blindates}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
      
      {showDetailModal && selectedBlindate && (
        <Modal
          title={
            <div className="flex items-center text-amber-800">
              <FaCalendarAlt className="mr-2 text-amber-600" /> 
              Chi tiết cuộc hẹn
            </div>
          }
          onClose={handleCloseModal}
        >
          <div className="p-4 custom-scrollbar overflow-y-auto max-h-[70vh]">
            <div className="mb-6 bg-amber-50 p-4 rounded-xl border border-amber-200">
              <h3 className="font-bold text-lg mb-3 text-amber-800 flex items-center">
                <FaUserFriends className="mr-2 text-amber-600" /> Thông tin người dùng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedBlindate && selectedBlindate.users && Array.isArray(selectedBlindate.users) && selectedBlindate.users.map(user => user && (
                  <div key={user._id} className="bg-white p-4 rounded-lg shadow-sm border border-amber-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      {user && user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.fullName || 'User'} 
                          className="w-12 h-12 rounded-full mr-3 object-cover border-2 border-amber-300"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full mr-3 bg-amber-200 flex items-center justify-center text-amber-700 font-bold text-xl border-2 border-amber-300">
                          {user && user.fullName ? user.fullName.charAt(0) : '?'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-amber-800">{user ? user.fullName : 'Unknown User'}</h4>
                        <p className="text-sm text-amber-600">{user && user.email ? user.email : 'Không có email'}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-amber-700">
                      {user && user.gender && (
                        <p><span className="font-semibold">Giới tính:</span> {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}</p>
                      )}
                      {user && user.birthDate && (
                        <p><span className="font-semibold">Tuổi:</span> {new Date().getFullYear() - new Date(user.birthDate).getFullYear()}</p>
                      )}
                      {user && user.phone && (
                        <p><span className="font-semibold">Điện thoại:</span> {user.phone}</p>
                      )}
                    </div>
                    <div className="mt-4">
                      {user && user._id && (
                        <button
                          onClick={() => navigate(`/admin/users/${user._id}`)}
                          className="boba-button-primary w-full py-2 text-sm"
                        >
                          Xem hồ sơ
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6 bg-amber-50 p-4 rounded-xl border border-amber-200">
              <h3 className="font-bold text-lg mb-3 text-amber-800 flex items-center">
                <FaCalendarAlt className="mr-2 text-amber-600" /> Thông tin cuộc hẹn
              </h3>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2">
                      <span className="font-semibold text-amber-800">Trạng thái:</span> 
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${
                        selectedBlindate && selectedBlindate.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        selectedBlindate && selectedBlindate.status === 'accepted' ? 'bg-green-100 text-green-800 border border-green-300' :
                        selectedBlindate && selectedBlindate.status === 'completed' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        selectedBlindate && selectedBlindate.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-300' :
                        'bg-gray-100 text-gray-800 border border-gray-300'
                      }`}>
                        <span className="mr-1">{selectedBlindate && getStatusIcon(selectedBlindate.status)}</span>
                        {selectedBlindate && getStatusText(selectedBlindate.status)}
                      </span>
                    </p>
                    <p className="mb-2"><span className="font-semibold text-amber-800">ID:</span> <span className="text-amber-700 font-mono text-sm">{selectedBlindate && selectedBlindate._id}</span></p>
                    <p className="mb-2"><span className="font-semibold text-amber-800">Ngày tạo:</span> <span className="text-amber-700">{selectedBlindate && selectedBlindate.createdAt && new Date(selectedBlindate.createdAt).toLocaleString('vi-VN')}</span></p>
                    <p className="mb-2"><span className="font-semibold text-amber-800">Cập nhật:</span> <span className="text-amber-700">{selectedBlindate && selectedBlindate.updatedAt && new Date(selectedBlindate.updatedAt).toLocaleString('vi-VN')}</span></p>
                  </div>
                  
                  <div>
                    {/* Appointment Type */}
                    {selectedBlindate && selectedBlindate.dateDetails && selectedBlindate.dateDetails.type && (
                      <p className="mb-2">
                        <span className="font-semibold text-amber-800">Loại cuộc hẹn:</span> 
                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                          selectedBlindate.dateDetails.type === 'online' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-green-100 text-green-800 border border-green-300'
                        }`}>
                          {selectedBlindate.dateDetails.type === 'online' ? 'Trực tuyến' : 'Trực tiếp'}
                        </span>
                      </p>
                    )}
                    
                    {/* Appointment Time */}
                    {selectedBlindate && selectedBlindate.dateDetails && selectedBlindate.dateDetails.scheduledFor ? (
                      <p className="mb-2"><span className="font-semibold text-amber-800">Thời gian hẹn:</span> <span className="text-amber-700">{new Date(selectedBlindate.dateDetails.scheduledFor).toLocaleString('vi-VN')}</span></p>
                    ) : selectedBlindate && selectedBlindate.date ? (
                      <p className="mb-2"><span className="font-semibold text-amber-800">Thời gian hẹn:</span> <span className="text-amber-700">{new Date(selectedBlindate.date).toLocaleDateString('vi-VN')} {selectedBlindate.time || ''}</span></p>
                    ) : null}
                    
                    {/* Location */}
                    {selectedBlindate && selectedBlindate.dateDetails && selectedBlindate.dateDetails.location && selectedBlindate.dateDetails.location.name ? (
                      <div>
                        <p className="mb-1"><span className="font-semibold text-amber-800">Địa điểm:</span> <span className="text-amber-700">{selectedBlindate.dateDetails.location.name}</span></p>
                        {selectedBlindate.dateDetails.location.address && (
                          <p className="mb-2 text-sm text-amber-600 italic">{selectedBlindate.dateDetails.location.address}</p>
                        )}
                      </div>
                    ) : selectedBlindate && selectedBlindate.location ? (
                      <div>
                        <p className="mb-1"><span className="font-semibold text-amber-800">Địa điểm:</span> <span className="text-amber-700">{selectedBlindate.location}</span></p>
                      </div>
                    ) : null}
                    
                    {/* Notes */}
                    {selectedBlindate && selectedBlindate.dateDetails && selectedBlindate.dateDetails.notes ? (
                      <p className="mb-2"><span className="font-semibold text-amber-800">Ghi chú:</span> <span className="text-amber-700">{selectedBlindate.dateDetails.notes}</span></p>
                    ) : selectedBlindate && selectedBlindate.notes ? (
                      <p className="mb-2"><span className="font-semibold text-amber-800">Ghi chú:</span> <span className="text-amber-700">{selectedBlindate.notes}</span></p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            
            {selectedBlindate && selectedBlindate.userResponses && Array.isArray(selectedBlindate.userResponses) && selectedBlindate.userResponses.length > 0 && (
              <div className="mb-6 bg-amber-50 p-4 rounded-xl border border-amber-200">
                <h3 className="font-bold text-lg mb-3 text-amber-800">Phản hồi người dùng</h3>
                <div className="space-y-3">
                  {selectedBlindate.userResponses.map(response => response && response.user && (
                    <div key={response.user._id} className="bg-white p-4 rounded-lg shadow-sm border border-amber-100">
                      <div className="flex items-center mb-2">
                        {response.user && response.user.avatar ? (
                          <img 
                            src={response.user.avatar} 
                            alt={response.user.fullName || 'User'} 
                            className="w-8 h-8 rounded-full mr-2 object-cover border border-amber-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full mr-2 bg-amber-200 flex items-center justify-center text-amber-700 font-bold border border-amber-200">
                            {response.user && response.user.fullName ? response.user.fullName.charAt(0) : '?'}
                          </div>
                        )}
                        <span className="font-semibold text-amber-800">{response.user ? response.user.fullName : 'Unknown User'}</span>
                      </div>
                      <p className="mb-1">
                        <span className="font-semibold text-amber-800">Phản hồi:</span> 
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                          response.response === 'accepted' ? 'bg-green-100 text-green-800 border border-green-300' :
                          response.response === 'rejected' ? 'bg-red-100 text-red-800 border border-red-300' :
                          response.response === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-gray-100 text-gray-800 border border-gray-300'
                        }`}>
                          {response.response === 'accepted' ? 'Đã chấp nhận' :
                           response.response === 'rejected' ? 'Đã từ chối' :
                           response.response === 'pending' ? 'Đang chờ' : response.response}
                        </span>
                      </p>
                      {response.respondedAt && (
                        <p className="text-xs text-amber-600">Thời gian phản hồi: {new Date(response.respondedAt).toLocaleString('vi-VN')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedBlindate && selectedBlindate.reviews && Array.isArray(selectedBlindate.reviews) && selectedBlindate.reviews.length > 0 && (
              <div className="mb-6 bg-amber-50 p-4 rounded-xl border border-amber-200">
                <h3 className="font-bold text-lg mb-3 text-amber-800">Đánh giá</h3>
                <div className="space-y-3">
                  {selectedBlindate.reviews.map((review, index) => review && (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-amber-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {review.user.avatar ? (
                            <img 
                              src={review.user.avatar} 
                              alt={review.user.fullName} 
                              className="w-8 h-8 rounded-full mr-2 object-cover border border-amber-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full mr-2 bg-amber-200 flex items-center justify-center text-amber-700 font-bold border border-amber-200">
                              {review.user.fullName.charAt(0)}
                            </div>
                          )}
                          <span className="font-semibold text-amber-800">{review.user.fullName}</span>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? "text-amber-500" : "text-gray-300"}>★</span>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-700 italic">
                          "{review.comment}"
                        </div>
                      )}
                      <p className="text-xs text-amber-600 mt-2 text-right">
                        {new Date(review.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 bg-amber-50 p-4 rounded-xl border border-amber-200">
              <h3 className="font-bold text-lg mb-3 text-amber-800">Cập nhật trạng thái</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => selectedBlindate && handleUpdateStatus(selectedBlindate._id, 'pending')}
                  className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                    selectedBlindate && selectedBlindate.status === 'pending' 
                      ? 'bg-amber-200 text-amber-800 cursor-not-allowed' 
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                  disabled={selectedBlindate && selectedBlindate.status === 'pending'}
                >
                  <FaHourglassHalf className="mr-2" /> Đang chờ
                </button>
                <button
                  onClick={() => selectedBlindate && handleUpdateStatus(selectedBlindate._id, 'accepted')}
                  className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                    selectedBlindate && selectedBlindate.status === 'accepted' 
                      ? 'bg-green-200 text-green-800 cursor-not-allowed' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                  disabled={selectedBlindate && selectedBlindate.status === 'accepted'}
                >
                  <FaCheck className="mr-2" /> Chấp nhận
                </button>
                <button
                  onClick={() => selectedBlindate && handleUpdateStatus(selectedBlindate._id, 'completed')}
                  className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                    selectedBlindate && selectedBlindate.status === 'completed' 
                      ? 'bg-blue-200 text-blue-800 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  disabled={selectedBlindate && selectedBlindate.status === 'completed'}
                >
                  <FaCheckCircle className="mr-2" /> Hoàn thành
                </button>
                <button
                  onClick={() => selectedBlindate && handleUpdateStatus(selectedBlindate._id, 'rejected')}
                  className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                    selectedBlindate && selectedBlindate.status === 'rejected' 
                      ? 'bg-red-200 text-red-800 cursor-not-allowed' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  disabled={selectedBlindate && selectedBlindate.status === 'rejected'}
                >
                  <FaTimesCircle className="mr-2" /> Từ chối
                </button>
                <button
                  onClick={() => selectedBlindate && handleUpdateStatus(selectedBlindate._id, 'cancelled')}
                  className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                    selectedBlindate && selectedBlindate.status === 'cancelled' 
                      ? 'bg-gray-200 text-gray-800 cursor-not-allowed' 
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                  disabled={selectedBlindate && selectedBlindate.status === 'cancelled'}
                >
                  <FaBan className="mr-2" /> Hủy
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default Blindates;