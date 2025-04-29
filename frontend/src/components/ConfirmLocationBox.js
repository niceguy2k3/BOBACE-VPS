import React from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaCheck } from 'react-icons/fa';

const ConfirmLocationBox = ({ location, onScheduleDate, showScheduleButton = true }) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-6">
      <div className="flex items-center mb-3">
        <FaCheck className="text-green-500 mr-2" />
        <h3 className="text-lg font-medium text-green-800">Địa điểm đã được xác nhận</h3>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="flex items-start">
          <FaMapMarkerAlt className="text-green-600 mt-1 mr-3" />
          <div>
            <p className="font-medium text-green-800">{location.name}</p>
            <p className="text-green-600 text-sm mt-1">{location.address}</p>
          </div>
        </div>
      </div>
      
      {showScheduleButton && (
        <div className="flex justify-end">
          <button
            onClick={onScheduleDate}
            className="flex items-center py-2.5 px-5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <FaCalendarAlt className="mr-2" />
            Lên lịch hẹn
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfirmLocationBox;

