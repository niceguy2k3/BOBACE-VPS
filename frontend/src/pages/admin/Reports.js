import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import { getAllReports, getReportById, updateReportStatus, banUser } from '../../services/admin.service';

// Hàm debounce để trì hoãn việc thực thi một hàm
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [debouncedStatusFilter, setDebouncedStatusFilter] = useState('');
  const [resolution, setResolution] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const navigate = useNavigate();

  // Định nghĩa fetchReports với useCallback để tránh tạo lại hàm mỗi khi component re-render
  const fetchReports = useCallback(async (page = 1, status = 'chờ_xử_lý') => {
    setLoading(true);
    try {
      // Kiểm tra giá trị status hợp lệ
      const validStatuses = ['chờ_xử_lý', 'in_progress', 'resolved', 'dismissed', ''];
      const validStatus = validStatuses.includes(status) ? status : '';
      
      console.log('Fetching reports with params:', { page, status: validStatus });
      const response = await getAllReports({
        page,
        limit: 10,
        status: validStatus
      });
      
      console.log('Reports API response:', response);
      
      // Ensure each report has an _id property
      if (response.reports && Array.isArray(response.reports)) {
        const processedReports = response.reports.map(report => {
          if (!report._id && report.reportId) {
            console.log('Adding _id to report:', report.reportId);
            return { ...report, _id: report.reportId };
          }
          return report;
        });
        console.log('Processed reports:', processedReports);
        setReports(processedReports);
      } else {
        setReports(response.reports || []);
      }
      
      setTotalPages(response.pagination.pages);
      setCurrentPage(response.pagination.page);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sử dụng useEffect để theo dõi sự thay đổi của statusFilter và áp dụng debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedStatusFilter(statusFilter);
    }, 500); // Trì hoãn 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [statusFilter]);

  // Chỉ gọi API khi debouncedStatusFilter hoặc currentPage thay đổi
  useEffect(() => {
    fetchReports(currentPage, debouncedStatusFilter);
  }, [currentPage, debouncedStatusFilter]);

  const handleStatusChange = (e) => {
    // Kiểm tra giá trị status hợp lệ
    const validStatuses = ['chờ_xử_lý', 'in_progress', 'resolved', 'dismissed', ''];
    const value = e.target.value;
    
    if (validStatuses.includes(value)) {
      setStatusFilter(value);
      setCurrentPage(1);
    } else {
      console.error('Invalid status value:', value);
      toast.error('Giá trị trạng thái không hợp lệ');
      setStatusFilter('');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetail = (report) => {
    console.log('Viewing report details:', report);
    
    // Ensure the report has an _id property
    if (!report._id && report.reportId) {
      report._id = report.reportId;
    }
    
    setSelectedReport(report);
    setShowDetailModal(true);
    setResolution('');
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedReport(null);
    setResolution('');
  };
  
  const handleOpenImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };
  
  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // Tạo phiên bản debounced của hàm fetchReports
  const debouncedFetchReports = useCallback(
    debounce((page, status) => {
      fetchReports(page, status);
    }, 300),
    [fetchReports]
  );

  const handleUpdateStatus = async (id, status) => {
    try {
      // Kiểm tra xem id có tồn tại không
      if (!id) {
        console.error('Report ID is undefined or null');
        toast.error('ID báo cáo không hợp lệ');
        return;
      }
      
      // Kiểm tra status hợp lệ
      if (!['chờ_xử_lý', 'in_progress', 'resolved', 'dismissed'].includes(status)) {
        console.error('Invalid status value:', status);
        toast.error('Giá trị trạng thái không hợp lệ');
        return;
      }
      
      // Log thông tin để debug
      console.log('Updating report status:', { id, status, resolution });
      console.log('Selected report:', selectedReport);
      
      // Chuẩn bị dữ liệu cập nhật
      const updateData = {
        status,
        resolution: resolution || undefined
      };
      
      // Gọi API cập nhật trạng thái
      const response = await updateReportStatus(id, updateData);
      
      console.log('Update status response:', response);
      
      toast.success('Cập nhật trạng thái thành công');
      debouncedFetchReports(currentPage, debouncedStatusFilter);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Không thể cập nhật trạng thái: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBanUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn cấm người dùng này không?')) {
      try {
        await banUser(userId, 'Vi phạm quy định cộng đồng');
        
        toast.success('Đã cấm người dùng thành công');
        debouncedFetchReports(currentPage, debouncedStatusFilter);
      } catch (error) {
        console.error('Error banning user:', error);
        toast.error('Không thể cấm người dùng');
      }
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: (row) => {
        const id = row._id || row.reportId;
        console.log('Report row:', row);
        console.log('Report ID in column:', id);
        return id;
      },
      cell: (value) => <span className="text-xs">{typeof value === 'string' ? `${value.substring(0, 10)}...` : String(value)}</span>
    },
    {
      header: 'Người báo cáo',
      accessor: 'reportingUser',
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
      header: 'Người bị báo cáo',
      accessor: 'reportedUser',
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
      header: 'Lý do',
      accessor: 'reason',
      cell: (value) => (
        <span className="text-sm">
          {typeof value === 'string' && value.length > 30 ? `${value.substring(0, 30)}...` : value}
        </span>
      )
    },
    {
      header: 'Ngày báo cáo',
      accessor: 'createdAt',
      cell: (value) => new Date(value).toLocaleDateString('vi-VN')
    },
    {
      header: 'Trạng thái',
      accessor: 'status',
      cell: (value) => {
        let statusClass = '';
        switch (value) {
          case 'chờ_xử_lý':
            statusClass = 'bg-yellow-100 text-yellow-800';
            break;
          case 'in_progress':
            statusClass = 'bg-blue-100 text-blue-800';
            break;
          case 'resolved':
            statusClass = 'bg-green-100 text-green-800';
            break;
          case 'dismissed':
            statusClass = 'bg-gray-100 text-gray-800';
            break;
          default:
            statusClass = 'bg-gray-100 text-gray-800';
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
            {value === 'chờ_xử_lý' ? 'Đang chờ' : 
             value === 'in_progress' ? 'Đang xử lý' : 
             value === 'resolved' ? 'Đã giải quyết' : 'Đã bỏ qua'}
          </span>
        );
      }
    },
    {
      header: 'Thao tác',
      accessor: (row) => {
        const id = row._id || row.reportId;
        console.log('Action column ID:', id);
        return id;
      },
      cell: (value, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetail(row)}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Chi tiết
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Quản lý Báo cáo</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4 md:mb-0">
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="border rounded px-3 py-2"
              >
                <option value="chờ_xử_lý">Đang chờ</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="dismissed">Đã bỏ qua</option>
                <option value="">Tất cả</option>
              </select>
            </div>
          </div>
          
          <DataTable
            columns={columns}
            data={reports}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      
      {showDetailModal && selectedReport && (
        <Modal title="Chi tiết báo cáo" onClose={handleCloseModal}>
          <div className="p-4">
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2">Thông tin báo cáo</h3>
              <p><span className="font-semibold">ID:</span> {selectedReport._id || selectedReport.reportId}</p>
              <p><span className="font-semibold">Trạng thái:</span> {
                selectedReport.status === 'chờ_xử_lý' ? 'Đang chờ' : 
                selectedReport.status === 'in_progress' ? 'Đang xử lý' : 
                selectedReport.status === 'resolved' ? 'Đã giải quyết' : 
                selectedReport.status === 'dismissed' ? 'Đã bỏ qua' : 
                selectedReport.status
              }</p>
              <p><span className="font-semibold">Ngày báo cáo:</span> {new Date(selectedReport.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Người báo cáo</h3>
                <div className="border p-3 rounded">
                  {selectedReport.reportingUser.avatar && (
                    <img 
                      src={selectedReport.reportingUser.avatar} 
                      alt={selectedReport.reportingUser.fullName} 
                      className="w-16 h-16 rounded-full mb-2"
                    />
                  )}
                  <p><span className="font-semibold">Tên:</span> {selectedReport.reportingUser.fullName}</p>
                  <p><span className="font-semibold">Email:</span> {selectedReport.reportingUser.email}</p>
                  <button
                    onClick={() => navigate(`/admin/users/${selectedReport.reportingUser._id}`)}
                    className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                  >
                    Xem hồ sơ
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-2">Người bị báo cáo</h3>
                <div className="border p-4 rounded">
                  {selectedReport.reportedUser.avatar && (
                    <img 
                      src={selectedReport.reportedUser.avatar} 
                      alt={selectedReport.reportedUser.fullName} 
                      className="w-16 h-16 rounded-full mb-2"
                    />
                  )}
                  <p><span className="font-semibold">Tên:</span> {selectedReport.reportedUser.fullName}</p>
                  <p><span className="font-semibold">Email:</span> {selectedReport.reportedUser.email}</p>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => navigate(`/admin/users/${selectedReport.reportedUser._id}`)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    >
                      Xem hồ sơ
                    </button>
                    <button
                      onClick={() => handleBanUser(selectedReport.reportedUser._id)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    >
                      Cấm người dùng
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2">Nội dung báo cáo</h3>
              <div className="border p-3 rounded">
                <p><span className="font-semibold">Lý do:</span> {selectedReport.reason}</p>
                {selectedReport.description && (
                  <p><span className="font-semibold">Mô tả chi tiết:</span> {selectedReport.description}</p>
                )}
                
                {selectedReport.evidence && selectedReport.evidence.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold mb-2">Bằng chứng:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedReport.evidence.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Bằng chứng ${index + 1}`}
                            className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleOpenImageModal(imageUrl)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2">Giải quyết báo cáo</h3>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Nhập giải pháp xử lý báo cáo này..."
                className="w-full border rounded p-2 h-24"
              />
            </div>
            
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  // Sử dụng _id nếu có, nếu không thì sử dụng reportId
                  const reportId = selectedReport._id || selectedReport.reportId;
                  console.log('Report ID used for update:', reportId);
                  handleUpdateStatus(reportId, 'in_progress');
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded"
                disabled={selectedReport.status === 'in_progress'}
              >
                Đánh dấu đang xử lý
              </button>
              <button
                onClick={() => {
                  const reportId = selectedReport._id || selectedReport.reportId;
                  console.log('Report ID used for update:', reportId);
                  handleUpdateStatus(reportId, 'resolved');
                }}
                className="px-3 py-1 bg-green-500 text-white rounded"
                disabled={selectedReport.status === 'resolved'}
              >
                Đánh dấu đã giải quyết
              </button>
              <button
                onClick={() => {
                  const reportId = selectedReport._id || selectedReport.reportId;
                  console.log('Report ID used for update:', reportId);
                  handleUpdateStatus(reportId, 'dismissed');
                }}
                className="px-3 py-1 bg-gray-500 text-white rounded"
                disabled={selectedReport.status === 'dismissed'}
              >
                Bỏ qua báo cáo
              </button>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-screen p-2">
            <button
              onClick={handleCloseImageModal}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage}
              alt="Bằng chứng"
              className="max-w-full max-h-[90vh] object-contain rounded shadow-lg"
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Reports;