import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import { getAllMatches, deleteMatch } from '../../services/admin.service';
import useDebounce from '../../hooks/useDebounce';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  const fetchMatches = async (page = 1, search = '', sort = 'createdAt', order = 'desc') => {
    setLoading(true);
    try {
      const response = await getAllMatches({
        page,
        limit: 10,
        search,
        sort,
        order
      });
      
      // Ensure matches is an array
      if (response && response.matches && Array.isArray(response.matches)) {
        setMatches(response.matches);
      } else {
        console.error('Invalid matches data format:', response);
        setMatches([]);
        toast.error('Dữ liệu matches không hợp lệ');
      }
      
      // Ensure pagination data exists
      if (response && response.pagination) {
        setTotalPages(response.pagination.pages || 1);
        setCurrentPage(response.pagination.page || 1);
      } else {
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Không thể tải danh sách matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(currentPage, searchTerm, sortBy, sortOrder);
  }, [currentPage, sortBy, sortOrder]);
  
  // Effect for debounced search term
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setSearchTerm(debouncedSearchTerm);
      setCurrentPage(1);
      fetchMatches(1, debouncedSearchTerm, sortBy, sortOrder);
    }
  }, [debouncedSearchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMatches(1, searchTerm, sortBy, sortOrder);
  };
  
  // Không cần hàm này nữa vì đã xử lý bằng debounce
  // Giữ lại để tương thích với code hiện tại

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetail = (match) => {
    setSelectedMatch(match);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedMatch(null);
  };

  const handleDeleteMatch = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa match này không?')) {
      try {
        await deleteMatch(id);
        
        toast.success('Xóa match thành công');
        fetchMatches(currentPage, searchTerm, sortBy, sortOrder);
        
        if (showDetailModal && selectedMatch && selectedMatch._id === id) {
          handleCloseModal();
        }
      } catch (error) {
        console.error('Error deleting match:', error);
        toast.error('Không thể xóa match');
      }
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: '_id',
      cell: (value) => <span className="text-xs">{typeof value === 'string' ? `${value.substring(0, 10)}...` : String(value)}</span>
    },
    {
      header: 'Người dùng',
      accessor: 'users',
      cell: (users) => {
        // Check if users is an array before using map
        if (!users || !Array.isArray(users)) {
          return <span className="text-sm">Không có dữ liệu</span>;
        }
        return (
          <div className="flex flex-col">
            {users.map(user => (
              <span key={user._id} className="text-sm">
                {user.fullName}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      header: 'Tin nhắn cuối',
      accessor: 'lastMessage',
      cell: (lastMessage) => {
        if (!lastMessage) {
          return <span className="text-sm">Chưa có tin nhắn</span>;
        }
        
        try {
          return (
            <span className="text-sm">
              {lastMessage.content ? 
                (lastMessage.content.length > 20 ? 
                  `${lastMessage.content.substring(0, 20)}...` : 
                  lastMessage.content) : 
                'Không có nội dung'}
            </span>
          );
        } catch (error) {
          console.error('Error rendering lastMessage:', error);
          return <span className="text-sm">Lỗi hiển thị</span>;
        }
      }
    },
    {
      header: 'Ngày tạo',
      accessor: 'createdAt',
      cell: (value) => {
        try {
          return value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A';
        } catch (error) {
          console.error('Error formatting date:', error);
          return 'Invalid date';
        }
      },
      sortable: true,
      onClick: () => handleSort('createdAt')
    },
    {
      header: 'Trạng thái',
      accessor: 'isActive',
      cell: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${value === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value === true ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      )
    },
    {
      header: 'Thao tác',
      accessor: '_id',
      cell: (value, row) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetail(row);
            }}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Chi tiết
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMatch(value);
            }}
            className="px-2 py-1 bg-red-500 text-white rounded text-xs"
          >
            Xóa
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Quản lý Matches</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4 md:mb-0">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                  setCurrentPage(1);
                }}
                className="border rounded px-3 py-2"
              >
                <option value="createdAt-desc">Mới nhất</option>
                <option value="createdAt-asc">Cũ nhất</option>
              </select>
            </div>
            

          </div>
          
          <DataTable
            columns={columns}
            data={Array.isArray(matches) ? matches : []}
            isLoading={loading}
            pagination={{
              total: totalPages * 10, // Approximate total items
              page: currentPage,
              limit: 10,
              onPageChange: handlePageChange
            }}
            onSort={handleSort}
            onFilter={(value) => {
              setSearchInput(value);
              // Không gọi fetchMatches ở đây nữa, sẽ được xử lý bởi useEffect với debouncedSearchTerm
            }}
            searchValue={searchInput}
          />
        </div>
      </div>
      
      {showDetailModal && selectedMatch && (
        <Modal title="Chi tiết match" onClose={handleCloseModal}>
          <div className="p-4">
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2">Thông tin người dùng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(selectedMatch.users) && selectedMatch.users.length > 0 ? (
                  selectedMatch.users.map(user => (
                    <div key={user._id || 'unknown'} className="border p-3 rounded">
                      <p><span className="font-semibold">Tên: </span> {user.fullName || 'Không có tên'}</p>
                      <p><span className="font-semibold">Email: </span> {user.email || 'N/A'}</p>
                      {user._id && (
                        <button
                          onClick={() => navigate(`/admin/users/${user._id}`)}
                          className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                        >
                          Xem hồ sơ
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="border p-3 rounded">
                    <p className="text-gray-500">Không có thông tin người dùng</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2">Thông tin match</h3>
              <p>
                <span className="font-semibold">Ngày tạo: </span> 
                {selectedMatch.createdAt ? 
                  new Date(selectedMatch.createdAt).toLocaleString('vi-VN') : 
                  'Không có thông tin'}
              </p>
              <p>
                <span className="font-semibold">Trạng thái: </span> 
                {selectedMatch.isActive === true ? 'Hoạt động' : 'Không hoạt động'}
              </p>
              
              {selectedMatch.lastMessage && typeof selectedMatch.lastMessage === 'object' ? (
                selectedMatch.lastMessage.sender && typeof selectedMatch.lastMessage.sender === 'object' ? (
                  <div className="mt-2">
                    <p><span className="font-semibold">Tin nhắn cuối: </span></p>
                    <div className="border p-2 rounded mt-1">
                      <p>
                        <span className="font-semibold">Người gửi: </span> 
                        {selectedMatch.lastMessage.sender.fullName || 'Không có tên'}
                      </p>
                      <p>
                        <span className="font-semibold">Nội dung: </span> 
                        {selectedMatch.lastMessage.content || 'Không có nội dung'}
                      </p>
                      {selectedMatch.lastMessage.createdAt && (
                        <p>
                          <span className="font-semibold">Thời gian: </span> 
                          {new Date(selectedMatch.lastMessage.createdAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p><span className="font-semibold">Tin nhắn cuối:</span></p>
                    <div className="border p-2 rounded mt-1">
                      <p>
                        <span className="font-semibold">Nội dung:</span> 
                        {selectedMatch.lastMessage.content || 'Không có nội dung'}
                      </p>
                      {selectedMatch.lastMessage.createdAt && (
                        <p>
                          <span className="font-semibold">Thời gian:</span> 
                          {new Date(selectedMatch.lastMessage.createdAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <p><span className="font-semibold">Tin nhắn cuối:</span> Chưa có tin nhắn</p>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => selectedMatch._id && handleDeleteMatch(selectedMatch._id)}
                className="px-4 py-2 bg-red-500 text-white rounded"
                disabled={!selectedMatch._id}
              >
                Xóa match
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default Matches;