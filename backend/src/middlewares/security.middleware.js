// Security middleware for the application  
const rateLimit = require('express-rate-limit');  
  
// Rate limiting configuration  
const apiLimiter = rateLimit({  
  windowMs: 15 * 60 * 1000, // 15 minutes  
  max: 100, // limit each IP to 100 requests per windowMs  
  message: 'Quá nhiều yêu cầu từ địa chỉ IP của bạn, vui lòng thử lại sau 15 phút'  
});  
  
// Security middleware function  
const securityMiddleware = function(req, res, next) {  
  // Set security headers  
  res.setHeader('X-Content-Type-Options', 'nosniff');  
  res.setHeader('X-XSS-Protection', '1; mode=block');  
  res.setHeader('X-Frame-Options', 'DENY');  
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');  
  
  // Continue to next middleware  
  next();  
};  
  
module.exports = { securityMiddleware, apiLimiter }; 
