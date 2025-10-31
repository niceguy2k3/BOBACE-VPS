const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const PasswordReset = require('../models/passwordReset.model');
const EmailVerification = require('../models/emailVerification.model');
const { PASSWORD_MIN_LENGTH } = require('../config/constants');
const { sendPasswordResetEmail, sendVerificationEmail, testEmailConnection } = require('../utils/emailService');
const crypto = require('crypto');

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, fullName, birthDate, gender, avatar, photos, requireEmailVerification } = req.body;
    
    // Validate input
    if (!email || !password || !fullName || !birthDate || !gender) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Vui lòng nhập một địa chỉ email hợp lệ' });
    }
    
    // Validate avatar (required)
    if (!avatar) {
      return res.status(400).json({ message: 'Vui lòng tải lên ảnh đại diện' });
    }
    
    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ 
        message: `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự` 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }
    
    // Create new user with all provided data
    const userData = {
      email,
      password,
      fullName,
      birthDate,
      gender,
      avatar,
      ...req.body
    };
    
    // Add photos if provided
    if (photos && Array.isArray(photos) && photos.length > 0) {
      // Limit to maximum 6 photos
      userData.photos = photos.slice(0, 6);
    }
    
    // Remove confirmPassword if it exists
    if (userData.confirmPassword) {
      delete userData.confirmPassword;
    }
    
    // Tự động cấp premium 3 ngày cho người dùng mới
    userData.premium = true;
    userData.premiumUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 ngày
    
    // Nếu yêu cầu xác thực email
    if (requireEmailVerification) {
      userData.emailVerified = false;
    } else {
      userData.emailVerified = true; // Mặc định là đã xác thực nếu không yêu cầu
    }
    
    const user = new User(userData);
    await user.save();
    
    // Nếu yêu cầu xác thực email, tạo token và gửi email xác thực
    if (requireEmailVerification) {
      // Tạo token xác thực - sử dụng 16 bytes thay vì 32 để tạo token ngắn hơn
      const verificationToken = crypto.randomBytes(16).toString('hex');
      console.log('Generated verification token:', verificationToken);
      
      // Xóa bất kỳ token xác thực cũ nào cho email này
      await EmailVerification.deleteMany({ email: user.email });
      
      // Lưu token vào cơ sở dữ liệu
      const emailVerification = new EmailVerification({
        userId: user._id,
        email: user.email,
        token: verificationToken,
        createdAt: new Date() // Đảm bảo thời gian tạo mới nhất
      });
      
      await emailVerification.save();
      console.log('Saved verification token to database');
      
      // Tạo liên kết xác thực (ưu tiên FRONTEND_URL, fallback về CLIENT_URL hoặc localhost)
      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
      const verificationLink = `${frontendUrl}/verify-email/${verificationToken}`;
      console.log('Verification link:', verificationLink);
      
      // Gửi email xác thực
      try {
        await sendVerificationEmail(user.email, verificationLink);
        console.log('Verification email sent successfully');
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Không ném lỗi, tiếp tục xử lý
      }
      
      // Trả về thông báo thành công mà không có token
      return res.status(201).json({
        message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
        requireVerification: true,
        user: user.getPublicProfile()
      });
    }
    
    // Nếu không yêu cầu xác thực email, tạo token JWT và trả về như bình thường
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    
    // Kiểm tra xem email đã được xác thực chưa
    if (user.emailVerified === false) {
      return res.status(403).json({ 
        message: 'Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản.',
        requireVerification: true,
        email: user.email
      });
    }
    
    // Thời hạn token tùy thuộc vào tùy chọn ghi nhớ đăng nhập
    const expiresIn = rememberMe ? '30d' : '7d';
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn }
    );
    
    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  res.json(req.user.getPublicProfile());
};

// Forgot password - send reset code
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email' });
    }
    
    // Kiểm tra xem email có tồn tại trong hệ thống không
    const user = await User.findOne({ email });
    
    if (!user) {
      // Không tiết lộ thông tin về việc email có tồn tại hay không vì lý do bảo mật
      return res.status(200).json({ message: 'Nếu email tồn tại, mã xác nhận sẽ được gửi đến email của bạn' });
    }
    
    // Tạo mã xác nhận ngẫu nhiên 6 chữ số
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Lưu mã xác nhận vào database
    await PasswordReset.create({
      email,
      resetCode,
      // Mã hết hạn sau 15 phút
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });
    
    try {
      // Gửi email chứa mã xác nhận
      await sendPasswordResetEmail(email, resetCode);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Không ném lỗi, tiếp tục xử lý
    }
    
    // Luôn trả về thành công, ngay cả khi gửi email thất bại
    // Trong môi trường phát triển, mã xác nhận sẽ được in ra console
    res.status(200).json({ message: 'Mã xác nhận đã được gửi đến email của bạn' });
  } catch (error) {
    console.error('Error in forgot password flow:', error);
    // Trả về lỗi chung, không tiết lộ chi tiết lỗi
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res, next) => {
  try {
    const { email, resetCode } = req.body;
    
    if (!email || !resetCode) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và mã xác nhận' });
    }
    
    // Tìm mã xác nhận trong database
    const passwordReset = await PasswordReset.findOne({
      email,
      resetCode,
      used: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!passwordReset) {
      return res.status(400).json({ message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' });
    }
    
    res.status(200).json({ message: 'Chúng tôi đã xác nhận mã xác nhận của bạn' });
  } catch (error) {
    next(error);
  }
};

// Reset password with code
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }
    
    // Kiểm tra độ dài mật khẩu
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ 
        message: `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự` 
      });
    }
    
    // Tìm mã xác nhận trong database
    const passwordReset = await PasswordReset.findOne({
      email,
      resetCode,
      used: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!passwordReset) {
      return res.status(400).json({ message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' });
    }
    
    // Tìm user và cập nhật mật khẩu
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này' });
    }
    
    // Cập nhật mật khẩu
    user.password = newPassword;
    await user.save();
    
    // Đánh dấu mã xác nhận đã được sử dụng
    passwordReset.used = true;
    await passwordReset.save();
    
    res.status(200).json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    next(error);
  }
};

// Verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    console.log('Verifying email with request body:', req.body);
    let { token } = req.body;
    
    if (!token) {
      console.log('Token missing in request');
      return res.status(400).json({ message: 'Token xác thực không hợp lệ' });
    }
    
    // Ensure token is properly trimmed
    token = token.trim();
    
    // Tìm token xác thực trong cơ sở dữ liệu
    console.log('Looking for verification token:', token);
    let verification = await EmailVerification.findOne({ token });
    
    // If not found, try with case-insensitive search
    if (!verification) {
      console.log('Token not found, trying case-insensitive search');
      // Create a regex for case-insensitive search
      const tokenRegex = new RegExp('^' + token + '$', 'i');
      verification = await EmailVerification.findOne({ token: tokenRegex });
    }
    
    if (!verification) {
      console.log('Verification token not found in database');
      return res.status(400).json({ message: 'Token xác thực không hợp lệ hoặc đã hết hạn' });
    }
    
    console.log('Verification found:', verification);
    
    // Tìm người dùng
    const user = await User.findById(verification.userId);
    
    if (!user) {
      console.log('User not found with ID:', verification.userId);
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    console.log('User found:', user._id);
    
    // Kiểm tra xem email đã được xác thực chưa
    if (user.emailVerified) {
      console.log('Email already verified for user:', user._id);
      
      // Xóa token xác thực nếu còn tồn tại
      await EmailVerification.deleteOne({ _id: verification._id });
      
      // Tạo token JWT mới
      const jwtToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.status(200).json({
        message: 'Email đã được xác thực trước đó',
        token: jwtToken,
        user: user.getPublicProfile()
      });
    }
    
    // Cập nhật trạng thái xác thực email
    user.emailVerified = true;
    await user.save();
    console.log('User email verified successfully');
    
    // Xóa token xác thực
    await EmailVerification.deleteOne({ _id: verification._id });
    console.log('Verification token deleted');
    
    // Xóa tất cả các token xác thực khác của người dùng này (nếu có)
    await EmailVerification.deleteMany({ userId: user._id });
    console.log('Deleted any other verification tokens for this user');
    
    // Tạo token JWT
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('JWT token created, sending response');
    res.status(200).json({
      message: 'Xác thực email thành công',
      token: jwtToken,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error in verifyEmail:', error);
    res.status(500).json({ 
      message: 'Đã xảy ra lỗi khi xác thực email', 
      error: error.message 
    });
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res, next) => {
  try {
    console.log('Resending verification email for:', req.body);
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email' });
    }
    
    // Tìm người dùng
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(404).json({ message: 'Không tìm thấy người dùng với email này' });
    }
    
    console.log('Found user:', user._id, 'Email verified status:', user.emailVerified);
    
    // Kiểm tra xem email đã được xác thực chưa
    if (user.emailVerified) {
      return res.status(200).json({ 
        message: 'Email này đã được xác thực',
        alreadyVerified: true
      });
    }
    
    // Xóa token xác thực cũ nếu có
    const deletedTokens = await EmailVerification.deleteMany({ userId: user._id });
    console.log('Deleted old verification tokens:', deletedTokens);
    
    // Tạo token xác thực mới - sử dụng 16 bytes thay vì 32 để tạo token ngắn hơn
    const verificationToken = crypto.randomBytes(16).toString('hex');
    console.log('Created new verification token:', verificationToken);
    
    // Lưu token vào cơ sở dữ liệu
    const emailVerification = new EmailVerification({
      userId: user._id,
      email: user.email,
      token: verificationToken,
      createdAt: new Date() // Ensure we have a fresh timestamp
    });
    
    await emailVerification.save();
    console.log('Saved new verification token to database');
    
    // Tạo liên kết xác thực (ưu tiên FRONTEND_URL, fallback về CLIENT_URL hoặc localhost)
    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/verify-email/${verificationToken}`;
    console.log('Verification link:', verificationLink);
    
    // Gửi email xác thực
    await sendVerificationEmail(user.email, verificationLink);
    
    res.status(200).json({
      message: 'Email xác thực đã được gửi lại thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Test email connection
exports.testEmail = async (req, res) => {
  try {
    // Kiểm tra kết nối email
    const connectionResult = await testEmailConnection();
    
    if (connectionResult.success) {
      // Nếu kết nối thành công, gửi email test
      const testEmail = req.query.email || process.env.EMAIL_USER;
      const testCode = '123456';
      
      try {
        await sendPasswordResetEmail(testEmail, testCode);
        res.status(200).json({ 
          message: 'Kết nối email thành công và đã gửi email test',
          connectionResult,
          emailSent: true,
          testEmail,
          testCode
        });
      } catch (emailError) {
        res.status(500).json({
          message: 'Kết nối email thành công nhưng không thể gửi email test',
          connectionResult,
          emailSent: false,
          error: emailError.message
        });
      }
    } else {
      res.status(500).json({
        message: 'Không thể kết nối đến máy chủ email',
        connectionResult
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Đã xảy ra lỗi khi kiểm tra kết nối email',
      error: error.message
    });
  }
};