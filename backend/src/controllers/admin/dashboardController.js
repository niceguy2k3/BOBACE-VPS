const User = require('../../models/user.model');
const Match = require('../../models/match.model');
const Blindate = require('../../models/blindate.model');
const Message = require('../../models/message.model');
const Report = require('../../models/report.model');
const SafetyReport = require('../../models/safetyReport.model');

/**
 * Lấy thống kê tổng quan cho dashboard
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query;
    
    // Lấy ngày hiện tại và đặt về đầu ngày
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Lấy ngày đầu tuần (Thứ 2)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    
    // Lấy ngày đầu tháng
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Lấy ngày đầu năm
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    // Thống kê người dùng
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: startOfWeek } });
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    const newUsersThisYear = await User.countDocuments({ createdAt: { $gte: startOfYear } });
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const activeUsers = await User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    
    // Thống kê giới tính
    const maleUsers = await User.countDocuments({ gender: 'male' });
    const femaleUsers = await User.countDocuments({ gender: 'female' });
    const otherGenderUsers = await User.countDocuments({ gender: { $nin: ['male', 'female'] } });
    
    // Thống kê cuộc hẹn
    const totalBlindates = await Blindate.countDocuments();
    const blindatesToday = await Blindate.countDocuments({ createdAt: { $gte: today } });
    const pendingBlindates = await Blindate.countDocuments({ status: 'pending' });
    const acceptedBlindates = await Blindate.countDocuments({ status: 'accepted' });
    const completedBlindates = await Blindate.countDocuments({ status: 'completed' });
    const rejectedBlindates = await Blindate.countDocuments({ status: 'rejected' });
    const cancelledBlindates = await Blindate.countDocuments({ status: 'cancelled' });
    
    // Thống kê matches
    const totalMatches = await Match.countDocuments();
    const matchesToday = await Match.countDocuments({ createdAt: { $gte: today } });
    
    // Thống kê tin nhắn
    const totalMessages = await Message.countDocuments();
    const messagesToday = await Message.countDocuments({ createdAt: { $gte: today } });
    
    // Thống kê báo cáo
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'chờ_xử_lý' });
    
    // Thống kê báo cáo an toàn
    const totalSafetyReports = await SafetyReport.countDocuments();
    const pendingSafetyReports = await SafetyReport.countDocuments({ status: 'chờ_xử_lý' });
    
    const stats = {
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
        newThisYear: newUsersThisYear,
        premium: premiumUsers,
        verified: verifiedUsers,
        active: activeUsers,
        gender: {
          male: maleUsers,
          female: femaleUsers,
          other: otherGenderUsers
        }
      },
      blindates: {
        total: totalBlindates,
        today: blindatesToday,
        pending: pendingBlindates,
        accepted: acceptedBlindates,
        completed: completedBlindates,
        rejected: rejectedBlindates,
        cancelled: cancelledBlindates
      },
      matches: {
        total: totalMatches,
        today: matchesToday
      },
      messages: {
        total: totalMessages,
        today: messagesToday
      },
      reports: {
        total: totalReports,
        pending: pendingReports
      },
      safety: {
        total: totalSafetyReports,
        pending: pendingSafetyReports
      }
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy thống kê dashboard' });
  }
};

/**
 * Lấy hoạt động gần đây
 */
exports.getRecentActivity = async (req, res) => {
  try {
    // Lấy 24 giờ trước
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Lấy người dùng mới trong 24 giờ qua
    const newUsers = await User.find({ 
      createdAt: { $gte: oneDayAgo } 
    })
    .select('_id fullName avatar email createdAt')
    .sort({ createdAt: -1 })
    .limit(10);
    
    // Lấy matches mới trong 24 giờ qua
    const newMatches = await Match.find({ 
      createdAt: { $gte: oneDayAgo } 
    })
    .populate('users', '_id fullName avatar')
    .sort({ createdAt: -1 })
    .limit(10);
    
    // Lấy cuộc hẹn mới trong 24 giờ qua
    const newBlindates = await Blindate.find({ 
      createdAt: { $gte: oneDayAgo } 
    })
    .populate('users', '_id fullName avatar')
    .sort({ createdAt: -1 })
    .limit(10);
    
    // Lấy báo cáo mới trong 24 giờ qua
    const newReports = await Report.find({ 
      createdAt: { $gte: oneDayAgo } 
    })
    .populate('reporter', '_id fullName avatar')
    .populate('reported', '_id fullName avatar')
    .sort({ createdAt: -1 })
    .limit(5);
    
    const activity = {
      newUsers,
      newMatches,
      newBlindates,
      newReports
    };

    return res.status(200).json(activity);
  } catch (error) {
    console.error('Error in getRecentActivity:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy hoạt động gần đây' });
  }
};