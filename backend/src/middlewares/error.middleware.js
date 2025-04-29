exports.errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} đã tồn tại` });
  }
  
  // JWT errors are handled in auth middleware
  
  // Default server error
  res.status(500).json({
    message: err.message || 'Lỗi máy chủ'
  });
};