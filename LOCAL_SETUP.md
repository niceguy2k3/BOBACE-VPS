# Hướng dẫn Setup Localhost Development

Hướng dẫn này giúp bạn chạy ứng dụng trên localhost song song với production mà không ảnh hưởng đến code đã deploy.

## 📋 Yêu cầu

- Node.js và npm đã cài đặt
- MongoDB đang chạy trên localhost (port 27017) HOẶC Docker để chạy MongoDB

## 🚀 Bước 1: Setup MongoDB Local

### Option 1: MongoDB đã cài trên máy
Đảm bảo MongoDB đang chạy:
```bash
# Windows
net start MongoDB

# Mac/Linux
brew services start mongodb-community
# hoặc
sudo systemctl start mongod
```

### Option 2: Dùng Docker (Khuyến nghị)
```bash
docker run -d -p 27017:27017 --name mongodb-local mongo:latest
```

## 🔧 Bước 2: Setup Backend

1. **Copy file environment:**
```bash
cd backend
cp .env.local.example .env.local
```

2. **Chỉnh sửa `.env.local`:**
```env
MONGODB_URI=mongodb://localhost:27017/hen-ho-tra-sua
PORT=5000
HOST=localhost
JWT_SECRET=your-local-secret-key
CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

3. **Cài đặt dependencies:**
```bash
npm install
```

4. **Chạy backend:**
```bash
# Development mode với auto-reload
npm run local

# Hoặc chạy trực tiếp
npm run local:start

# Backend sẽ chạy tại: http://localhost:5000
```

## 🎨 Bước 3: Setup Frontend

1. **Copy file environment:**
```bash
cd frontend
cp .env.local.example .env.local
```

2. **Chỉnh sửa `.env.local`:**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

3. **Cài đặt dependencies:**
```bash
npm install
```

4. **Chạy frontend:**
```bash
npm run local
# hoặc
npm start

# Frontend sẽ chạy tại: http://localhost:3000
```

## ✅ Kiểm tra

1. Backend: Mở http://localhost:5000 - sẽ thấy "API Hẹn hò trà sữa đang hoạt động!"
2. Frontend: Mở http://localhost:3000 - sẽ thấy trang chủ
3. Kiểm tra MongoDB kết nối: Xem console backend, sẽ thấy "Connected to MongoDB"

## 📝 Lưu ý quan trọng

### 🔒 File .env.local KHÔNG được commit vào Git
- File `.env.local` đã được thêm vào `.gitignore`
- Chỉ file `.env.local.example` được commit (template)

### 🔄 Không ảnh hưởng đến Production
- Khi chạy `npm run local` hoặc có file `.env.local`:
  - Backend sẽ dùng MongoDB local
  - Frontend sẽ kết nối đến backend local
  - **KHÔNG** ảnh hưởng đến code/production đã deploy

### 🚀 Production vẫn hoạt động bình thường
- Code production sử dụng file `.env` (không có `.local`)
- Production MongoDB URI vẫn giữ nguyên
- Khi deploy, không có file `.env.local` nên sẽ dùng `.env` mặc định

## 📧 Email Service trong Localhost

Khi chạy localhost, email service sẽ:
- **Nếu KHÔNG có EMAIL_USER/EMAIL_PASSWORD**: Chỉ log email ra console, không gửi thực
- **Nếu CÓ EMAIL_USER/EMAIL_PASSWORD**: Gửi email thực sự qua SMTP

**Ví dụ khi register trong development mode:**
```
📧 DEVELOPMENT MODE: Email would be sent (but skipped)
To: user@example.com
Verification Link: http://localhost:3000/verify-email/abc123...
```

Bạn có thể:
1. Copy verification link từ console và mở trong browser
2. Hoặc thêm email credentials vào `.env.local` để gửi email thực

## 🔍 Troubleshooting

### MongoDB không kết nối được
```bash
# Kiểm tra MongoDB có đang chạy không
# Windows
net start MongoDB

# Kiểm tra port 27017
netstat -an | findstr 27017

# Docker
docker ps | grep mongo
```

### Port đã được sử dụng
```bash
# Windows - tìm process đang dùng port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Hoặc đổi PORT trong .env.local
PORT=5001
```

### Frontend không kết nối được backend
- Kiểm tra `.env.local` có đúng `REACT_APP_API_URL=http://localhost:5000` không
- Kiểm tra backend có đang chạy không
- Kiểm tra CORS trong backend có cho phép `http://localhost:3000` không

## 📚 Scripts có sẵn

### Backend:
- `npm run local` - Chạy với nodemon (auto-reload) dùng .env.local
- `npm run local:start` - Chạy trực tiếp dùng .env.local
- `npm run dev` - Chạy với nodemon dùng .env (production config)
- `npm start` - Chạy trực tiếp dùng .env (production config)

### Frontend:
- `npm run local` hoặc `npm start` - Chạy development server với .env.local
- `npm run build` - Build cho production

## 🎯 Workflow Development

1. Mở 2 terminal:
   - Terminal 1: `cd backend && npm run local`
   - Terminal 2: `cd frontend && npm run local`

2. Code và test trên localhost
3. Khi sẵn sàng deploy, commit code (không commit .env.local)
4. Production vẫn chạy bình thường với config riêng

