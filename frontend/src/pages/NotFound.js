import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-yellow-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Trang không tồn tại</h2>
        <p className="text-gray-600 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link 
          to="/" 
          className="bg-yellow-500 text-white px-6 py-3 rounded-md hover:bg-yellow-600"
        >
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;