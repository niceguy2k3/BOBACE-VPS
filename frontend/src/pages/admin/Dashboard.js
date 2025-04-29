import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaUserCheck, FaCrown, FaCalendarAlt, FaHeart, FaComments, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import LineChart from '../../components/admin/LineChart';
import PieChart from '../../components/admin/PieChart';
import RecentActivityTable from '../../components/admin/RecentActivityTable';

const Dashboard = () => {
  const { 
    isAdmin, 
    dashboardStats, 
    fetchDashboardStats, 
    loading,
    fetchUsers,
    fetchBlindates,
    fetchReports,
    fetchSafetyReports
  } = useAdmin();
  const navigate = useNavigate();
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentBlindates, setRecentBlindates] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [pendingSafetyReports, setPendingSafetyReports] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    // Sử dụng biến cờ để tránh gọi API nhiều lần
    let isMounted = true;
    
    // Chỉ gọi API khi chưa có dữ liệu
    if (!dashboardStats) {
      fetchDashboardStats();
    }

    // Chỉ lấy dữ liệu khi component được mount và chưa có dữ liệu
    if (isMounted && recentUsers.length === 0) {
      // Lấy người dùng mới nhất
      fetchUsers({ page: 1, limit: 5, sort: 'createdAt', order: 'desc' })
        .then(data => {
          if (isMounted && data?.users) {
            setRecentUsers(data.users);
          }
        })
        .catch(err => console.error('Error fetching recent users:', err));
    }

    if (isMounted && recentBlindates.length === 0) {
      // Lấy cuộc hẹn mới nhất
      fetchBlindates({ page: 1, limit: 5, sort: 'createdAt', order: 'desc' })
        .then(data => {
          if (isMounted && data?.blindates) {
            setRecentBlindates(data.blindates);
          }
        })
        .catch(err => console.error('Error fetching recent blindates:', err));
    }

    if (isMounted && pendingReports.length === 0) {
      // Lấy báo cáo đang chờ xử lý
      fetchReports({ page: 1, limit: 5, status: 'chờ_xử_lý', sort: 'createdAt', order: 'desc' })
        .then(data => {
          if (isMounted && data?.reports) {
            setPendingReports(data.reports);
          }
        })
        .catch(err => console.error('Error fetching pending reports:', err));
    }

    if (isMounted && pendingSafetyReports.length === 0) {
      // Lấy báo cáo an toàn đang chờ xử lý
      fetchSafetyReports({ page: 1, limit: 5, status: 'chờ_xử_lý', sort: 'createdAt', order: 'desc' })
        .then(data => {
          if (isMounted && data?.safetyReports) {
            setPendingSafetyReports(data.safetyReports);
          }
        })
        .catch(err => console.error('Error fetching pending safety reports:', err));
    }
    
    if (isMounted && pendingVerifications.length === 0) {
      // Lấy người dùng đang chờ xác minh
      fetchUsers({ page: 1, limit: 5, verificationStatus: 'pending', sort: 'createdAt', order: 'desc' })
        .then(data => {
          if (isMounted && data?.users) {
            setPendingVerifications(data.users);
          }
        })
        .catch(err => console.error('Error fetching pending verifications:', err));
    }

    // Cleanup function để tránh memory leak
    return () => {
      isMounted = false;
    };
  }, [
    isAdmin, 
    navigate, 
    fetchDashboardStats, 
    fetchUsers, 
    fetchBlindates, 
    fetchReports, 
    fetchSafetyReports, 
    dashboardStats,
    recentUsers.length,
    recentBlindates.length,
    pendingReports.length,
    pendingSafetyReports.length,
    pendingVerifications.length
  ]);

  if (loading || !dashboardStats) {
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
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Tổng người dùng" 
            value={dashboardStats.users.total} 
            icon={<FaUsers className="text-amber-500" />} 
            change={dashboardStats.users.newToday}
            changeLabel="mới hôm nay"
          />
          <StatCard 
            title="Người dùng đã xác minh" 
            value={dashboardStats.users.verified} 
            icon={<FaUserCheck className="text-green-500" />} 
            percentage={Math.round((dashboardStats.users.verified / dashboardStats.users.total) * 100)}
          />
          <StatCard 
            title="Đang chờ xác minh" 
            value={pendingVerifications.length} 
            icon={<FaUserCheck className="text-yellow-500" />} 
            linkTo="/admin/users?verificationStatus=pending"
          />
          <StatCard 
            title="Người dùng Premium" 
            value={dashboardStats.users.premium} 
            icon={<FaCrown className="text-yellow-500" />} 
            percentage={Math.round((dashboardStats.users.premium / dashboardStats.users.total) * 100)}
          />
          <StatCard 
            title="Người dùng hoạt động" 
            value={dashboardStats.users.active} 
            icon={<FaUsers className="text-blue-500" />} 
            percentage={Math.round((dashboardStats.users.active / dashboardStats.users.total) * 100)}
          />
        </div>
        
        {/* Thống kê cuộc hẹn */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Tổng cuộc hẹn" 
            value={dashboardStats.blindates.total} 
            icon={<FaCalendarAlt className="text-amber-500" />} 
            change={dashboardStats.blindates.today}
            changeLabel="mới hôm nay"
          />
          <StatCard 
            title="Cuộc hẹn đang chờ" 
            value={dashboardStats.blindates.pending} 
            icon={<FaCalendarAlt className="text-amber-300" />} 
            percentage={Math.round((dashboardStats.blindates.pending / dashboardStats.blindates.total) * 100)}
          />
          <StatCard 
            title="Cuộc hẹn đã chấp nhận" 
            value={dashboardStats.blindates.accepted} 
            icon={<FaCalendarAlt className="text-green-500" />} 
            percentage={Math.round((dashboardStats.blindates.accepted / dashboardStats.blindates.total) * 100)}
          />
          <StatCard 
            title="Cuộc hẹn đã hoàn thành" 
            value={dashboardStats.blindates.completed} 
            icon={<FaCalendarAlt className="text-blue-500" />} 
            percentage={Math.round((dashboardStats.blindates.completed / dashboardStats.blindates.total) * 100)}
          />
        </div>
        
        {/* Thống kê khác */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Tổng matches" 
            value={dashboardStats.matches.total} 
            icon={<FaHeart className="text-red-500" />} 
            change={dashboardStats.matches.today}
            changeLabel="mới hôm nay"
          />
          <StatCard 
            title="Tổng tin nhắn" 
            value={dashboardStats.messages.total} 
            icon={<FaComments className="text-blue-500" />} 
            change={dashboardStats.messages.today}
            changeLabel="mới hôm nay"
          />
          <StatCard 
            title="Báo cáo đang chờ" 
            value={dashboardStats.reports.pending} 
            icon={<FaExclamationTriangle className="text-yellow-500" />} 
          />
          <StatCard 
            title="Báo cáo an toàn đang chờ" 
            value={dashboardStats.safety.pending} 
            icon={<FaShieldAlt className="text-red-500" />} 
          />
        </div>
        
        {/* Biểu đồ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Phân bố giới tính</h2>
            <div className="h-64">
              <PieChart 
                data={{
                  labels: ['Nam', 'Nữ', 'Khác'],
                  datasets: [
                    {
                      data: [dashboardStats.users.gender.male, dashboardStats.users.gender.female, dashboardStats.users.gender.other],
                      backgroundColor: ['#3B82F6', '#EC4899', '#10B981'],
                      borderColor: ['#2563EB', '#DB2777', '#059669'],
                      borderWidth: 1,
                    }
                  ]
                }}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Trạng thái cuộc hẹn</h2>
            <div className="h-64">
              <PieChart 
                data={{
                  labels: ['Đang chờ', 'Đã chấp nhận', 'Đã hoàn thành', 'Đã từ chối', 'Đã hủy'],
                  datasets: [
                    {
                      data: [
                        dashboardStats.blindates.pending,
                        dashboardStats.blindates.accepted,
                        dashboardStats.blindates.completed,
                        dashboardStats.blindates.rejected,
                        dashboardStats.blindates.cancelled
                      ],
                      backgroundColor: ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#6B7280'],
                      borderColor: ['#D97706', '#059669', '#2563EB', '#DC2626', '#4B5563'],
                      borderWidth: 1,
                    }
                  ]
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Hoạt động gần đây */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Người dùng mới nhất</h2>
            <RecentActivityTable 
              data={recentUsers}
              columns={[
                { header: 'Tên', accessor: 'fullName' },
                { header: 'Email', accessor: 'email' },
                { header: 'Giới tính', accessor: 'gender', 
                  cell: (row) => row.gender === 'male' ? 'Nam' : row.gender === 'female' ? 'Nữ' : 'Khác' 
                },
                { header: 'Ngày đăng ký', accessor: 'createdAt', 
                  cell: (row) => new Date(row.createdAt).toLocaleDateString('vi-VN') 
                }
              ]}
              onRowClick={(row) => navigate(`/admin/users/${row._id}`)}
            />
            <div className="mt-4 text-right">
              <button 
                onClick={() => navigate('/admin/users')}
                className="text-amber-600 hover:text-amber-800 font-medium"
              >
                Xem tất cả
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Cuộc hẹn mới nhất</h2>
            <RecentActivityTable 
              data={recentBlindates}
              columns={[
                { header: 'ID', accessor: '_id', 
                  cell: (row) => row._id.substring(row._id.length - 6) 
                },
                { header: 'Trạng thái', accessor: 'status',
                  cell: (row) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.status === 'chờ_xử_lý' ? 'bg-amber-100 text-amber-800' :
                      row.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      row.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      row.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {row.status === 'chờ_xử_lý' ? 'Đang chờ' :
                       row.status === 'accepted' ? 'Đã chấp nhận' :
                       row.status === 'rejected' ? 'Đã từ chối' :
                       row.status === 'completed' ? 'Đã hoàn thành' :
                       row.status === 'cancelled' ? 'Đã hủy' : 'Không xác định'}
                    </span>
                  )
                },
                { header: 'Ngày tạo', accessor: 'createdAt', 
                  cell: (row) => new Date(row.createdAt).toLocaleDateString('vi-VN') 
                }
              ]}
              onRowClick={(row) => navigate(`/admin/blindates/${row._id}`)}
            />
            <div className="mt-4 text-right">
              <button 
                onClick={() => navigate('/admin/blindates')}
                className="text-amber-600 hover:text-amber-800 font-medium"
              >
                Xem tất cả
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;