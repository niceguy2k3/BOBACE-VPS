const Report = require('../../models/report.model');
const User = require('../../models/user.model');
const mongoose = require('mongoose');

/**
 * Lấy danh sách báo cáo với phân trang và lọc
 */
exports.getAllReports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      sort = 'createdAt', 
      order = 'desc' 
    } = req.query;

    // Xây dựng query
    const query = {};

    // Lọc theo trạng thái
    if (status) {
      query.status = status;
      console.log(`Filtering reports by status: ${status}`);
    }

    // Thực hiện truy vấn với phân trang
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { [sort]: order === 'asc' ? 1 : -1 },
      populate: [
        { path: 'reporter', select: 'fullName avatar email' },
        { path: 'reported', select: 'fullName avatar email' }
      ]
    };

    // Lấy dữ liệu từ database
    const reports = await Report.paginate(query, options);
    
    console.log(`Found ${reports.docs.length} reports matching query:`, JSON.stringify(query));
    
    // Chuyển đổi dữ liệu để phù hợp với frontend
    const formattedReports = reports.docs.map(report => {
      // Kiểm tra xem report.reporter có tồn tại không
      const reportingUser = report.reporter ? {
        _id: report.reporter._id,
        fullName: report.reporter.fullName,
        avatar: report.reporter.avatar,
        email: report.reporter.email
      } : {
        _id: 'unknown',
        fullName: 'Người dùng không xác định',
        avatar: null,
        email: 'unknown@example.com'
      };
      
      // Kiểm tra xem report.reported có tồn tại không
      const reportedUser = report.reported ? {
        _id: report.reported._id,
        fullName: report.reported.fullName,
        avatar: report.reported.avatar,
        email: report.reported.email
      } : {
        _id: 'unknown',
        fullName: 'Người dùng không xác định',
        avatar: null,
        email: 'unknown@example.com'
      };
      
      return {
        _id: report._id,
        reportId: report._id,
        reportingUser,
        reportedUser,
        type: report.type,
        reason: report.reason,
        description: report.description,
        status: report.status,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        evidence: report.evidence || []
      };
    });

    return res.status(200).json({
      reports: formattedReports,
      pagination: {
        total: reports.totalDocs,
        page: reports.page,
        limit: reports.limit,
        pages: reports.totalPages
      }
    });
  } catch (error) {
    console.error('Error in getAllReports:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy danh sách báo cáo' });
  }
};

/**
 * Lấy thông tin chi tiết báo cáo theo ID
 */
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy báo cáo từ database
    const report = await Report.findById(id)
      .populate('reporter', 'fullName avatar email')
      .populate('reported', 'fullName avatar email');

    if (!report) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
    }

    // Chuyển đổi dữ liệu để phù hợp với frontend
    const formattedReport = {
      reportId: report._id,
      reportingUser: report.reporter ? {
        _id: report.reporter._id,
        fullName: report.reporter.fullName,
        avatar: report.reporter.avatar,
        email: report.reporter.email
      } : {
        _id: 'unknown',
        fullName: 'Người dùng không xác định',
        avatar: null,
        email: 'unknown@example.com'
      },
      reportedUser: report.reported ? {
        _id: report.reported._id,
        fullName: report.reported.fullName,
        avatar: report.reported.avatar,
        email: report.reported.email
      } : {
        _id: 'unknown',
        fullName: 'Người dùng không xác định',
        avatar: null,
        email: 'unknown@example.com'
      },
      type: report.type,
      reason: report.reason,
      description: report.description,
      status: report.status,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      evidence: report.evidence || [],
      adminNotes: report.adminNotes
    };

    return res.status(200).json(formattedReport);
  } catch (error) {
    console.error('Error in getReportById:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy thông tin báo cáo' });
  }
};

/**
 * Cập nhật trạng thái báo cáo
 */
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, resolution } = req.body;

    console.log('Updating report status:', { id, status, adminNotes, resolution });
    console.log('Request body:', req.body);
    console.log('Request params:', req.params);

    if (!['chờ_xử_lý', 'in_progress', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    // Tìm báo cáo trong database
    console.log('Finding report with ID:', id);
    let report;
    try {
      report = await Report.findById(id);
      
      if (!report) {
        console.log('Report not found with ID:', id);
        return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
      }
      
      console.log('Found report:', { id: report._id, status: report.status });
    } catch (findError) {
      console.error('Error finding report:', findError);
      return res.status(500).json({ message: 'Lỗi khi tìm báo cáo', error: findError.message });
    }

    // Cập nhật thông tin báo cáo
    report.status = status;
    if (adminNotes) report.adminNotes = adminNotes;
    if (resolution) report.resolution = resolution;
    report.updatedAt = new Date();

    // Lưu thay đổi
    await report.save();

    // Lấy báo cáo đã cập nhật với thông tin người dùng
    const updatedReport = await Report.findById(id)
      .populate('reporter', 'fullName avatar email')
      .populate('reported', 'fullName avatar email');

    // Chuyển đổi dữ liệu để phù hợp với frontend
    const formattedReport = {
      reportId: updatedReport._id,
      reportingUser: updatedReport.reporter ? {
        _id: updatedReport.reporter._id,
        fullName: updatedReport.reporter.fullName,
        avatar: updatedReport.reporter.avatar,
        email: updatedReport.reporter.email
      } : {
        _id: 'unknown',
        fullName: 'Người dùng không xác định',
        avatar: null,
        email: 'unknown@example.com'
      },
      reportedUser: updatedReport.reported ? {
        _id: updatedReport.reported._id,
        fullName: updatedReport.reported.fullName,
        avatar: updatedReport.reported.avatar,
        email: updatedReport.reported.email
      } : {
        _id: 'unknown',
        fullName: 'Người dùng không xác định',
        avatar: null,
        email: 'unknown@example.com'
      },
      type: updatedReport.type,
      reason: updatedReport.reason,
      description: updatedReport.description,
      status: updatedReport.status,
      createdAt: updatedReport.createdAt,
      updatedAt: updatedReport.updatedAt,
      evidence: updatedReport.evidence || [],
      adminNotes: updatedReport.adminNotes,
      resolution: updatedReport.resolution
    };

    return res.status(200).json({
      message: 'Cập nhật trạng thái báo cáo thành công',
      report: formattedReport
    });
  } catch (error) {
    console.error('Error in updateReportStatus:', error);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái báo cáo' });
  }
};

/**
 * Ban người dùng từ báo cáo
 */
exports.banUserFromReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Lý do cấm người dùng là bắt buộc' });
    }

    // Tìm báo cáo trong database
    const report = await Report.findById(id)
      .populate('reporter', 'fullName avatar email')
      .populate('reported', 'fullName avatar email');
    
    if (!report) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
    }

    // Kiểm tra xem report.reported có tồn tại không
    if (!report.reported) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng bị báo cáo trong báo cáo' });
    }
    
    // Cập nhật trạng thái người dùng bị báo cáo
    const reportedUser = await User.findById(report.reported._id);
    
    if (!reportedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng bị báo cáo' });
    }

    // Cấm người dùng
    reportedUser.banned = true;
    reportedUser.banReason = reason;
    reportedUser.bannedAt = new Date();
    await reportedUser.save();

    // Cập nhật báo cáo
    report.status = 'resolved';
    report.adminNotes = `Người dùng đã bị cấm với lý do: ${reason}`;
    report.adminAction = 'ban_permanent';
    report.updatedAt = new Date();
    await report.save();

    // Lấy báo cáo đã cập nhật
    const updatedReport = await Report.findById(id)
      .populate('reporter', 'fullName avatar email')
      .populate('reported', 'fullName avatar email');

    // Chuyển đổi dữ liệu để phù hợp với frontend
    const formattedReport = {
      reportId: updatedReport._id,
      reportingUser: updatedReport.reporter ? {
        _id: updatedReport.reporter._id,
        fullName: updatedReport.reporter.fullName,
        avatar: updatedReport.reporter.avatar,
        email: updatedReport.reporter.email
      } : {
        _id: 'unknown',
        fullName: 'Người dùng không xác định',
        avatar: null,
        email: 'unknown@example.com'
      },
      reportedUser: updatedReport.reported ? {
        _id: updatedReport.reported._id,
        fullName: updatedReport.reported.fullName,
        avatar: updatedReport.reported.avatar,
        email: updatedReport.reported.email,
        banned: true,
        banReason: reason,
        bannedAt: new Date().toISOString()
      } : {
        _id: 'unknown',
        fullName: 'Người dùng không xác định',
        avatar: null,
        email: 'unknown@example.com',
        banned: true,
        banReason: reason,
        bannedAt: new Date().toISOString()
      },
      type: updatedReport.type,
      reason: updatedReport.reason,
      description: updatedReport.description,
      status: updatedReport.status,
      createdAt: updatedReport.createdAt,
      updatedAt: updatedReport.updatedAt,
      evidence: updatedReport.evidence || [],
      adminNotes: updatedReport.adminNotes,
      adminAction: updatedReport.adminAction
    };

    return res.status(200).json({
      message: 'Đã cấm người dùng thành công',
      user: {
        _id: reportedUser._id,
        fullName: reportedUser.fullName,
        avatar: reportedUser.avatar,
        email: reportedUser.email,
        banned: true,
        banReason: reason,
        bannedAt: reportedUser.bannedAt
      },
      report: formattedReport
    });
  } catch (error) {
    console.error('Error in banUserFromReport:', error);
    return res.status(500).json({ message: 'Lỗi server khi cấm người dùng' });
  }
};