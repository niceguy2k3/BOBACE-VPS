import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import { getAllNotifications, createNotification, deleteNotification, getAllUsers } from '../../services/admin.service';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notificationType, setNotificationType] = useState('system');
  const [notificationText, setNotificationText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [sendToAll, setSendToAll] = useState(false);
  const [linkTo, setLinkTo] = useState('/');

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getAllNotifications({
        page,
        limit: 10
      });
      
      setNotifications(response.notifications);
      setTotalPages(response.pagination.pages);
      setCurrentPage(response.pagination.page);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Không thể tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (search = '') => {
    try {
      const response = await getAllUsers({
        search,
        limit: 10
      });
      
      setUserOptions(response.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    }
  };

  useEffect(() => {
    fetchNotifications(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    fetchUsers();
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNotificationType('system');
    setNotificationText('');
    setSelectedUsers([]);
    setUserSearchTerm('');
    setSendToAll(false);
    setLinkTo('/');
  };

  const handleUserSearch = (e) => {
    const term = e.target.value;
    setUserSearchTerm(term);
    
    if (term.length >= 2) {
      fetchUsers(term);
    }
  };

  const handleSelectUser = (user) => {
    if (!selectedUsers.some(u => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setUserSearchTerm('');
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user._id !== userId));
  };

  const handleSendNotification = async () => {
    if (!notificationText.trim()) {
      toast.error('Vui lòng nhập nội dung thông báo');
      return;
    }
    
    if (!sendToAll && selectedUsers.length === 0) {
      toast.error('Vui lòng chọn ít nhất một người dùng hoặc chọn gửi cho tất cả');
      return;
    }
    
    try {
      await createNotification({
        type: notificationType,
        text: notificationText,
        users: sendToAll ? [] : selectedUsers.map(user => user._id),
        sendToAll,
        linkTo
      });
      
      toast.success('Gửi thông báo thành công');
      handleCloseCreateModal();
      fetchNotifications(currentPage);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Không thể gửi thông báo');
    }
  };

  const handleDeleteNotification = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này không?')) {
      try {
        await deleteNotification(id);
        
        toast.success('Xóa thông báo thành công');
        fetchNotifications(currentPage);
      } catch (error) {
        console.error('Error deleting notification:', error);
        toast.error('Không thể xóa thông báo');
      }
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: '_id',
      cell: (value) => <span className="text-xs">{typeof value === 'string' ? `${value.substring(0, 10)}...` : value}</span>
    },
    {
      header: 'Người dùng',
      accessor: 'user',
      cell: (user) => (
        <div className="flex items-center">
          {user.avatar && (
            <img 
              src={user.avatar} 
              alt={user.fullName} 
              className="w-8 h-8 rounded-full mr-2"
            />
          )}
          <span>{user.fullName}</span>
        </div>
      )
    },
    {
      header: 'Nội dung',
      accessor: 'text',
      cell: (value) => (
        <span className="text-sm">
          {typeof value === 'string' && value.length > 50 ? `${value.substring(0, 50)}...` : value}
        </span>
      )
    },
    {
      header: 'Loại',
      accessor: 'type',
      cell: (value) => {
        let typeClass = '';
        let typeText = '';
        
        switch (value) {
          case 'system':
            typeClass = 'bg-blue-100 text-blue-800';
            typeText = 'Hệ thống';
            break;
          case 'match':
            typeClass = 'bg-pink-100 text-pink-800';
            typeText = 'Match';
            break;
          case 'message':
            typeClass = 'bg-green-100 text-green-800';
            typeText = 'Tin nhắn';
            break;
          case 'blindate':
          case 'blindate_request':
          case 'blindate_accepted':
          case 'blindate_rejected':
          case 'blindate_updated':
          case 'blindate_reviewed':
          case 'blindate_cancelled':
          case 'blindate_video_link':
            typeClass = 'bg-purple-100 text-purple-800';
            typeText = 'Cuộc hẹn';
            break;
          default:
            typeClass = 'bg-gray-100 text-gray-800';
            typeText = value;
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${typeClass}`}>
            {typeText}
          </span>
        );
      }
    },
    {
      header: 'Đã đọc',
      accessor: 'read',
      cell: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {value ? 'Đã đọc' : 'Chưa đọc'}
        </span>
      )
    },
    {
      header: 'Ngày tạo',
      accessor: 'createdAt',
      cell: (value) => new Date(value).toLocaleDateString('vi-VN')
    },
    {
      header: 'Thao tác',
      accessor: '_id',
      cell: (value) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleDeleteNotification(value)}
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
        <h1 className="text-2xl font-bold mb-6">Quản lý Thông báo</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Tạo thông báo mới
            </button>
          </div>
          
          <DataTable
            columns={columns}
            data={notifications}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      
      {showCreateModal && (
        <Modal title="Tạo thông báo mới" onClose={handleCloseCreateModal}>
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Loại thông báo</label>
              <select
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="system">Hệ thống</option>
                <option value="match">Match</option>
                <option value="message">Tin nhắn</option>
                <option value="blindate">Cuộc hẹn</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nội dung thông báo</label>
              <textarea
                value={notificationText}
                onChange={(e) => setNotificationText(e.target.value)}
                placeholder="Nhập nội dung thông báo..."
                className="w-full border rounded p-2 h-24"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Link đến</label>
              <input
                type="text"
                value={linkTo}
                onChange={(e) => setLinkTo(e.target.value)}
                placeholder="Đường dẫn khi nhấp vào thông báo"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="sendToAll"
                  checked={sendToAll}
                  onChange={(e) => setSendToAll(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="sendToAll" className="text-sm font-medium">Gửi cho tất cả người dùng</label>
              </div>
              
              {!sendToAll && (
                <>
                  <label className="block text-sm font-medium mb-1">Chọn người dùng</label>
                  <div className="relative mb-2">
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={handleUserSearch}
                      placeholder="Tìm kiếm người dùng..."
                      className="w-full border rounded px-3 py-2"
                    />
                    {userSearchTerm.length >= 2 && userOptions.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-y-auto">
                        {userOptions.map(user => (
                          <div
                            key={user._id}
                            className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                            onClick={() => handleSelectUser(user)}
                          >
                            {user.avatar && (
                              <img 
                                src={user.avatar} 
                                alt={user.fullName} 
                                className="w-8 h-8 rounded-full mr-2"
                              />
                            )}
                            <span>{user.fullName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUsers.map(user => (
                      <div
                        key={user._id}
                        className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        <span className="text-sm">{user.fullName}</span>
                        <button
                          onClick={() => handleRemoveUser(user._id)}
                          className="ml-2 text-blue-800 hover:text-blue-900"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSendNotification}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Gửi thông báo
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default Notifications;