const Report = require('../models/report.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

/**
 * Validate base64 image string
 */
const validateBase64Image = (base64String) => {
  if (!base64String || typeof base64String !== 'string') {
    return { valid: false, error: 'Base64 string không hợp lệ' };
  }

  const dataUrlPattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i;
  const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
  
  let base64Data = base64String;
  let mimeType = 'image/jpeg';

  if (base64String.includes(',')) {
    const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
    if (matches) {
      mimeType = `image/${matches[1]}`;
      base64Data = matches[2];
    }
  }

  if (!base64Pattern.test(base64Data)) {
    return { valid: false, error: 'Định dạng base64 không hợp lệ' };
  }

  const sizeInBytes = (base64Data.length * 3) / 4;
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (sizeInBytes > maxSize) {
    return { valid: false, error: 'Kích thước ảnh vượt quá 5MB' };
  }

  const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validMimeTypes.includes(mimeType.toLowerCase())) {
    return { valid: false, error: 'Định dạng ảnh không được hỗ trợ' };
  }

  return { valid: true };
};

/**
 * Tạo báo cáo mới
 */
exports.createReport = async (req, res) => {
  try {
    const { reportedUserId, type, reason, description, evidence } = req.body;
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

    // Xử lý bằng chứng dưới dạng base64 (nếu có)
    if (evidence) {
      const evidenceArray = Array.isArray(evidence) ? evidence : [evidence];
      
      for (const evidenceItem of evidenceArray) {
        const validation = validateBase64Image(evidenceItem);
        if (validation.valid) {
          newReport.evidence.push(evidenceItem);
        } else {
          console.error('Invalid evidence image:', validation.error);
        }
      }
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

    // Xử lý bằng chứng mới dưới dạng base64 (nếu có)
    if (evidence) {
      const evidenceArray = Array.isArray(evidence) ? evidence : [evidence];
      
      for (const evidenceItem of evidenceArray) {
        const validation = validateBase64Image(evidenceItem);
        if (validation.valid) {
          report.evidence.push(evidenceItem);
        } else {
          console.error('Invalid evidence image:', validation.error);
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
