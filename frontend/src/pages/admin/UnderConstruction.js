import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useLocation } from 'react-router-dom';

const UnderConstruction = () => {
  const location = useLocation();
  const pageName = location.pathname.split('/').pop();
  
  // Capitalize the first letter and format the page name
  const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold text-amber-800 mb-4">Trang {formattedPageName} đang được xây dựng</h1>
          <div className="w-24 h-24 mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-amber-600">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-6">
            Chúng tôi đang làm việc để hoàn thiện trang này. Vui lòng quay lại sau.
          </p>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-amber-700">
            <p className="font-medium">Tính năng này sẽ sớm được triển khai!</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UnderConstruction;