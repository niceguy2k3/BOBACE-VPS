const nodemailer = require('nodemailer');

// Tạo transporter cho nodemailer
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    debug: true,
    logger: true,
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Gửi email xác thực tài khoản
const sendVerificationEmail = async (email, verificationLink) => {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasEmailCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
    
    console.log('Attempting to send verification email to:', email);
    console.log('Verification link:', verificationLink);
    
    // Development mode: Nếu không có email credentials, chỉ log ra console
    if (isDevelopment && !hasEmailCredentials) {
      console.log('='.repeat(80));
      console.log('📧 DEVELOPMENT MODE: Email would be sent (but skipped)');
      console.log('To:', email);
      console.log('Subject: Xác thực tài khoản BOBACE');
      console.log('Verification Link:', verificationLink);
      console.log('');
      console.log('💡 To enable email sending in development, add to .env.local:');
      console.log('   EMAIL_HOST=smtp.gmail.com');
      console.log('   EMAIL_PORT=587');
      console.log('   EMAIL_USER=your-email@gmail.com');
      console.log('   EMAIL_PASSWORD=your-app-password');
      console.log('='.repeat(80));
      return true; // Return success để không block registration
    }
    
    const transporter = createTransporter();
    
    // Kiểm tra kết nối SMTP
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully!');
    
    const mailOptions = {
      from: `"BOBACE" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Xác thực tài khoản BOBACE',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #f59e0b;">BOBACE</h2>
            <p style="color: #666;">Ứng dụng hẹn hò dành cho người yêu trà sữa</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #333;">Xác thực tài khoản</h3>
            <p style="color: #666;">Cảm ơn bạn đã đăng ký tài khoản BOBACE. Vui lòng nhấp vào nút bên dưới để xác thực email của bạn:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Xác thực tài khoản
              </a>
            </div>
            
            <p style="color: #666;">Hoặc bạn có thể sao chép và dán liên kết này vào trình duyệt của bạn:</p>
            <p style="background-color: #fff; padding: 10px; border: 1px solid #eaeaea; border-radius: 5px; word-break: break-all;">
              ${verificationLink}
            </p>
            
            <p style="color: #666;">Liên kết này sẽ hết hạn sau 24 giờ.</p>
            <p style="color: #666;">Nếu bạn không yêu cầu tạo tài khoản này, vui lòng bỏ qua email này.</p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} BOBACE. Tất cả các quyền được bảo lưu.</p>
            <p>Đây là email tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `,
      text: `
        BOBACE - Ứng dụng hẹn hò dành cho người yêu trà sữa
        
        XÁC THỰC TÀI KHOẢN
        
        Cảm ơn bạn đã đăng ký tài khoản BOBACE. Vui lòng truy cập vào liên kết sau để xác thực email của bạn:
        
        ${verificationLink}
        
        Liên kết này sẽ hết hạn sau 24 giờ.
        
        Nếu bạn không yêu cầu tạo tài khoản này, vui lòng bỏ qua email này.
        
        © ${new Date().getFullYear()} BOBACE. Tất cả các quyền được bảo lưu.
        Đây là email tự động, vui lòng không trả lời.
      `
    };
    
    console.log('Sending verification email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return true;
  } catch (error) {
    console.error('DETAILED ERROR SENDING VERIFICATION EMAIL:');
    console.error(error);
    
    if (error.code === 'EAUTH') {
      console.error('Authentication error. Please check your email and password.');
    } else if (error.code === 'ESOCKET') {
      console.error('Socket error. Please check your host and port settings.');
    } else if (error.code === 'ECONNECTION') {
      console.error('Connection error. Please check your internet connection and firewall settings.');
    }
    
    // Development mode: Nếu không có credentials, chỉ log warning
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
      console.warn('⚠️  Email not sent (no credentials in development mode)');
      return true; // Return success để không block flow
    }
    
    throw error;
  }
};

// Gửi email mã xác nhận đặt lại mật khẩu
const sendPasswordResetEmail = async (email, resetCode) => {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasEmailCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
    
    console.log('Attempting to send email to:', email);
    
    // Luôn in mã xác nhận ra console để dễ kiểm tra
    console.log('==========================================================');
    console.log(`RESET CODE for ${email}: ${resetCode}`);
    console.log('==========================================================');
    
    // Development mode: Nếu không có email credentials, chỉ log ra console
    if (isDevelopment && !hasEmailCredentials) {
      console.log('='.repeat(80));
      console.log('📧 DEVELOPMENT MODE: Email would be sent (but skipped)');
      console.log('To:', email);
      console.log('Subject: Đặt lại mật khẩu BOBACE');
      console.log('Reset Code:', resetCode);
      console.log('');
      console.log('💡 To enable email sending in development, add to .env.local:');
      console.log('   EMAIL_HOST=smtp.gmail.com');
      console.log('   EMAIL_PORT=587');
      console.log('   EMAIL_USER=your-email@gmail.com');
      console.log('   EMAIL_PASSWORD=your-app-password');
      console.log('='.repeat(80));
      return true; // Return success để không block password reset
    }
    
    console.log('Using email configuration:');
    console.log('- EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('- EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('- EMAIL_USER:', process.env.EMAIL_USER);
    console.log('- EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '******' : 'Not set');
    
    // Sử dụng transporter chung
    const transporter = createTransporter();
    
    // Kiểm tra kết nối SMTP
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully!');
    
    const mailOptions = {
      from: `"BOBACE" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Đặt lại mật khẩu BOBACE',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #f59e0b;">BOBACE</h2>
            <p style="color: #666;">Ứng dụng hẹn hò dành cho người yêu trà sữa</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #333;">Đặt lại mật khẩu</h3>
            <p style="color: #666;">Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã xác nhận dưới đây để tiếp tục quá trình đặt lại mật khẩu:</p>
            
            <div style="background-color: #fff; padding: 15px; border: 1px dashed #f59e0b; text-align: center; margin: 20px 0; border-radius: 5px;">
              <h2 style="margin: 0; color: #f59e0b; letter-spacing: 5px;">${resetCode}</h2>
            </div>
            
            <p style="color: #666;">Mã xác nhận này sẽ hết hạn sau 15 phút.</p>
            <p style="color: #666;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào.</p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} BOBACE. Tất cả các quyền được bảo lưu.</p>
            <p>Đây là email tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `,
      // Thêm phiên bản text để tăng khả năng gửi thành công
      text: `
        BOBACE - Ứng dụng hẹn hò dành cho người yêu trà sữa
        
        ĐẶT LẠI MẬT KHẨU
        
        Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
        Vui lòng sử dụng mã xác nhận dưới đây để tiếp tục quá trình đặt lại mật khẩu:
        
        ${resetCode}
        
        Mã xác nhận này sẽ hết hạn sau 15 phút.
        
        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi.
        
        © ${new Date().getFullYear()} BOBACE. Tất cả các quyền được bảo lưu.
        Đây là email tự động, vui lòng không trả lời.
      `
    };
    
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return true;
  } catch (error) {
    console.error('DETAILED ERROR SENDING EMAIL:');
    console.error(error);
    
    if (error.code === 'EAUTH') {
      console.error('Authentication error. Please check your email and password.');
    } else if (error.code === 'ESOCKET') {
      console.error('Socket error. Please check your host and port settings.');
    } else if (error.code === 'ECONNECTION') {
      console.error('Connection error. Please check your internet connection and firewall settings.');
    }
    
    // Không ném lỗi để ứng dụng vẫn hoạt động
    return true;
  }
};

// Hàm kiểm tra kết nối email
const testEmailConnection = async () => {
  try {
    console.log('Testing email connection...');
    
    const transporter = createTransporter();
    
    const result = await transporter.verify();
    console.log('Email connection test result:', result);
    return { success: true, message: 'Email connection successful' };
  } catch (error) {
    console.error('Email connection test failed:', error);
    return { 
      success: false, 
      message: 'Email connection failed', 
      error: error.message,
      code: error.code
    };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
  testEmailConnection
};