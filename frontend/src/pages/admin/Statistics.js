import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUsers, FaCalendarAlt, FaHeart, FaComments, FaSync, FaChartLine } from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import LineChart from '../../components/admin/LineChart';
import PieChart from '../../components/admin/PieChart';
import { getDashboardStats, getActivityStats } from '../../services/admin.service';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [userActivityData, setUserActivityData] = useState(null);
  const [blindateActivityData, setBlindateActivityData] = useState(null);
  const [matchActivityData, setMatchActivityData] = useState(null);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboardStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Không thể tải thống kê dashboard: ' + (error.response?.data?.message || error.message));
      setError('Không thể tải thống kê dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityStats = async (range = 'month') => {
    setActivityLoading(true);
    try {
      // Sử dụng hàm getActivityStats đã được cải tiến với fallback
      const data = await getActivityStats(range);
      
      if (data) {
        // Kiểm tra xem dữ liệu có đúng định dạng không
        if (!data.users || !data.blindates || !data.matches || !data.messages) {
          console.warn('Activity stats data format is incorrect:', data);
          toast.warning('Dữ liệu thống kê không đúng định dạng, đang sử dụng dữ liệu mẫu');
          // Tiếp tục xử lý với dữ liệu mẫu
        }
        
        // Hiển thị thông báo nếu đang sử dụng dữ liệu mẫu
        if (data._isMockData) {
          toast.info('Đang hiển thị dữ liệu mẫu do không thể kết nối đến máy chủ');
        }
        
        setUserActivityData({
          labels: data.users.labels,
          datasets: [
            {
              label: 'Người dùng mới',
              data: data.users.newUsers,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.3,
              fill: true,
            },
            {
              label: 'Người dùng hoạt động',
              data: data.users.activeUsers,
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              tension: 0.3,
              fill: true,
            }
          ]
        });
        
        setBlindateActivityData({
          labels: data.blindates.labels,
          datasets: [
            {
              label: 'Cuộc hẹn mới',
              data: data.blindates.created,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.3,
              fill: true,
            },
            {
              label: 'Cuộc hẹn hoàn thành',
              data: data.blindates.completed,
              borderColor: 'rgb(153, 102, 255)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              tension: 0.3,
              fill: true,
            }
          ]
        });
        
        setMatchActivityData({
          labels: data.matches.labels,
          datasets: [
            {
              label: 'Matches mới',
              data: data.matches.created,
              borderColor: 'rgb(255, 159, 64)',
              backgroundColor: 'rgba(255, 159, 64, 0.2)',
              tension: 0.3,
              fill: true,
            },
            {
              label: 'Tin nhắn',
              data: data.messages.sent,
              borderColor: 'rgb(255, 205, 86)',
              backgroundColor: 'rgba(255, 205, 86, 0.2)',
              tension: 0.3,
              fill: true,
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      toast.error('Không thể tải thống kê hoạt động: ' + (error.response?.data?.message || error.message));
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchActivityStats(timeRange);
  }, []);

  useEffect(() => {
    fetchActivityStats(timeRange);
  }, [timeRange]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  if (loading && !stats) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Thống kê</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Thống kê</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button 
              onClick={fetchDashboardStats} 
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
            >
              Thử lại
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Thống kê</h1>
          <button 
            onClick={() => {
              fetchDashboardStats();
              fetchActivityStats(timeRange);
            }}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaSync className="animate-spin" />
            Làm mới dữ liệu
          </button>
        </div>
        
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Tổng người dùng"
                value={stats.users.total}
                icon={<FaUsers className="text-blue-500" />}
                change={stats.users.newToday}
                changeLabel="mới hôm nay"
                className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow"
              />
              <StatCard
                title="Cuộc hẹn"
                value={stats.blindates.total}
                icon={<FaCalendarAlt className="text-purple-500" />}
                change={stats.blindates.completed}
                changeLabel="đã hoàn thành"
                className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow"
              />
              <StatCard
                title="Matches"
                value={stats.matches.total}
                icon={<FaHeart className="text-pink-500" />}
                change={stats.matches.today}
                changeLabel="mới hôm nay"
                className="border-l-4 border-pink-500 hover:shadow-lg transition-shadow"
              />
              <StatCard
                title="Tin nhắn"
                value={stats.messages.total}
                icon={<FaComments className="text-green-500" />}
                change={stats.messages.today}
                changeLabel="gửi hôm nay"
                className="border-l-4 border-green-500 hover:shadow-lg transition-shadow"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-lg font-semibold mb-4 text-blue-600 flex items-center">
                  <FaUsers className="mr-2" /> Phân bố giới tính
                </h2>
                <div className="h-64">
                  <PieChart
                    data={{
                      labels: ['Nam', 'Nữ', 'Khác'],
                      datasets: [
                        {
                          data: [stats.users.gender.male, stats.users.gender.female, stats.users.gender.other],
                          backgroundColor: [
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                          ],
                          borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 99, 132, 1)',
                            'rgba(255, 206, 86, 1)',
                          ],
                          borderWidth: 2,
                          hoverOffset: 10,
                        },
                      ],
                    }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-blue-100 p-2 rounded">
                    <div className="font-bold text-blue-600">{stats.users.gender.male}</div>
                    <div>Nam</div>
                  </div>
                  <div className="bg-pink-100 p-2 rounded">
                    <div className="font-bold text-pink-600">{stats.users.gender.female}</div>
                    <div>Nữ</div>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded">
                    <div className="font-bold text-yellow-600">{stats.users.gender.other}</div>
                    <div>Khác</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-lg font-semibold mb-4 text-purple-600 flex items-center">
                  <FaCalendarAlt className="mr-2" /> Trạng thái cuộc hẹn
                </h2>
                <div className="h-64">
                  <PieChart
                    data={{
                      labels: ['Đang chờ', 'Đã chấp nhận', 'Đã hoàn thành', 'Đã từ chối', 'Đã hủy'],
                      datasets: [
                        {
                          data: [
                            stats.blindates.pending,
                            stats.blindates.accepted,
                            stats.blindates.completed,
                            stats.blindates.rejected,
                            stats.blindates.cancelled
                          ],
                          backgroundColor: [
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(201, 203, 207, 0.8)'
                          ],
                          borderColor: [
                            'rgba(255, 206, 86, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 99, 132, 1)',
                            'rgba(201, 203, 207, 1)'
                          ],
                          borderWidth: 2,
                          hoverOffset: 10,
                        },
                      ],
                    }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-5 gap-1 text-center text-xs">
                  <div className="bg-yellow-100 p-1 rounded">
                    <div className="font-bold text-yellow-600">{stats.blindates.pending}</div>
                    <div>Chờ</div>
                  </div>
                  <div className="bg-blue-100 p-1 rounded">
                    <div className="font-bold text-blue-600">{stats.blindates.accepted}</div>
                    <div>Chấp nhận</div>
                  </div>
                  <div className="bg-green-100 p-1 rounded">
                    <div className="font-bold text-green-600">{stats.blindates.completed}</div>
                    <div>Hoàn thành</div>
                  </div>
                  <div className="bg-red-100 p-1 rounded">
                    <div className="font-bold text-red-600">{stats.blindates.rejected}</div>
                    <div>Từ chối</div>
                  </div>
                  <div className="bg-gray-100 p-1 rounded">
                    <div className="font-bold text-gray-600">{stats.blindates.cancelled}</div>
                    <div>Hủy</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-lg font-semibold mb-4 text-green-600 flex items-center">
                  <FaChartLine className="mr-2" /> Thống kê người dùng
                </h2>
                <div className="h-64">
                  <PieChart
                    data={{
                      labels: ['Thường', 'Premium', 'Đã xác minh', 'Đang hoạt động'],
                      datasets: [
                        {
                          data: [
                            stats.users.total - stats.users.premium,
                            stats.users.premium,
                            stats.users.verified,
                            stats.users.active
                          ],
                          backgroundColor: [
                            'rgba(201, 203, 207, 0.8)',
                            'rgba(255, 159, 64, 0.8)',
                            'rgba(153, 102, 255, 0.8)',
                            'rgba(75, 192, 192, 0.8)'
                          ],
                          borderColor: [
                            'rgba(201, 203, 207, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(75, 192, 192, 1)'
                          ],
                          borderWidth: 2,
                          hoverOffset: 10,
                        },
                      ],
                    }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
                  <div className="bg-gray-100 p-2 rounded">
                    <div className="font-bold text-gray-600">{stats.users.total - stats.users.premium}</div>
                    <div>Thường</div>
                  </div>
                  <div className="bg-orange-100 p-2 rounded">
                    <div className="font-bold text-orange-600">{stats.users.premium}</div>
                    <div>Premium</div>
                  </div>
                  <div className="bg-purple-100 p-2 rounded">
                    <div className="font-bold text-purple-600">{stats.users.verified}</div>
                    <div>Xác minh</div>
                  </div>
                  <div className="bg-green-100 p-2 rounded">
                    <div className="font-bold text-green-600">{stats.users.active}</div>
                    <div>Hoạt động</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <FaChartLine className="mr-2" /> Biểu đồ hoạt động theo thời gian
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        timeRange === 'week' 
                          ? 'bg-white text-blue-600 shadow-md' 
                          : 'bg-blue-600 bg-opacity-30 text-white hover:bg-opacity-40'
                      }`}
                      onClick={() => handleTimeRangeChange('week')}
                      disabled={activityLoading}
                    >
                      Tuần
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        timeRange === 'month' 
                          ? 'bg-white text-blue-600 shadow-md' 
                          : 'bg-blue-600 bg-opacity-30 text-white hover:bg-opacity-40'
                      }`}
                      onClick={() => handleTimeRangeChange('month')}
                      disabled={activityLoading}
                    >
                      Tháng
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        timeRange === 'year' 
                          ? 'bg-white text-blue-600 shadow-md' 
                          : 'bg-blue-600 bg-opacity-30 text-white hover:bg-opacity-40'
                      }`}
                      onClick={() => handleTimeRangeChange('year')}
                      disabled={activityLoading}
                    >
                      Năm
                    </button>
                  </div>
                </div>
                <p className="text-blue-100">
                  Dữ liệu được lấy trực tiếp từ MongoDB, hiển thị xu hướng hoạt động của người dùng, cuộc hẹn và tin nhắn theo thời gian. Nếu không có dữ liệu thực, hệ thống sẽ hiển thị dữ liệu mẫu với ít nhất 2 người dùng hoạt động.
                </p>
              </div>
              
              {activityLoading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-md">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải dữ liệu thống kê...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {userActivityData && (
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold mb-4 text-blue-600 flex items-center">
                        <FaUsers className="mr-2" /> Hoạt động người dùng
                      </h3>
                      <div className="h-80">
                        <LineChart data={userActivityData} />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm text-blue-500 mb-1">Tổng người dùng mới</div>
                          <div className="text-2xl font-bold text-blue-700">
                            {userActivityData.datasets[0].data.reduce((a, b) => a + b, 0)}
                          </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-sm text-green-500 mb-1">Tổng hoạt động</div>
                          <div className="text-2xl font-bold text-green-700">
                            {userActivityData.datasets[1].data.reduce((a, b) => a + b, 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {blindateActivityData && (
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold mb-4 text-purple-600 flex items-center">
                        <FaCalendarAlt className="mr-2" /> Hoạt động cuộc hẹn
                      </h3>
                      <div className="h-80">
                        <LineChart data={blindateActivityData} />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-pink-50 p-3 rounded-lg">
                          <div className="text-sm text-pink-500 mb-1">Tổng cuộc hẹn mới</div>
                          <div className="text-2xl font-bold text-pink-700">
                            {blindateActivityData.datasets[0].data.reduce((a, b) => a + b, 0)}
                          </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="text-sm text-purple-500 mb-1">Tổng hoàn thành</div>
                          <div className="text-2xl font-bold text-purple-700">
                            {blindateActivityData.datasets[1].data.reduce((a, b) => a + b, 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {matchActivityData && (
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold mb-4 text-orange-600 flex items-center">
                        <FaHeart className="mr-2" /> Hoạt động matches và tin nhắn
                      </h3>
                      <div className="h-80">
                        <LineChart data={matchActivityData} />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="text-sm text-orange-500 mb-1">Tổng matches mới</div>
                          <div className="text-2xl font-bold text-orange-700">
                            {matchActivityData.datasets[0].data.reduce((a, b) => a + b, 0)}
                          </div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <div className="text-sm text-yellow-500 mb-1">Tổng tin nhắn</div>
                          <div className="text-2xl font-bold text-yellow-700">
                            {matchActivityData.datasets[1].data.reduce((a, b) => a + b, 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-red-500">
                <h2 className="text-lg font-semibold mb-4 text-red-600">Báo cáo đang chờ xử lý</h2>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-4xl font-bold text-gray-800">{stats.reports.pending}</p>
                    <p className="text-sm text-gray-500 mt-1">Báo cáo người dùng cần xử lý</p>
                    <p className="text-xs text-gray-400 mt-2">Tổng số: {stats.reports.total} báo cáo</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-2">
                      <span className="text-red-500 text-2xl">
                        {Math.round((stats.reports.pending / stats.reports.total) * 100)}%
                      </span>
                    </div>
                    <button
                      onClick={() => window.location.href = '/admin/reports'}
                      className="block w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      Xem tất cả
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Statistics;