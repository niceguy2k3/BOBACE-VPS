import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaMapMarkerAlt, FaBirthdayCake } from 'react-icons/fa';
import UserActionMenu from './UserActionMenu';

const UserProfileCard = ({ user, showActions = true }) => {
  // Calculate age from birthDate
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        {/* Cover image or gradient background */}
        <div className="h-32 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
        
        {/* Profile image */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.fullName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-500 text-white text-3xl font-bold">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
        </div>
        
        {/* Action menu */}
        {showActions && (
          <div className="absolute top-2 right-2">
            <UserActionMenu user={user} />
          </div>
        )}
      </div>
      
      <div className="pt-16 pb-6 px-6">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{user.fullName}</h2>
          
          <div className="flex items-center justify-center mt-1 text-gray-600 text-sm">
            <FaBirthdayCake className="mr-1" />
            <span>{user.birthDate ? `${calculateAge(user.birthDate)} tuổi` : 'Không có thông tin'}</span>
          </div>
          
          <div className="flex items-center justify-center mt-1 text-gray-600 text-sm">
            <FaMapMarkerAlt className="mr-1" />
            <span>
              {user.city ? user.city : ''}
              {user.distance !== undefined && (
                <span className="ml-1">
                  {user.distance < 1000 
                    ? `(${Math.round(user.distance)} m)` 
                    : `(${(user.distance / 1000).toFixed(1)} km)`}
                </span>
              )}
            </span>
          </div>
        </div>
        
        {user.bio && (
          <div className="mb-4">
            <p className="text-gray-700 text-center">{user.bio}</p>
          </div>
        )}
        
        <div className="flex justify-center">
          <Link 
            to={`/profile/${user._id}`}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition-colors duration-200"
          >
            <FaUser className="inline mr-2" />
            Xem hồ sơ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;