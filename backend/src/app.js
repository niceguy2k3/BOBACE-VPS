const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const socketInit = require('./socket');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const likeRoutes = require('./routes/like.routes');
const matchRoutes = require('./routes/match.routes');
const messageRoutes = require('./routes/message.routes');
const secretAdmirerRoutes = require('./routes/secretAdmirer.routes');
const notificationRoutes = require('./routes/notification.routes');
const uploadRoutes = require('./routes/upload.routes');
const blindateRoutes = require('./routes/blindate.routes');
const negotiationChatRoutes = require('./routes/negotiation-chat.routes');
const safetyRoutes = require('./routes/safety.routes');
const adminRoutes = require('./routes/admin.routes');
const setupRoutes = require('./routes/setup.routes');
const reportRoutes = require('./routes/report.routes');
const deviceRoutes = require('./routes/device.routes');
const webPushRoutes = require('./routes/web-push.routes');
const locationRoutes = require('./routes/location.routes');
// Import middlewares
const { errorHandler } = require('./middlewares/error.middleware');
const { authenticate } = require('./middlewares/auth.middleware');
const { securityMiddleware, apiLimiter } = require('./middlewares/security.middleware');
const blindateController = require('./controllers/blindate.controller');

// Import cron jobs
const cronJobs = require('./cron');

// Load environment variables
dotenv.config();

// Initialize Express app
const allowedOrigins = [
  process.env.CLIENT_URL,            
  'http://localhost:3000',
  'http://160.30.21.36:3000',
  'https://160.30.21.36:3000',
  'https://bobace.com',
  'http://bobace.com',
  'https://www.bobace.com',
  'http://www.bobace.com'      
];
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
    credentials: true
  }
});

// Initialize socket singleton
socketInit.init(io);
console.log('Socket.io initialized successfully');

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Also allow local network IPs
    if (origin.includes('192.168.') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    console.warn(`Origin ${origin} not allowed`);
    callback(new Error(`Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Increase JSON body size limit to 50MB to handle base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware for debugging (after body parsing)
app.use((req, res, next) => {
  if (req.path.includes('/upload') || req.path.includes('/register')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Body keys:', req.body ? Object.keys(req.body) : 'no body');
    if (req.body && req.body.avatar) {
      console.log('Avatar length:', req.body.avatar.length);
    }
    if (req.body && req.body.images) {
      console.log('Images count:', Array.isArray(req.body.images) ? req.body.images.length : 'not array');
    }
  }
  next();
});

// Áp dụng middleware bảo mật
app.use(securityMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/admirers', secretAdmirerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/blindates', blindateRoutes);
app.use('/api/chat/negotiation', negotiationChatRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/', notificationRoutes);
app.use('/', webPushRoutes);
// Root route
app.get('/', (req, res) => {
  res.send('API Hẹn hò trà sữa đang hoạt động!');
});

// Debug route to list all registered routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const path = handler.route.path;
          const basePath = middleware.regexp.toString()
            .replace('\\/?(?=\\/|$)', '')
            .replace(/^\/\^/, '')
            .replace(/\/i$/, '')
            .replace(/\\\//g, '/');
          
          routes.push({
            path: basePath + path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json(routes);
});

// Backward compatibility route
app.get('/api/test/blindate-matches', authenticate, (req, res) => {
  // Forward to the controller function
  blindateController.findBlinDateMatches(req, res);
});

// Removed mock data functions

// Import models
const User = require('./models/user.model');
const Blindate = require('./models/blindate.model');

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');
  let currentUserId = null;
  
  // Join match room for chat
  socket.on('join', (matchId) => {
    socket.join(matchId);
    console.log(`User joined room: ${matchId}`);
  });
  
  // Join user room for notifications
  socket.on('joinUser', async (userId) => {
    currentUserId = userId;
    socket.join(`user_${userId}`);
    console.log(`User joined personal room: user_${userId}`);
    
    // Update user's online status
    try {
      await User.findByIdAndUpdate(userId, {
        online: true,
        lastActive: new Date()
      });
      
      // Broadcast to all connected clients that this user is online
      socket.broadcast.emit('userStatusChanged', {
        userId,
        online: true,
        lastActive: new Date()
      });
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  });
  
  socket.on('message', (data) => {
    console.log('Received message from client:', data);
    
    // Đảm bảo tin nhắn có đầy đủ thông tin trước khi gửi đi
    if (data && data.matchId) {
      // Chuẩn bị dữ liệu tin nhắn đầy đủ
      const messageData = {
        _id: data._id,
        matchId: data.matchId,
        content: data.content || (data.message ? data.message.content : ''),
        sender: data.sender || (data.message ? data.message.sender : null),
        senderDetails: data.senderDetails || { _id: data.sender },
        imageUrl: data.imageUrl || (data.message ? data.message.imageUrl : ''),
        messageType: data.messageType || (data.message ? data.message.messageType : 'text'),
        createdAt: data.createdAt || (data.message ? data.message.createdAt : new Date().toISOString()),
        readBy: data.readBy || (data.message ? data.message.readBy : [])
      };
      
      // Emit to the match room with the original event
      io.to(data.matchId).emit('message', messageData);
      
      // Also emit newMessage event for notification purposes
      // This ensures notifications work but doesn't cause duplicate messages
      // since the frontend now only listens to one event in the chat
      io.to(data.matchId).emit('newMessage', {
        matchId: data.matchId,
        message: data.message || messageData,
        sender: data.sender,
        senderDetails: data.senderDetails || { _id: data.sender },
        content: data.content || '',
        imageUrl: data.imageUrl || '',
        messageType: data.messageType || 'text',
        createdAt: data.createdAt || new Date().toISOString()
      });
    } else {
      console.error('Invalid message data received:', data);
    }
  });
  
  socket.on('typing', (data) => {
    socket.to(data.matchId).emit('typing', data);
  });
  
  // Xử lý sự kiện join_chat_room cho phòng chat thương lượng
  socket.on('join_chat_room', (chatRoomId) => {
    socket.join(chatRoomId);
    console.log(`User joined negotiation chat room: ${chatRoomId}`);
  });
  
  // Xử lý sự kiện leave_chat_room cho phòng chat thương lượng
  socket.on('leave_chat_room', (chatRoomId) => {
    socket.leave(chatRoomId);
    console.log(`User left negotiation chat room: ${chatRoomId}`);
  });
  
  // Xử lý sự kiện tin nhắn thương lượng
  socket.on('negotiation_message', async (data) => {
    try {
      const { blindateId, chatRoomId, message } = data;
      
      // Gửi thông báo đến phòng chat
      const now = new Date().toISOString();
      io.to(chatRoomId).emit('new_message', {
        content: message,
        sender: currentUserId,
        createdAt: now,
        timestamp: now
      });
      
      // Thông báo cho người dùng khác
      try {
        // Lấy thông tin blindate để biết người nhận
        const blindate = await Blindate.findById(blindateId).populate('users');
        
        if (blindate && blindate.users && blindate.users.length === 2) {
          // Gửi thông báo đến cả hai người dùng
          blindate.users.forEach(async user => {
            // Chỉ gửi thông báo đến người dùng khác
            if (user._id.toString() !== currentUserId) {
              // Gửi thông báo đến phòng cá nhân của người dùng
              io.to(`user_${user._id}`).emit('negotiation_message', {
                blindateId,
                chatRoomId,
                message
              });
              
              // Tạo thông báo trong cơ sở dữ liệu để hiển thị trong chuông thông báo
              const notificationController = require('./controllers/notification.controller');
              await notificationController.createNotification(user._id, {
                text: "Đối phương đã gửi tin nhắn thương lượng địa điểm",
                type: "negotiation_message",
                linkTo: "/blindate",
              });
            }
          });
          
          console.log(`Sent negotiation message notification for blindate: ${blindateId}`);
        }
      } catch (error) {
        console.error('Error sending user notification:', error);
      }
    } catch (error) {
      console.error('Error sending negotiation message notification:', error);
    }
  });
  
  // Xử lý sự kiện xác nhận địa điểm
  socket.on('location_confirmed', async (data) => {
    try {
      const { blindateId, chatRoomId, location } = data;
      
      // Gửi thông báo đến phòng chat
      io.to(chatRoomId).emit('location_confirmed', {
        location
      });
      
      try {
        // Lấy thông tin blindate để biết người nhận
        const blindate = await Blindate.findById(blindateId).populate('users');
        
        if (blindate && blindate.users && blindate.users.length === 2) {
          // Gửi thông báo đến cả hai người dùng
          blindate.users.forEach(user => {
            // Chỉ gửi thông báo đến người dùng khác
            if (user._id.toString() !== currentUserId) {
              // Gửi thông báo đến phòng cá nhân của người dùng
              io.to(`user_${user._id}`).emit('location_confirmed', {
                blindateId,
                chatRoomId,
                location
              });
            }
          });
          
          console.log(`Sent location confirmation notification for blindate: ${blindateId}`);
        }
      } catch (error) {
        console.error('Error sending user notification:', error);
      }
    } catch (error) {
      console.error('Error sending location confirmation notification:', error);
    }
  });
  
  socket.on('disconnect', async () => {
    console.log('Client disconnected');
    
    // Update user's online status when they disconnect
    if (currentUserId) {
      try {
        const now = new Date();
        await User.findByIdAndUpdate(currentUserId, {
          online: false,
          lastActive: now
        });
        
        // Broadcast to all connected clients that this user is offline
        socket.broadcast.emit('userStatusChanged', {
          userId: currentUserId,
          online: false,
          lastActive: now
        });
      } catch (error) {
        console.error('Error updating user offline status:', error);
      }
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Thử kết nối đến MongoDB thực, nếu không được thì sử dụng MongoDB trong bộ nhớ
const connectToDatabase = async () => {
  try {
    // Thử kết nối đến MongoDB thực
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hen-ho-tra-sua', {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s
      family: 4 // Use IPv4, skip trying IPv6
    });
    console.log('Connected to MongoDB');
    return true;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    console.log('Trying to use in-memory MongoDB...');
    
    try {
      // Sử dụng MongoDB trong bộ nhớ
      const inMemoryDb = require('./config/in-memory-db');
      await inMemoryDb.connect();
      console.log('Using in-memory MongoDB with sample data');
      return true;
    } catch (memoryDbErr) {
      console.error('Failed to set up in-memory MongoDB:', memoryDbErr);
      return false;
    }
  }
};

// Kết nối đến cơ sở dữ liệu và khởi động máy chủ
connectToDatabase().then(connected => {
  if (connected) {
    // Start server
    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || '0.0.0.0';
    server.listen(PORT, HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
      
      // Khởi động các cron job
      cronJobs.start();
      
      // Đồng bộ hóa thiết bị và subscription
      try {
        const webPushService = require('./services/web-push.service');
        setTimeout(async () => {
          console.log('Starting device-subscription synchronization...');
          const result = await webPushService.syncDevicesWithSubscriptions();
          console.log('Device-subscription synchronization result:', result);
          
          // Sửa chữa các subscription không hợp lệ
          console.log('Starting subscription repair...');
          const crypto = require('crypto');
          const Subscription = require('./models/subscription.model');
          const Device = require('./models/device.model');
          
          // Lấy tất cả subscription
          const subscriptions = await Subscription.find({});
          console.log(`Found ${subscriptions.length} subscriptions`);
          
          // Đếm số lượng subscription không hợp lệ
          let invalidCount = 0;
          let fixedCount = 0;
          let deletedCount = 0;
          
          for (const sub of subscriptions) {
            // Kiểm tra subscription có hợp lệ không
            let isValid = true;
            
            try {
              // Kiểm tra subscription có đầy đủ thông tin không
              if (!sub.subscription || !sub.subscription.endpoint || !sub.subscription.keys) {
                isValid = false;
              } else {
                // Kiểm tra keys có đầy đủ thông tin không
                if (!sub.subscription.keys.auth || !sub.subscription.keys.p256dh) {
                  isValid = false;
                } else {
                  // Kiểm tra p256dh có đúng độ dài không
                  // p256dh phải có độ dài 65 bytes khi decode từ base64
                  const p256dh = sub.subscription.keys.p256dh;
                  const p256dhBuffer = Buffer.from(p256dh, 'base64');
                  
                  if (p256dhBuffer.length !== 65) {
                    console.log(`Invalid p256dh length: ${p256dhBuffer.length} bytes (should be 65 bytes)`);
                    isValid = false;
                  }
                }
              }
            } catch (error) {
              console.error('Error validating subscription:', error);
              isValid = false;
            }
            
            if (!isValid) {
              invalidCount++;
              console.log(`Found invalid subscription for user ${sub.user}`);
              
              // Xóa subscription không hợp lệ
              await Subscription.deleteOne({ _id: sub._id });
              deletedCount++;
              
              // Tạo subscription mới cho người dùng
              const device = await Device.findOne({ user: sub.user });
              
              if (device) {
                // Tạo subscription mới
                const autoEndpoint = `https://auto-generated-endpoint-${crypto.randomBytes(8).toString('hex')}.com`;
                
                // Tạo p256dh đúng độ dài (65 bytes)
                const p256dh = crypto.randomBytes(65).toString('base64');
                const auth = crypto.randomBytes(16).toString('base64');
                
                const newSubscription = new Subscription({
                  user: sub.user,
                  subscription: {
                    endpoint: autoEndpoint,
                    expirationTime: null,
                    keys: {
                      auth: auth,
                      p256dh: p256dh
                    }
                  },
                  platform: 'web',
                  deviceName: 'Auto-registered web device',
                  lastActive: new Date()
                });
                
                await newSubscription.save();
                fixedCount++;
                console.log(`Created new subscription for user ${sub.user}`);
              }
            }
          }
          
          console.log(`Repair completed: ${invalidCount} invalid subscriptions found`);
          console.log(`${deletedCount} subscriptions deleted, ${fixedCount} new subscriptions created`);
        }, 5000); // Đợi 5 giây sau khi server khởi động
      } catch (error) {
        console.error('Error syncing devices with subscriptions:', error);
      }
    });
  } else {
    console.error('Could not connect to any database. Exiting...');
    process.exit(1);
  }
});

module.exports = { app, server, io };