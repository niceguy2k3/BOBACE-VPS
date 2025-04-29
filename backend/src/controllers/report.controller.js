const Report = require('../models/report.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../utils/cloudinaryHelper');

/**
 * Tạo báo cáo mới
 */
exports.createReport = async (req, res) => {
  try {
    const { reportedUserId, type, reason, description } = req.body;
    const reporterId = req.user._id;

    // Kiểm tra người dùng bị báo cáo có tồn tại không
    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng bị báo cáo' });
    }

    // Kiểm tra loại báo cáo hợp lệ
    const validTypes = ['inappropriate_content', 'harassment', 'fake_profile', 'spam', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Loại báo cáo không hợp lệ' });
    }

    // Tạo báo cáo mới
    const newReport = new Report({
      reporter: reporterId,
      reported: reportedUserId,
      type,
      reason,
      description,
      status: 'chờ_xử_lý',
      evidence: []
    });

    // Xử lý tải lên hình ảnh bằng chứng (nếu có)
    if (req.files && req.files.evidence) {
      console.log('Evidence files found:', req.files.evidence.length);
      const evidenceFiles = Array.isArray(req.files.evidence) 
        ? req.files.evidence 
        : [req.files.evidence];

      for (const file of evidenceFiles) {
        try {
          console.log('Uploading file to Cloudinary:', file.originalname);
          const result = await uploadToCloudinary(file.path, 'reports');
          console.log('Cloudinary upload result:', result.secure_url);
          newReport.evidence.push(result.secure_url);
        } catch (uploadError) {
          console.error('Error uploading evidence:', uploadError);
        }
      }
    } else {
      console.log('No evidence files found in request');
    }

    await newReport.save();

    return res.status(201).json({
      message: 'Báo cáo đã được gửi thành công',
      report: newReport
    });
  } catch (error) {
    console.error('Error in createReport:', error);
    return res.status(500).json({ message: 'Lỗi server khi tạo báo cáo' });
  }
};

/**
 * Lấy danh sách báo cáo của người dùng hiện tại
 */
exports.getUserReports = async (req, res) => {
  try {
    const userId = req.user._id;

    const reports = await Report.find({ reporter: userId })
      .populate('reported', 'fullName avatar email')
      .sort({ createdAt: -1 });

    return res.status(200).json(reports);
  } catch (error) {
    console.error('Error in getUserReports:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy danh sách báo cáo' });
  }
};

/**
 * Lấy chi tiết báo cáo
 */
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const report = await Report.findById(id)
      .populate('reporter', 'fullName avatar email')
      .populate('reported', 'fullName avatar email');

    if (!report) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
    }

    // Kiểm tra quyền truy cập (chỉ người báo cáo hoặc admin mới có thể xem)
    if (!report.reporter._id.equals(userId) && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'Bạn không có quyền xem báo cáo này' });
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error('Error in getReportById:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy thông tin báo cáo' });
  }
};

/**
 * Cập nhật báo cáo
 */
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { description, evidence } = req.body;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
    }

    // Kiểm tra quyền cập nhật (chỉ người báo cáo mới có thể cập nhật)
    if (!report.reporter.equals(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật báo cáo này' });
    }

    // Chỉ cho phép cập nhật báo cáo đang ở trạng thái chờ xử lý
    if (report.status !== 'chờ_xử_lý') {
      return res.status(400).json({ message: 'Không thể cập nhật báo cáo đã được xử lý' });
    }

    // Cập nhật thông tin
    if (description) {
      report.description = description;
    }

    // Xử lý tải lên hình ảnh bằng chứng mới (nếu có)
    if (req.files && req.files.evidence) {
      const evidenceFiles = Array.isArray(req.files.evidence) 
        ? req.files.evidence 
        : [req.files.evidence];

      for (const file of evidenceFiles) {
        try {
          const result = await uploadToCloudinary(file.path, 'reports');
          report.evidence.push(result.secure_url);
        } catch (uploadError) {
          console.error('Error uploading evidence:', uploadError);
        }
      }
    }

    report.updatedAt = Date.now();
    await report.save();

    return res.status(200).json({
      message: 'Cập nhật báo cáo thành công',
      report
    });
  } catch (error) {
    console.error('Error in updateReport:', error);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật báo cáo' });
  }
};

/**
 * Xóa báo cáo
 */
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
    }

    // Kiểm tra quyền xóa (chỉ người báo cáo hoặc admin mới có thể xóa)
    if (!report.reporter.equals(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa báo cáo này' });
    }

    // Chỉ cho phép xóa báo cáo đang ở trạng thái chờ xử lý
    if (report.status !== 'chờ_xử_lý' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Không thể xóa báo cáo đã được xử lý' });
    }

    await Report.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Xóa báo cáo thành công' });
  } catch (error) {
    console.error('Error in deleteReport:', error);
    return res.status(500).json({ message: 'Lỗi server khi xóa báo cáo' });
  }
};