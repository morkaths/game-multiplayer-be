import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Đảm bảo thư mục tồn tại
const uploadDir = path.join('uploads', 'avatar');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Đặt tên file duy nhất
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});

const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // Chỉ cho phép ảnh
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Chỉ cho phép upload ảnh!'), false);
    }
    cb(null, true);
  }
});

export default uploadAvatar;
