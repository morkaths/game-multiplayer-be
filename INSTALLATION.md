## Khởi tạo dự án

### Bước 1: Tạo thư mục dự án
```bash
mkdir game-multiplayer
cd game-multiplayer
```

### Bước 2: Khởi tạo client với Vite
```bash
npm create vite@latest client -- --template react-ts
cd client
npm install

# Cài đặt dependencies cho client
npm install @reduxjs/toolkit react-redux
npm install react-router-dom
npm install @mui/material @emotion/react @emotion/styled
npm install socket.io-client axios sass
cd ..
```
### Bước 3: Khởi tạo server với Express (sử dụng docker để tự khởi tạo và chạychạy db)
# Hướng dẫn Cài đặt và Chạy Ứng dụng

## 1. Cài đặt Node.js
1. Truy cập [Node.js official website](https://nodejs.org/)
2. Tải phiên bản LTS (Long Term Support) cho Windows
3. Chạy file cài đặt và làm theo hướng dẫn
4. Kiểm tra cài đặt bằng cách mở Terminal/Command Prompt:
```bash
node --version
npm --version
```

## 2. Cài đặt Docker Desktop
1. Truy cập [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Tải Docker Desktop cho Windows
3. Chạy file cài đặt
4. **Quan trọng**: Nếu sử dụng Windows 10/11 Home
   - Cài đặt [WSL2 (Windows Subsystem for Linux)](https://docs.microsoft.com/en-us/windows/wsl/install)
   - Mở PowerShell với quyền Admin và chạy:
   ```powershell
   wsl --install
   ```
5. Khởi động lại máy tính
6. Mở Docker Desktop và đợi nó khởi động hoàn tất
7. Kiểm tra cài đặt:
```bash
docker --version
docker-compose --version
```

## 3. Clone và Chạy Ứng dụng

### Clone Repository
```bash
git clone [URL_của_repository]
cd game-multiplayer
```

### Khởi động Ứng dụng với Docker
1. Mở Terminal trong thư mục dự án
2. Chạy lệnh:
```bash
docker-compose up --build
```

### Kiểm tra Ứng dụng
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: MySQL đang chạy trên port 3306

## 4. Xử lý Lỗi Thường Gặp

### Lỗi Port đang được sử dụng
1. Kiểm tra port đang sử dụng (Command Prompt với quyền Admin):
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :3306

# Dừng process theo PID
taskkill /PID [PID] /F
```

### Lỗi Docker không khởi động
1. Kiểm tra WSL2:
```powershell
wsl --status
```
2. Cập nhật WSL2:
```powershell
wsl --update
```

### Lỗi không kết nối được Database
1. Dừng MySQL nếu đang chạy trên máy:
```bash
# Windows (PowerShell Admin)
net stop MySQL80
```
2. Xóa Docker volumes và khởi động lại:
```bash
docker-compose down -v
docker-compose up --build
```

## 5. Các Lệnh Docker Hữu ích

```bash
# Xem logs
docker-compose logs

# Xem logs của service cụ thể
docker-compose logs backend
docker-compose logs db

# Dừng ứng dụng
docker-compose down

# Xóa tất cả containers và volumes
docker-compose down -v

# Khởi động lại một service
docker-compose restart backend

# Xem status các containers
docker-compose ps
```

## 6. Cấu trúc Project

game-multiplayer-be/
├── server/ # Backend Node.js
│ ├── src/
│ │ ├── config/ # Configuration files
│ │ │ ├── databaseb.js
│ │ │ └── jwt.js
│ │ ├── controllers/ # Request handlers
│ │ │ ├── userController.js
│ │ │ ├── authController.js
│ │ │ ├── playerController.js
│ │ │ ├── playerAnswerController.js
│ │ │ ├── questionSetController.js
│ │ │ ├── questionController.js
│ │ │ ├── answerController.js
│ │ │ └── roomController.js
│ │ ├── models/ # Database models
│ │ │ ├── user.js
│ │ │ ├── question.js
│ │ │ ├── questionSet.js
│ │ │ ├── answer.js
│ │ │ ├── playeranswer.js
│ │ │ ├── player.js
│ │ │ └── room.js
│ │ ├── routes/ # API routes
│ │ │ ├── userRoutes.js
│ │ │ ├── questionRoutes.js
│ │ │ ├── questionSetRoutes.js
│ │ │ ├── authRoutes.js
│ │ │ ├── answerRoutes.js
│ │ │ ├── playerAnswerRoutes.js
│ │ │ ├── protectRoutes.js
│ │ │ ├── roomRoutes.js
│ │ │ ├── palyerRoutes.js
│ │ │ ├── web.js
│ │ │ └── api.js
│ │ ├── middleware/ # Custom middleware
│ │ │ ├── auth.js
│ │ │ ├── uploadImage.js
│ │ │ └── uploadAvatar.js
│ │ ├── socket/ # Socket.io handlers
│ │ │ └── socketHandler.js
│ │ └── app.js # Express app setup
│ ├── uploads/ # Uploaded files
│ ├── package.json
│ ├── Dockerfile
│ └── .env
│
├── db/ # Database scripts
│ ├── init.sql # Initial database schema
│ └── Dockerfile
│
├── docker-compose.yml # Docker compose configuration
├── .gitignore # Git ignore file
├── README.md # Project documentation
└── INSTALLATION.md # Installation guide
































```bash
mkdir server
cd server

# Khởi tạo package.json
npm init -y

# Cài đặt dependencies cho server
npm install express cors dotenv mongoose socket.io
npm install mysql2
npm install jsonwebtoken bcryptjs
npm install --save-dev nodemon
cd ..
```

## Cấu hình files

### Server (.env)
```plaintext
PORT=5000
MONGODB_URI=mongodb://localhost:27017/game-multiplayer
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### Client (.env)
```plaintext
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

### Client (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ws': {
        target: 'ws://localhost:5000',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/ws/, '')
      }
    }
  }
})
```

## Khởi động ứng dụng

1. Khởi động MongoDB:
```bash
mongod
```

2. Khởi động Server:
```bash
cd server
npm run dev
```

3. Khởi động Client:
```bash
cd client
npm run dev
```

Ứng dụng sẽ chạy tại:
- Client: http://localhost:3000
- Server: http://localhost:5000