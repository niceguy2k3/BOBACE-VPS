import React, { memo } from 'react';
import { isEqual } from 'lodash';

// Sử dụng memo để tránh render lại khi props không thay đổi
const RecentActivityTable = memo(({ data, columns, onRowClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr 
              key={row._id || rowIndex} 
              className={onRowClick ? "hover:bg-gray-50 cursor-pointer" : ""}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-4 py-3 whitespace-nowrap">
                  {column.cell ? column.cell(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}, (prevProps, nextProps) => {
  // Chỉ render lại khi dữ liệu thực sự thay đổi
  return isEqual(prevProps.data, nextProps.data) && 
         isEqual(prevProps.columns, nextProps.columns);
});

export default RecentActivityTable;