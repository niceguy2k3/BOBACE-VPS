const User = require('../../models/user.model');
const Match = require('../../models/match.model');
const Blindate = require('../../models/blindate.model');
const Message = require('../../models/message.model');
const mongoose = require('mongoose');

/**
 * Lấy thống kê hoạt động theo thời gian
 */
exports.getActivityStats = async (req, res) => {
  try {
    const { range = 'month', useSampleData = false } = req.query;
    
    let labels = [];
    let groupBy = {};
    let startDate = new Date();
    
    // Cấu hình thời gian dựa trên range
    let dateFormat = '';
    
    if (range === 'week') {
      // Lấy 7 ngày gần nhất
      startDate.setDate(startDate.getDate() - 7);
      labels = Array(7).fill().map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toLocaleDateString('vi-VN', { weekday: 'short' });
      });
      
      dateFormat = '%Y-%m-%d';
    } else if (range === 'month') {
      // Lấy 30 ngày gần nhất
      startDate.setDate(startDate.getDate() - 30);
      
      // Chia thành 10 khoảng thời gian (mỗi khoảng 3 ngày)
      labels = Array(10).fill().map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 30 + (i * 3));
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      });
      
      dateFormat = '%Y-%m-%d';
    } else if (range === 'year') {
      // Lấy 12 tháng gần nhất
      startDate.setMonth(startDate.getMonth() - 12);
      labels = Array(12).fill().map((_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - 11 + i);
        return date.toLocaleDateString('vi-VN', { month: 'short' });
      });
      
      dateFormat = '%Y-%m';
    }
    
    // Thống kê người dùng mới
    const newUserStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Thống kê người dùng hoạt động
    // Sửa lỗi: Một số người dùng có thể không có trường lastActive
    const activeUserStats = await User.aggregate([
      {
        $match: {
          $or: [
            { lastActive: { $gte: startDate } },
            { updatedAt: { $gte: startDate } }  // Sử dụng updatedAt nếu lastActive không có
          ]
        }
      },
      {
        $group: {
          _id: {
            // Sử dụng lastActive nếu có, nếu không thì sử dụng updatedAt
            $dateToString: { 
              format: dateFormat, 
              date: { 
                $cond: { 
                  if: { $gt: ["$lastActive", null] }, 
                  then: "$lastActive", 
                  else: "$updatedAt" 
                } 
              } 
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Thống kê cuộc hẹn mới
    const newBlindateStats = await Blindate.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Thống kê cuộc hẹn hoàn thành
    const completedBlindateStats = await Blindate.aggregate([
      {
        $match: {
          status: 'completed',
          updatedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$updatedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Thống kê matches mới
    const newMatchStats = await Match.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Thống kê tin nhắn
    const messageStats = await Message.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Chuyển đổi dữ liệu thống kê thành mảng phù hợp với labels
    const processStatsData = (statsData, labels) => {
      const dataMap = {};
      
      // Tạo map từ dữ liệu thống kê
      statsData.forEach(item => {
        dataMap[item._id] = item.count;
      });
      
      console.log('Dữ liệu thống kê:', JSON.stringify(statsData));
      
      // Tạo mảng dữ liệu theo labels
      if (range === 'week') {
        return Array(7).fill().map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          
          // Thử các định dạng ngày khác nhau
          const dateStr = date.toISOString().split('T')[0];
          const dateStrFormat1 = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          const dateStrFormat2 = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
          
          return dataMap[dateStr] || dataMap[dateStrFormat1] || dataMap[dateStrFormat2] || 0;
        });
      } else if (range === 'month') {
        return Array(10).fill().map((_, i) => {
          let sum = 0;
          for (let j = 0; j < 3; j++) {
            const date = new Date();
            date.setDate(date.getDate() - 30 + (i * 3) + j);
            
            // Thử các định dạng ngày khác nhau
            const dateStr = date.toISOString().split('T')[0];
            const dateStrFormat1 = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const dateStrFormat2 = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            
            sum += dataMap[dateStr] || dataMap[dateStrFormat1] || dataMap[dateStrFormat2] || 0;
          }
          return sum;
        });
      } else if (range === 'year') {
        return Array(12).fill().map((_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - 11 + i);
          
          // Thử các định dạng tháng khác nhau
          const monthStr = date.toISOString().substring(0, 7);
          const monthStrFormat1 = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthStrFormat2 = `${date.getFullYear()}-${date.getMonth() + 1}`;
          
          return dataMap[monthStr] || dataMap[monthStrFormat1] || dataMap[monthStrFormat2] || 0;
        });
      }
      
      return [];
    };
    
    // Tạo dữ liệu mẫu nếu không có dữ liệu thực
    const generateSampleData = (length) => {
      return Array(length).fill().map(() => Math.floor(Math.random() * 50) + 10);
    };
    
    // Xử lý dữ liệu thống kê
    const newUsersData = processStatsData(newUserStats, labels);
    const activeUsersData = processStatsData(activeUserStats, labels);
    const newBlindatesData = processStatsData(newBlindateStats, labels);
    const completedBlindatesData = processStatsData(completedBlindateStats, labels);
    const newMatchesData = processStatsData(newMatchStats, labels);
    const messagesData = processStatsData(messageStats, labels);
    
    // Kiểm tra nếu có dữ liệu thực
    const hasRealData = 
      newUserStats.length > 0 || 
      activeUserStats.length > 0 || 
      newBlindateStats.length > 0 || 
      completedBlindateStats.length > 0 || 
      newMatchStats.length > 0 || 
      messageStats.length > 0;
    
    console.log('Có dữ liệu thực:', hasRealData);
    
    // Tạo dữ liệu mẫu nếu không có dữ liệu thực hoặc nếu useSampleData được đặt thành true
    if (!hasRealData || useSampleData === 'true') {
      console.log('Sử dụng dữ liệu mẫu cho thống kê hoạt động');
      
      // Tạo dữ liệu mẫu với 2 người dùng hoạt động
      const sampleUserData = Array(labels.length).fill().map((_, i) => {
        // Tạo dữ liệu tăng dần cho người dùng mới
        return Math.floor(Math.random() * 3) + (i % 3);
      });
      
      const sampleActiveUserData = Array(labels.length).fill().map(() => {
        // Luôn có ít nhất 2 người dùng hoạt động
        return Math.floor(Math.random() * 3) + 2;
      });
      
      const sampleBlindateData = Array(labels.length).fill().map(() => {
        return Math.floor(Math.random() * 2) + 1;
      });
      
      const sampleCompletedBlindateData = Array(labels.length).fill().map(() => {
        return Math.floor(Math.random() * 2);
      });
      
      const sampleMatchData = Array(labels.length).fill().map(() => {
        return Math.floor(Math.random() * 3) + 1;
      });
      
      const sampleMessageData = Array(labels.length).fill().map(() => {
        return Math.floor(Math.random() * 10) + 5;
      });
      
      // Chuẩn bị dữ liệu phản hồi với dữ liệu mẫu
      const response = {
        users: {
          labels,
          newUsers: sampleUserData,
          activeUsers: sampleActiveUserData
        },
        blindates: {
          labels,
          created: sampleBlindateData,
          completed: sampleCompletedBlindateData
        },
        matches: {
          labels,
          created: sampleMatchData
        },
        messages: {
          labels,
          sent: sampleMessageData
        }
      };
      
      return res.status(200).json(response);
    }
    
    console.log('Sử dụng dữ liệu thật cho thống kê hoạt động');
    
    // Chuẩn bị dữ liệu phản hồi với dữ liệu thật
    const response = {
      users: {
        labels,
        newUsers: newUsersData,
        activeUsers: activeUsersData
      },
      blindates: {
        labels,
        created: newBlindatesData,
        completed: completedBlindatesData
      },
      matches: {
        labels,
        created: newMatchesData
      },
      messages: {
        labels,
        sent: messagesData
      }
    };
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error in getActivityStats:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy thống kê hoạt động' });
  }
};