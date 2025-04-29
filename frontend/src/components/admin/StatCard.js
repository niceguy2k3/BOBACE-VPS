import React, { memo } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

/**
 * StatCard Component
 * 
 * A card component for displaying statistics in the admin dashboard.
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the statistic
 * @param {number|string} props.value - The main value to display
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {number} [props.change] - Optional change value (e.g. new users today)
 * @param {string} [props.changeLabel] - Label for the change value
 * @param {number} [props.percentage] - Optional percentage to display
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element}
 */
const StatCard = memo(({ 
  title, 
  value, 
  icon, 
  change, 
  changeLabel, 
  percentage, 
  className = '' 
}) => {
  // Format large numbers with commas
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <div className="text-2xl">{icon}</div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-800">{formatNumber(value)}</p>
          
          {change !== undefined && (
            <div className="flex items-center mt-2 text-sm">
              <span className={`flex items-center ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change > 0 ? <FaArrowUp className="mr-1" /> : change < 0 ? <FaArrowDown className="mr-1" /> : null}
                {Math.abs(change)}
              </span>
              {changeLabel && <span className="ml-1 text-gray-600">{changeLabel}</span>}
            </div>
          )}
        </div>
        
        {percentage !== undefined && (
          <div className="text-right">
            <div className={`text-lg font-semibold ${
              percentage >= 70 ? 'text-green-500' : 
              percentage >= 40 ? 'text-amber-500' : 
              'text-red-500'
            }`}>
              {percentage}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Chỉ render lại khi các props quan trọng thay đổi
  return prevProps.value === nextProps.value && 
         prevProps.change === nextProps.change && 
         prevProps.percentage === nextProps.percentage;
});

export default StatCard;
