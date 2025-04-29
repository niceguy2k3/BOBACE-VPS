import React, { useEffect, useRef, memo } from 'react';
import Chart from 'chart.js/auto';
import { isEqual } from 'lodash';

// Sử dụng memo để tránh render lại khi props không thay đổi
const LineChart = memo(({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const previousData = useRef(null);

  useEffect(() => {
    // Kiểm tra xem dữ liệu có thay đổi không
    if (isEqual(previousData.current, data)) {
      return; // Không cập nhật biểu đồ nếu dữ liệu không thay đổi
    }
    
    previousData.current = data;

    // Nếu không có dữ liệu, không tạo biểu đồ
    if (!data || !data.datasets || !data.labels) {
      return;
    }

    // Đảm bảo canvas đã được tạo
    if (!chartRef.current) {
      return;
    }

    // Hủy biểu đồ cũ nếu có
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // Tạo biểu đồ mới
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500 // Giảm thời gian animation để tránh lag
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="w-full h-full">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}, (prevProps, nextProps) => {
  // Sử dụng isEqual để so sánh sâu các props
  return isEqual(prevProps.data, nextProps.data);
});

export default LineChart;