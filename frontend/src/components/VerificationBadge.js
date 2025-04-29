import React, { useState } from 'react';
import { FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const VerificationBadge = ({ isVerified, size = 'md' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  return (
    <div className="inline-flex items-center relative">
      {isVerified ? (
        <FaCheckCircle 
          className={`${sizeClasses[size]} text-green-500 ml-1 cursor-help`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        />
      ) : (
        <FaInfoCircle 
          className={`${sizeClasses[size]} text-gray-400 ml-1 cursor-help`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        />
      )}
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 w-48 bg-white text-gray-800 shadow-lg rounded-lg p-2 text-sm border border-gray-200">
          {isVerified 
            ? "Người dùng đã xác minh danh tính" 
            : "Người dùng chưa xác minh danh tính"}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-gray-200"></div>
        </div>
      )}
    </div>
  );
};

export default VerificationBadge;