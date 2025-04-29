import React, { useState, useEffect, useRef } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * DataTable Component
 * 
 * A reusable data table component with sorting, filtering, and pagination.
 * 
 * @param {Object} props
 * @param {Array} props.data - The data to display in the table
 * @param {Array} props.columns - Column configuration objects
 * @param {Function} [props.onRowClick] - Function to call when a row is clicked
 * @param {boolean} [props.isLoading] - Whether the data is loading
 * @param {Object} [props.pagination] - Pagination configuration
 * @param {number} props.pagination.total - Total number of items
 * @param {number} props.pagination.page - Current page
 * @param {number} props.pagination.limit - Items per page
 * @param {Function} props.pagination.onPageChange - Function to call when page changes
 * @param {Function} [props.onSort] - Function to call when sorting changes
 * @param {Function} [props.onFilter] - Function to call when filter changes
 * @param {string} [props.searchValue] - Controlled search input value (for debouncing)
 * @returns {JSX.Element}
 */
const DataTable = ({ 
  data = [], 
  columns = [], 
  onRowClick,
  isLoading = false,
  pagination = null,
  onSort = null,
  onFilter = null,
  searchValue = ''
}) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterValue, setFilterValue] = useState(searchValue);
  const [filteredData, setFilteredData] = useState(data);
  const searchInputRef = useRef(null);
  
  // Update filterValue when searchValue prop changes
  useEffect(() => {
    setFilterValue(searchValue);
  }, [searchValue]);
  
  // Update filtered data when data changes
  useEffect(() => {
    if (onFilter) {
      // If external filtering is provided, use the data as is
      setFilteredData(data);
    } else {
      // Otherwise, filter locally
      if (filterValue.trim() === '') {
        setFilteredData(data);
      } else {
        const lowercasedFilter = filterValue.toLowerCase();
        const filtered = data.filter(item => {
          return Object.keys(item).some(key => {
            const value = item[key];
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(lowercasedFilter);
          });
        });
        setFilteredData(filtered);
      }
    }
  }, [data, filterValue, onFilter]);

  // Handle sort
  const handleSort = (field) => {
    let direction = 'asc';
    
    if (sortField === field) {
      direction = sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc';
    }
    
    setSortField(direction === null ? null : field);
    setSortDirection(direction);
    
    if (onSort) {
      onSort(field, direction);
    } else if (direction) {
      // Local sorting
      const sorted = [...filteredData].sort((a, b) => {
        // Get values based on whether field is a function or a string
        const aValue = typeof field === 'function' ? field(a) : a[field];
        const bValue = typeof field === 'function' ? field(b) : b[field];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (typeof aValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return direction === 'asc' ? comparison : -comparison;
        } else {
          const comparison = aValue - bValue;
          return direction === 'asc' ? comparison : -comparison;
        }
      });
      
      setFilteredData(direction === null ? data : sorted);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterValue(value);
    
    if (onFilter) {
      onFilter(value);
    }
    
    // Ensure input keeps focus after state update
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  };

  // Render sort icon
  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="ml-1 text-gray-400" />;
    return sortDirection === 'asc' ? 
      <FaSortUp className="ml-1 text-amber-500" /> : 
      <FaSortDown className="ml-1 text-amber-500" />;
  };

  // Render pagination
  const renderPagination = () => {
    if (!pagination) return null;
    
    const { total, page, limit, onPageChange } = pagination;
    const totalPages = Math.ceil(total / limit);
    
    return (
      <div className="flex items-center justify-between px-6 py-5 bg-amber-50 border-t border-amber-200 rounded-b-xl">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-amber-700">
              Hiển thị <span className="font-medium text-amber-800">{((page - 1) * limit) + 1}</span> đến <span className="font-medium text-amber-800">{Math.min(page * limit, total)}</span> trong số <span className="font-medium text-amber-800">{total}</span> kết quả
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px overflow-hidden" aria-label="Pagination">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium transition-colors ${
                  page <= 1 
                    ? 'bg-amber-100 text-amber-400 cursor-not-allowed border-amber-200' 
                    : 'bg-white text-amber-700 hover:bg-amber-100 border-amber-200'
                }`}
              >
                <span className="sr-only">Previous</span>
                <FaChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                      page === pageNum 
                        ? 'z-10 bg-amber-600 border-amber-600 text-white' 
                        : 'bg-white border-amber-200 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium transition-colors ${
                  page >= totalPages 
                    ? 'bg-amber-100 text-amber-400 cursor-not-allowed border-amber-200' 
                    : 'bg-white text-amber-700 hover:bg-amber-100 border-amber-200'
                }`}
              >
                <span className="sr-only">Next</span>
                <FaChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-amber-100">
        <div className="flex justify-center items-center p-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-600 absolute top-0 left-0"></div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!filteredData.length) {
    return (
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-amber-100">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-amber-500" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                className="pl-10 pr-4 py-2.5 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent block w-full text-sm text-amber-800 bg-white shadow-sm"
                placeholder="Tìm kiếm..."
                value={filterValue}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="text-center py-16 flex flex-col items-center">
            <svg className="w-16 h-16 text-amber-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-amber-800 text-lg font-medium">Không có dữ liệu</p>
            <p className="text-amber-600 text-sm mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
          </div>
        </div>
        {renderPagination()}
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-amber-100">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-amber-500" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="pl-10 pr-4 py-2.5 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent block w-full text-sm text-amber-800 bg-white shadow-sm"
              placeholder="Tìm kiếm..."
              value={filterValue}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-200">
            <thead className="bg-amber-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={`px-6 py-3.5 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider ${column.sortable !== false ? 'cursor-pointer hover:bg-amber-100 transition-colors' : ''}`}
                    onClick={() => column.sortable !== false && handleSort(column.accessor)}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {column.sortable !== false && renderSortIcon(column.accessor)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-amber-100">
              {filteredData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={onRowClick ? "hover:bg-amber-50 cursor-pointer transition-colors" : ""}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                      {column.cell ? 
                        (typeof column.accessor === 'function' 
                          ? column.cell(column.accessor(row), row) 
                          : column.cell(row[column.accessor], row)
                        ) : 
                        (typeof column.accessor === 'function' 
                          ? (column.accessor(row) === undefined || column.accessor(row) === null 
                              ? <span className="text-amber-400 italic text-sm">N/A</span> 
                              : <span className="text-amber-800">{column.accessor(row)}</span>)
                          : (row[column.accessor] === undefined || row[column.accessor] === null 
                              ? <span className="text-amber-400 italic text-sm">N/A</span> 
                              : (typeof row[column.accessor] === 'object' 
                                  ? <span className="text-amber-700 text-sm font-mono">{JSON.stringify(row[column.accessor]).substring(0, 30) + '...'}</span> 
                                  : <span className="text-amber-800">{row[column.accessor]}</span>)
                          )
                        )
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {renderPagination()}
    </div>
  );
};

export default DataTable;