import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';

// Promisify jwt.sign để sử dụng async/await
const jwtSign = (payload, secret, options) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

// Promisify bcrypt.hash để sử dụng async/await
const hashPassword = (password, salt) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
};

// Promisify bcrypt.compare để sử dụng async/await
const comparePassword = (password, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, isMatch) => {
      if (err) {
        reject(err);
      } else {
        resolve(isMatch);
      }
    });
  });
};

// Controller xử lý xác thực
const AuthController = {
  // Xử lý đăng ký người dùng
  register: async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!username || !email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Vui lòng điền đầy đủ thông tin'
        });
      }
      
      // Kiểm tra username đã tồn tại chưa
      const existingUser = await User.findByUsername(username);
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tên đăng nhập đã được sử dụng'
        });
      }
      
      // Kiểm tra email đã tồn tại chưa
      const existingEmail = await User.findByEmail(email);
      
      if (existingEmail) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email đã được sử dụng'
        });
      }
      
      // Mã hóa mật khẩu trước khi lưu vào database
      const hashedPassword = await hashPassword(password, 10);
      
      // Lưu thông tin người dùng vào database
      const userData = {
        username,
        email,
        password: hashedPassword,
        role: role || 'user' // Mặc định là 'user' nếu không cung cấp
      };
      
      const user = await User.register(userData);
      
      // Trả về thông tin người dùng đã đăng ký (không bao gồm password)
      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi server, vui lòng thử lại sau'
      });
    }
  },

  // Xử lý đăng nhập
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập email và mật khẩu'
        });
      }

      // Tìm user theo email
      const user = await User.findByEmail(email);

      // Kiểm tra nếu user không tồn tại
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng'
        });
      }

      // So sánh mật khẩu
      const isMatch = await comparePassword(password, user.password);

      // Nếu mật khẩu không khớp
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng'
        });
      }

      // Tạo JWT token
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      // Ký token
      const token = await jwtSign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      // Trả về token và thông tin người dùng
      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        token: `Bearer ${token}`,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          password: user.password,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server, vui lòng thử lại sau'
      });
    }
  },
  // Lấy thông tin người dùng hiện tại
  getCurrentUser: (req, res) => {
    // Thông tin người dùng đã được lưu trong req.user từ middleware authenticateToken
    res.status(200).json({
      success: true,
      user: req.user
    });
  }
};

export default AuthController; 