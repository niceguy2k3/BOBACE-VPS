import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaCalendarAlt, FaHeart, FaComments, FaExclamationTriangle, FaShieldAlt, FaBell, FaCog, FaSignOutAlt, FaBars, FaTimes, FaChartBar, FaBullhorn } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';

const AdminLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Kiểm tra quyền admin
  if (!isAdmin) {
    navigate('/');
    return null;
  }

  const menuItems = [
    // { path: '/admin', icon: <FaHome />, label: 'Dashboard' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Người dùng' },
    { path: '/admin/blindates', icon: <FaCalendarAlt />, label: 'Blind dates' },
    { path: '/admin/matches', icon: <FaHeart />, label: 'Matches' },
    { path: '/admin/reports', icon: <FaExclamationTriangle />, label: 'Báo cáo' },
    { path: '/admin/system-notifications', icon: <FaBullhorn />, label: 'Thông báo hệ thống' },
    { path: '/admin/statistics', icon: <FaChartBar />, label: 'Thống kê' },
    { path: '/admin/settings', icon: <FaCog />, label: 'Cài đặt' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-amber-800 text-white">
          <div className="flex items-center justify-between h-16 px-4 border-b border-amber-700">
            <Link to="/admin" className="text-xl font-bold">BOBACE Admin</Link>
            <button onClick={() => setSidebarOpen(false)} className="text-white">
              <FaTimes size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    location.pathname === item.path
                      ? 'bg-amber-700 text-white'
                      : 'text-amber-100 hover:bg-amber-700 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-amber-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-amber-100 rounded-md hover:bg-amber-700 hover:text-white"
            >
              <FaSignOutAlt className="mr-3" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-amber-800 text-white">
          <div className="flex items-center h-16 px-4 border-b border-amber-700">
            <Link to="/admin" className="text-xl font-bold">BOBACE Admin</Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    location.pathname === item.path
                      ? 'bg-amber-700 text-white'
                      : 'text-amber-100 hover:bg-amber-700 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-amber-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-amber-100 rounded-md hover:bg-amber-700 hover:text-white"
            >
              <FaSignOutAlt className="mr-3" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 lg:hidden"
          >
            <FaBars size={24} />
          </button>
          <div className="flex items-center">
            <img
              src={currentUser?.avatar || 'https://via.placeholder.com/40'}
              alt={currentUser?.fullName}
              className="w-8 h-8 rounded-full mr-2 object-cover"
            />
            <span className="text-gray-800 font-medium">{currentUser?.fullName}</span>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;