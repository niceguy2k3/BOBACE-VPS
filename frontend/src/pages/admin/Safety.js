import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import { getAllSafetyReports, getSafetyReportById, updateSafetyReportStatus, getSafetyLocations, updateSafetyLocationStatus } from '../../services/admin.service';

const Safety = () => {
  const [safetyReports, setSafetyReports] = useState([]);
  const [safeLocations, setSafeLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('chờ_xử_lý');
  const [activeTab, setActiveTab] = useState('reports');
  const [resolution, setResolution] = useState('');
  const [locationCurrentPage, setLocationCurrentPage] = useState(1);
  const [locationTotalPages, setLocationTotalPages] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const navigate = useNavigate();

  const fetchSafetyReports = async (page = 1, status = 'chờ_xử_lý') => {
    setLoading(true);
    try {
      const response = await getAllSafetyReports({
        page,
        limit: 10,
        status
      });
      
      setSafetyReports(response.reports);
      setTotalPages(response.pagination.pages);
      setCurrentPage(response.pagination.page);
    } catch (error) {
      console.error('Error fetching safety reports:', error);
      toast.error('Không thể tải danh sách báo cáo an toàn');
    } finally {
      setLoading(false);
    }
  };

  const fetchSafeLocations = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getSafetyLocations({
        page,
        limit: 10
      });
      
      setSafeLocations(response.locations);
      setLocationTotalPages(response.pagination.pages);
      setLocationCurrentPage(response.pagination.page);
    } catch (error) {
      console.error('Error fetching safe locations:', error);
      toast.error('Không thể tải danh sách địa điểm an toàn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchSafetyReports(currentPage, statusFilter);
    } else {
      fetchSafeLocations(locationCurrentPage);
    }
  }, [currentPage, statusFilter, activeTab, locationCurrentPage]);

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (activeTab === 'reports') {
      setCurrentPage(page);
    } else {
      setLocationCurrentPage(page);
    }
  };

  const handleViewReportDetail = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
    setResolution('');
  };

  const handleViewLocationDetail = (location) => {
    setSelectedLocation(location);
    setShowLocationModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedReport(null);
    setResolution('');
    setShowLocationModal(false);
    setSelectedLocation(null);
  };

  const handleUpdateReportStatus = async (id, status) => {
    try {
      await updateSafetyReportStatus(id, {
        status,
        resolution: resolution || undefined
      });
      
      toast.success('Cập nhật trạng thái thành công');
      fetchSafetyReports(currentPage, statusFilter);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating safety report status:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleUpdateLocationStatus = async (id, status) => {
    try {
      await updateSafetyLocationStatus(id, { status });
      
      toast.success('Cập nhật trạng thái địa điểm thành công');
      fetchSafeLocations(locationCurrentPage);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating location status:', error);
      toast.error('Không thể cập nhật trạng thái địa điểm');
    }
  };

  const reportColumns = [
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
      header: 'Loại báo cáo',
      accessor: 'reportType',
      cell: (value) => {
        let typeClass = '';
        let typeText = '';
        
        switch (value) {
          case 'emergency':
            typeClass = 'bg-red-100 text-red-800';
            typeText = 'Khẩn cấp';
            break;
          case 'unsafe':
            typeClass = 'bg-orange-100 text-orange-800';
            typeText = 'Không an toàn';
            break;
          case 'suspicious':
            typeClass = 'bg-yellow-100 text-yellow-800';
            typeText = 'Đáng ngờ';
            break;
          default:
            typeClass = 'bg-gray-100 text-gray-800';
            typeText = 'Khác';
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${typeClass}`}>
            {typeText}
          </span>
        );
      }
    },
    {
      header: 'Liên quan đến',
      accessor: 'relatedTo',
      cell: (value) => (
        <span>
          {value.type === 'blindate' ? 'Cuộc hẹn' : 
           value.type === 'user' ? 'Người dùng' : 
           value.type === 'message' ? 'Tin nhắn' : 'Khác'}
        </span>
      )
    },
    {
      header: 'Mức độ ưu tiên',
      accessor: 'priority',
      cell: (value) => {
        let priorityClass = '';
        let priorityText = '';
        
        switch (value) {
          case 'critical':
            priorityClass = 'bg-red-100 text-red-800';
            priorityText = 'Nghiêm trọng';
            break;
          case 'high':
            priorityClass = 'bg-orange-100 text-orange-800';
            priorityText = 'Cao';
            break;
          case 'medium':
            priorityClass = 'bg-yellow-100 text-yellow-800';
            priorityText = 'Trung bình';
            break;
          default:
            priorityClass = 'bg-blue-100 text-blue-800';
            priorityText = 'Thấp';
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${priorityClass}`}>
            {priorityText}
          </span>
        );
      }
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
        let statusText = '';
        
        switch (value) {
          case 'chờ_xử_lý':
            statusClass = 'bg-yellow-100 text-yellow-800';
            statusText = 'Đang chờ';
            break;
          case 'in_progress':
            statusClass = 'bg-blue-100 text-blue-800';
            statusText = 'Đang xử lý';
            break;
          case 'resolved':
            statusClass = 'bg-green-100 text-green-800';
            statusText = 'Đã giải quyết';
            break;
          case 'dismissed':
            statusClass = 'bg-gray-100 text-gray-800';
            statusText = 'Đã bỏ qua';
            break;
          default:
            statusClass = 'bg-gray-100 text-gray-800';
            statusText = value;
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
            {statusText}
          </span>
        );
      }
    },
    {
      header: 'Thao tác',
      accessor: '_id',
      cell: (value, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewReportDetail(row)}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Chi tiết
          </button>
        </div>
      )
    }
  ];

  const locationColumns = [
    {
      header: 'Tên địa điểm',
      accessor: 'name',
      cell: (value) => <span>{value}</span>
    },
    {
      header: 'Địa chỉ',
      accessor: 'address',
      cell: (value) => (
        <span className="text-sm">
          {typeof value === 'string' && value.length > 30 ? `${value.substring(0, 30)}...` : value}
        </span>
      )
    },
    {
      header: 'Loại',
      accessor: 'type',
      cell: (value) => {
        const typeMap = {
          'cafe': 'Quán cà phê',
          'restaurant': 'Nhà hàng',
          'bar': 'Quán bar',
          'public_space': 'Không gian công cộng',
          'other': 'Khác'
        };
        
        return <span>{typeMap[value] || value}</span>;
      }
    },
    {
      header: 'Đánh giá',
      accessor: 'rating',
      cell: (value) => (
        <div className="flex items-center">
          <span>{value}/5</span>
          <span className="ml-1 text-yellow-500">★</span>
        </div>
      )
    },
    {
      header: 'Trạng thái',
      accessor: 'verificationStatus',
      cell: (value) => {
        let statusClass = '';
        let statusText = '';
        
        switch (value) {
          case 'pending':
            statusClass = 'bg-yellow-100 text-yellow-800';
            statusText = 'Chờ xác minh';
            break;
          case 'verified':
            statusClass = 'bg-green-100 text-green-800';
            statusText = 'Đã xác minh';
            break;
          case 'rejected':
            statusClass = 'bg-red-100 text-red-800';
            statusText = 'Đã từ chối';
            break;
          default:
            statusClass = 'bg-gray-100 text-gray-800';
            statusText = value;
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
            {statusText}
          </span>
        );
      }
    },
    {
      header: 'Thao tác',
      accessor: '_id',
      cell: (value, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewLocationDetail(row)}
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
        <h1 className="text-2xl font-bold mb-6">Quản lý An toàn</h1>
        
        <div className="mb-6">
          <div className="flex border-b">
            <button
              className={`py-2 px-4 ${activeTab === 'reports' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('reports')}
            >
              Báo cáo an toàn
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'locations' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('locations')}
            >
              Địa điểm an toàn
            </button>
          </div>
        </div>
        
        {activeTab === 'reports' ? (
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
              columns={reportColumns}
              data={safetyReports}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <DataTable
              columns={locationColumns}
              data={safeLocations}
              loading={loading}
              currentPage={locationCurrentPage}
              totalPages={locationTotalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
      
      {showDetailModal && selectedReport && (
        <Modal title="Chi tiết báo cáo an toàn" onClose={handleCloseModal}>
          <div className="p-4">
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2">Thông tin báo cáo</h3>
              <p><span className="font-semibold">ID:</span> {selectedReport._id}</p>
              <p><span className="font-semibold">Loại báo cáo:</span> {
                selectedReport.reportType === 'emergency' ? 'Khẩn cấp' :
                selectedReport.reportType === 'unsafe' ? 'Không an toàn' :
                selectedReport.reportType === 'suspicious' ? 'Đáng ngờ' : 'Khác'
              }</p>
              <p><span className="font-semibold">Mức độ ưu tiên:</span> {
                selectedReport.priority === 'critical' ? 'Nghiêm trọng' :
                selectedReport.priority === 'high' ? 'Cao' :
                selectedReport.priority === 'medium' ? 'Trung bình' : 'Thấp'
              }</p>
              <p><span className="font-semibold">Trạng thái:</span> {
                selectedReport.status === 'chờ_xử_lý' ? 'Đang chờ' :
                selectedReport.status === 'in_progress' ? 'Đang xử lý' :
                selectedReport.status === 'resolved' ? 'Đã giải quyết' : 'Đã bỏ qua'
              }</p>
              <p><span className="font-semibold">Ngày báo cáo:</span> {new Date(selectedReport.createdAt).toLocaleString('vi-VN')}</p>
              
              {selectedReport.location && (
                <p><span className="font-semibold">Vị trí:</span> {selectedReport.location}</p>
              )}
            </div>
            
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2">Người báo cáo</h3>
              <div className="border p-3 rounded">
                {selectedReport.user.avatar && (
                  <img 
                    src={selectedReport.user.avatar} 
                    alt={selectedReport.user.fullName} 
                    className="w-16 h-16 rounded-full mb-2"
                  />
                )}
                <p><span className="font-semibold">Tên:</span> {selectedReport.user.fullName}</p>
                <p><span className="font-semibold">Email:</span> {selectedReport.user.email}</p>
                <button
                  onClick={() => navigate(`/admin/users/${selectedReport.user._id}`)}
                  className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  Xem hồ sơ
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2">Liên quan đến</h3>
              <div className="border p-3 rounded">
                <p><span className="font-semibold">Loại:</span> {
                  selectedReport.relatedTo.type === 'blindate' ? 'Cuộc hẹn' :
                  selectedReport.relatedTo.type === 'user' ? 'Người dùng' :
                  selectedReport.relatedTo.type === 'message' ? 'Tin nhắn' : 'Khác'
                }</p>
                <p><span className="font-semibold">ID:</span> {selectedReport.relatedTo.id}</p>
                
                {selectedReport.relatedTo.type === 'blindate' && (
                  <button
                    onClick={() => navigate(`/admin/blindates?id=${selectedReport.relatedTo.id}`)}
                    className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                  >
                    Xem cuộc hẹn
                  </button>
                )}
                
                {selectedReport.relatedTo.type === 'user' && (
                  <button
                    onClick={() => navigate(`/admin/users/${selectedReport.relatedTo.id}`)}
                    className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                  >
                    Xem người dùng
                  </button>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2">Mô tả</h3>
              <div className="border p-3 rounded">
                <p>{selectedReport.description || 'Không có mô tả'}</p>
              </div>
            </div>
            
            {selectedReport.status === 'resolved' && selectedReport.resolution && (
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">Giải pháp đã áp dụng</h3>
                <div className="border p-3 rounded">
                  <p>{selectedReport.resolution}</p>
                </div>
              </div>
            )}
            
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
                onClick={() => handleUpdateReportStatus(selectedReport._id, 'in_progress')}
                className="px-3 py-1 bg-blue-500 text-white rounded"
                disabled={selectedReport.status === 'in_progress'}
              >
                Đánh dấu đang xử lý
              </button>
              <button
                onClick={() => handleUpdateReportStatus(selectedReport._id, 'resolved')}
                className="px-3 py-1 bg-green-500 text-white rounded"
                disabled={selectedReport.status === 'resolved'}
              >
                Đánh dấu đã giải quyết
              </button>
              <button
                onClick={() => handleUpdateReportStatus(selectedReport._id, 'dismissed')}
                className="px-3 py-1 bg-gray-500 text-white rounded"
                disabled={selectedReport.status === 'dismissed'}
              >
                Bỏ qua báo cáo
              </button>
            </div>
          </div>
        </Modal>
      )}
      
      {showLocationModal && selectedLocation && (
        <Modal title="Chi tiết địa điểm an toàn" onClose={handleCloseModal}>
          <div className="p-4">
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2">Thông tin địa điểm</h3>
              <p><span className="font-semibold">Tên:</span> {selectedLocation.name}</p>
              <p><span className="font-semibold">Địa chỉ:</span> {selectedLocation.address}</p>
              <p><span className="font-semibold">Loại:</span> {
                selectedLocation.type === 'cafe' ? 'Quán cà phê' :
                selectedLocation.type === 'restaurant' ? 'Nhà hàng' :
                selectedLocation.type === 'bar' ? 'Quán bar' :
                selectedLocation.type === 'public_space' ? 'Không gian công cộng' : 'Khác'
              }</p>
              <p><span className="font-semibold">Đánh giá:</span> {selectedLocation.rating}/5</p>
              <p><span className="font-semibold">Trạng thái:</span> {
                selectedLocation.verificationStatus === 'pending' ? 'Chờ xác minh' :
                selectedLocation.verificationStatus === 'verified' ? 'Đã xác minh' : 'Đã từ chối'
              }</p>
            </div>
            
            {selectedLocation.safetyFeatures && (
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">Tính năng an toàn</h3>
                <div className="border p-3 rounded">
                  <ul className="list-disc pl-5">
                    {selectedLocation.safetyFeatures.hasCCTV && <li>Có camera giám sát</li>}
                    {selectedLocation.safetyFeatures.hasSecurityStaff && <li>Có nhân viên bảo vệ</li>}
                    {selectedLocation.safetyFeatures.isWellLit && <li>Ánh sáng tốt</li>}
                    {selectedLocation.safetyFeatures.hasPublicTransport && <li>Gần phương tiện công cộng</li>}
                  </ul>
                </div>
              </div>
            )}
            
            {selectedLocation.openingHours && (
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">Giờ mở cửa</h3>
                <div className="border p-3 rounded grid grid-cols-2 gap-2">
                  {selectedLocation.openingHours.monday && (
                    <p><span className="font-semibold">Thứ 2:</span> {selectedLocation.openingHours.monday.open} - {selectedLocation.openingHours.monday.close}</p>
                  )}
                  {selectedLocation.openingHours.tuesday && (
                    <p><span className="font-semibold">Thứ 3:</span> {selectedLocation.openingHours.tuesday.open} - {selectedLocation.openingHours.tuesday.close}</p>
                  )}
                  {selectedLocation.openingHours.wednesday && (
                    <p><span className="font-semibold">Thứ 4:</span> {selectedLocation.openingHours.wednesday.open} - {selectedLocation.openingHours.wednesday.close}</p>
                  )}
                  {selectedLocation.openingHours.thursday && (
                    <p><span className="font-semibold">Thứ 5:</span> {selectedLocation.openingHours.thursday.open} - {selectedLocation.openingHours.thursday.close}</p>
                  )}
                  {selectedLocation.openingHours.friday && (
                    <p><span className="font-semibold">Thứ 6:</span> {selectedLocation.openingHours.friday.open} - {selectedLocation.openingHours.friday.close}</p>
                  )}
                  {selectedLocation.openingHours.saturday && (
                    <p><span className="font-semibold">Thứ 7:</span> {selectedLocation.openingHours.saturday.open} - {selectedLocation.openingHours.saturday.close}</p>
                  )}
                  {selectedLocation.openingHours.sunday && (
                    <p><span className="font-semibold">Chủ nhật:</span> {selectedLocation.openingHours.sunday.open} - {selectedLocation.openingHours.sunday.close}</p>
                  )}
                </div>
              </div>
            )}
            
            {selectedLocation.contactInfo && (
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">Thông tin liên hệ</h3>
                <div className="border p-3 rounded">
                  {selectedLocation.contactInfo.phone && (
                    <p><span className="font-semibold">Điện thoại:</span> {selectedLocation.contactInfo.phone}</p>
                  )}
                  {selectedLocation.contactInfo.email && (
                    <p><span className="font-semibold">Email:</span> {selectedLocation.contactInfo.email}</p>
                  )}
                  {selectedLocation.contactInfo.website && (
                    <p><span className="font-semibold">Website:</span> {selectedLocation.contactInfo.website}</p>
                  )}
                </div>
              </div>
            )}
            
            {selectedLocation.photos && selectedLocation.photos.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">Hình ảnh</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedLocation.photos.map((photo, index) => (
                    <img 
                      key={index}
                      src={photo}
                      alt={`${selectedLocation.name} - ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
            
            {selectedLocation.reviews && selectedLocation.reviews.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">Đánh giá ({selectedLocation.reviews.length})</h3>
                <div className="space-y-2">
                  {selectedLocation.reviews.map((review, index) => (
                    <div key={index} className="border p-2 rounded">
                      <div className="flex items-center mb-1">
                        {review.user.avatar && (
                          <img 
                            src={review.user.avatar} 
                            alt={review.user.fullName} 
                            className="w-8 h-8 rounded-full mr-2"
                          />
                        )}
                        <span className="font-semibold">{review.user.fullName}</span>
                      </div>
                      <div className="flex items-center mb-1">
                        <span>{review.rating}/5</span>
                        <span className="ml-1 text-yellow-500">★</span>
                      </div>
                      {review.comment && <p>{review.comment}</p>}
                      <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString('vi-VN')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => handleUpdateLocationStatus(selectedLocation._id, 'verified')}
                className="px-3 py-1 bg-green-500 text-white rounded"
                disabled={selectedLocation.verificationStatus === 'verified'}
              >
                Xác minh địa điểm
              </button>
              <button
                onClick={() => handleUpdateLocationStatus(selectedLocation._id, 'rejected')}
                className="px-3 py-1 bg-red-500 text-white rounded"
                disabled={selectedLocation.verificationStatus === 'rejected'}
              >
                Từ chối địa điểm
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default Safety;