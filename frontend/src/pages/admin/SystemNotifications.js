import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import { sendSystemNotification, getAllNotifications } from '../../services/admin.service';

const SystemNotifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [linkTo, setLinkTo] = useState('/');
  const [loading, setLoading] = useState(false);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Tải lịch sử thông báo từ API khi component được mount
  useEffect(() => {
    // Tải thông báo từ API
    const fetchSystemNotifications = async () => {
      setLoadingHistory(true);
      try {
        const response = await getAllNotifications({ type: 'system', limit: 50 });
        if (response && response.notifications) {
          // Chỉ lấy thông báo hệ thống từ API
          const formattedNotifications = response.notifications
            .filter(notif => notif.type === 'system')
            .map(notif => ({
              id: notif._id,
              title: notif.title || 'Thông báo hệ thống',
              message: notif.content || notif.text,
              linkTo: notif.linkTo || '/',
              sentAt: notif.createdAt,
              recipientCount: notif.recipients === 'all' ? 'Tất cả' : 1
            }));
          
          // Sắp xếp theo thời gian gửi (mới nhất lên đầu)
          formattedNotifications.sort((a, b) => {
            return new Date(b.sentAt) - new Date(a.sentAt);
          });
          
          setSentNotifications(formattedNotifications);
        }
      } catch (error) {
        console.error('Error fetching system notifications:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchSystemNotifications();
  }, []);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề thông báo');
      return;
    }
    
    if (!message.trim()) {
      toast.error('Vui lòng nhập nội dung thông báo');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await sendSystemNotification({
        title,
        message,
        linkTo
      });
      
      // Tạo đối tượng thông báo mới
      const newNotification = {
        id: response.notification._id,
        title,
        message,
        linkTo,
        sentAt: new Date().toISOString(),
        recipientCount: response.notification.recipientCount || 'Tất cả'
      };
      
      // Thêm thông báo vừa gửi vào danh sách
      const updatedNotifications = [newNotification, ...sentNotifications];
      setSentNotifications(updatedNotifications);
      
      toast.success('Đã gửi thông báo hệ thống thành công');
      
      // Reset form
      setTitle('');
      setMessage('');
      setLinkTo('/');
      
      // Tải lại danh sách thông báo từ API sau khi gửi thành công
      setTimeout(() => {
        // Tải lại danh sách thông báo từ API
        const fetchSystemNotifications = async () => {
          setLoadingHistory(true);
          try {
            const response = await getAllNotifications({ type: 'system', limit: 50 });
            if (response && response.notifications) {
              const formattedNotifications = response.notifications
                .filter(notif => notif.type === 'system')
                .map(notif => ({
                  id: notif._id,
                  title: notif.title || 'Thông báo hệ thống',
                  message: notif.content || notif.text,
                  linkTo: notif.linkTo || '/',
                  sentAt: notif.createdAt,
                  recipientCount: notif.recipients === 'all' ? 'Tất cả' : 1
                }));
              
              // Sắp xếp theo thời gian gửi (mới nhất lên đầu)
              formattedNotifications.sort((a, b) => {
                return new Date(b.sentAt) - new Date(a.sentAt);
              });
              
              setSentNotifications(formattedNotifications);
            }
          } catch (error) {
            console.error('Error fetching system notifications:', error);
          } finally {
            setLoadingHistory(false);
          }
        };
        
        fetchSystemNotifications();
      }, 1000); // Đợi 1 giây để đảm bảo API đã cập nhật
    } catch (error) {
      console.error('Error sending system notification:', error);
      toast.error('Không thể gửi thông báo hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Thông Báo Hệ Thống</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form gửi thông báo */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Gửi thông báo tới tất cả người dùng</h2>
            
            <form onSubmit={handleSendNotification}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tiêu đề thông báo</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề thông báo..."
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nội dung thông báo</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập nội dung thông báo..."
                  className="w-full border rounded p-2 h-32"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Link đến (tùy chọn)</label>
                <input
                  type="text"
                  value={linkTo}
                  onChange={(e) => setLinkTo(e.target.value)}
                  placeholder="Đường dẫn khi nhấp vào thông báo"
                  className="w-full border rounded px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Đường dẫn mà người dùng sẽ được chuyển đến khi nhấp vào thông báo
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Đang gửi...' : 'Gửi thông báo'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Thông tin và hướng dẫn */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin và hướng dẫn</h2>
            
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-2">Về thông báo hệ thống</h3>
              <p className="text-gray-700 mb-2">
                Thông báo hệ thống sẽ được gửi tới <strong>tất cả người dùng</strong> trong hệ thống.
                Sử dụng tính năng này cho các thông báo quan trọng như:
              </p>
              <ul className="list-disc pl-5 text-gray-700">
                <li>Cập nhật hệ thống</li>
                <li>Thông báo bảo trì</li>
                <li>Tính năng mới</li>
                <li>Sự kiện đặc biệt</li>
                <li>Thông báo chính sách</li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-2">Lưu ý quan trọng</h3>
              <ul className="list-disc pl-5 text-gray-700">
                <li>Sử dụng tính năng này một cách có trách nhiệm</li>
                <li>Thông báo sẽ được gửi ngay lập tức tới tất cả người dùng</li>
                <li>Người dùng sẽ nhận được thông báo khi họ đăng nhập vào ứng dụng</li>
                <li>Thông báo không thể thu hồi sau khi đã gửi</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="font-medium text-yellow-800 mb-2">Thống kê</h3>
              <p className="text-yellow-700">
                Tổng số thông báo đã gửi: <strong>{sentNotifications.length}</strong>
              </p>
            </div>
          </div>
        </div>
        
        {/* Lịch sử thông báo đã gửi */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Lịch sử thông báo đã gửi</h2>
          
          {loadingHistory ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : sentNotifications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nội dung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian gửi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số người nhận
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sentNotifications.map((notification) => (
                    <tr key={notification.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {notification.message && notification.message.length > 50 
                            ? `${notification.message.substring(0, 50)}...` 
                            : notification.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(notification.sentAt).toLocaleString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{notification.recipientCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Đã gửi
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Chưa có thông báo hệ thống nào được gửi
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SystemNotifications;