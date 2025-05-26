# 🎮 Game Multiplayer

Một dự án game multiplayer sử dụng React (client) và Node.js (server) với Socket.IO cho kết nối thời gian thực.

## ✨ Chức năng

### 1. 👤 Quản lý tài khoản
- 🔐 Đăng ký/Đăng nhập user
- 👑 Phân quyền admin/user
- 📝 Quản lý profile

### 2. 📚 Quản lý nội dung
- 📦 CRUD bộ câu hỏi
- ❓ CRUD câu hỏi (hỗ trợ text và choice)
- 🖼️ Upload hình ảnh cho câu hỏi

### 3. 🎯 Quản lý game
- 🎲 Tạo phòng với PIN
- 🚪 Join phòng bằng PIN
- ⚡ Real-time gameplay
- ⏱️ Tính điểm theo thời gian trả lời
- 🏆 Bảng xếp hạng realtime
- 📊 Thống kê kết quả game

## 📂 Cấu trúc thư mục
```
game-multiplayer-be/
├── db/
├── uploads/
├── src/
│   ├── config/         # ⚙️ Database & env config
│   ├── controllers/    # 🎮 Route handlers
│   ├── middleware/     # 🔒 Auth & validation
│   ├── models/         # 📊 Database models
│   ├── routes/         # 🛣️ API routes
│   ├── socket/         # 🔌 Socket.IO handlers
│   └── server.js       # 🚀 Main server
├── .env               # ⚙️ Backend env vars
└── README.md
```

## 🚀 Cài đặt

1. 📥 Clone repository:
```bash
git clone https://github.com/Vuong1411/game-multiplayer-be.git
cd game-multiplayer-be
npm run dev
```

## 🎯 Khởi động

🌐 Ứng dụng sẽ chạy tại:
- 📱 Client: http://localhost:3000
- 🖧 Server: http://localhost:5000

## 🛠️ Công nghệ sử dụng
- 📱 Frontend: React, TypeScript, Socket.IO Client
- 🖧 Backend: Node.js, Express, Socket.IO
- 🗃️ Database: MySQL
- 🐳 Tools: Docker (optional)