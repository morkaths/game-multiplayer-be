import dotenv from 'dotenv';
dotenv.config();

import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Log kiểm tra .env
console.log('[ENV TEST] EMAIL_USER:', process.env.EMAIL_USER);
console.log('[ENV TEST] EMAIL_PASS:', process.env.EMAIL_PASS);
console.log('[ENV TEST] CLIENT_URL:', process.env.CLIENT_URL);

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const jwtSign = (payload, secret, options) =>
  new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      else resolve(token);
    });
  });

const hashPassword = (password, salt) =>
  new Promise((resolve, reject) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });

const comparePassword = (password, hash) =>
  new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, isMatch) => {
      if (err) reject(err);
      else resolve(isMatch);
    });
  });

const AuthController = {
register: async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
    }

    if (await User.checkUsername(username)) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập đã được sử dụng' });
    }

    if (await User.checkEmail(email)) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    console.log('[REGISTER] Raw password:', password);

    const user = await User.register({
      username,
      email,
      password, // plaintext, không hash
      role: role || 'user'
    });

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
    res.status(500).json({ success: false, message: 'Lỗi server, vui lòng thử lại sau' });
  }
},


login: async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await User.getByEmail(email);

    console.log('[Login DEBUG] Mật khẩu nhập:', password);
    console.log('[Login DEBUG] Mật khẩu trong DB:', user?.password);
    console.log('[DEBUG] typeof nhập:', typeof password);
    console.log('[DEBUG] typeof trong DB:', typeof user?.password);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    console.log('[Login] User found:', user.email);

    let isMatch;

    // Kiểm tra xem password trong DB là bcrypt hash không
    const bcryptHashRegex = /^\$2[aby]?\$\d{2}\$.{53}$/;
    const isHash = bcryptHashRegex.test(user.password);
    if (isHash) {
      console.log('[Login] Detected bcrypt hash, comparing...');
      isMatch = await comparePassword(password, user.password);
    } else {
      console.log('[Login] Detected plaintext, comparing...');
      isMatch = user.password === password;
    }

    console.log('[Login] Comparison result:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    const token = await jwtSign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token: `Bearer ${token}`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server, vui lòng thử lại sau' });
  }
},


  getCurrentUser: (req, res) => {
    res.status(200).json({ success: true, user: req.user });
  },

  googleLogin: async (req, res) => {
    try {
      const { credential } = req.body;
      if (!credential) return res.status(400).json({ success: false, message: 'Token Google không hợp lệ' });

      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) return res.status(400).json({ success: false, message: 'Lỗi lấy thông tin Google' });

      const email = payload.email;
      const name = payload.name;
      let user = await User.getByEmail(email);

      if (!user) {
        user = await User.register({
          username: name || email.split('@')[0],
          email,
          password: '-',
          role: 'user',
          isGoogleAccount: true
        });
      }

      const tokenPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      const token = await jwtSign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      res.status(200).json({
        success: true,
        message: 'Đăng nhập Google thành công',
        token: `Bearer ${token}`,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      console.error('Google Login error:', err);
      res.status(500).json({ success: false, message: 'Lỗi xác thực Google' });
    }
  },

  forgotPassword: async (req, res) => {
  try {
    console.log('[ForgotPassword] Start');
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ email' });

    console.log('[ForgotPassword] Finding user by email:', email);
    const user = await User.getByEmail(email);

    if (!user) {
      console.log('[ForgotPassword] User not found, returning early.');
      return res.json({ success: true, message: 'Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu' });
    }

    console.log('[ForgotPassword] Generating token...');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    console.log('[ForgotPassword] Saving reset token...');
    await User.saveResetToken(user.id, token, expires);

    console.log('[ForgotPassword] Preparing nodemailer transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;
    console.log('[ForgotPassword] Sending email to:', email);

    await transporter.sendMail({
      from: `"Hỗ trợ" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Yêu cầu đặt lại mật khẩu',
      html: `
        <p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
        <p>Nhấn vào liên kết dưới đây để thay đổi mật khẩu:</p>
        <a href="${resetLink}">Đặt lại mật khẩu</a>
        <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
        <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
      `,
    });

    console.log('[ForgotPassword] Email sent.');
    res.json({ success: true, message: 'Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu' });
  } catch (err) {
    console.error('ForgotPassword error:', err);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xử lý yêu cầu' });
  }
},


  resetPassword: async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Thiếu token hoặc mật khẩu mới' });

    const resetToken = await User.findByResetToken(token);
    if (!resetToken || new Date(resetToken.expires) < new Date()) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    //Không mã hóa (lưu plain text trực tiếp)
    await User.updatePassword(resetToken.user_id, newPassword);

    await User.deleteResetToken(token);

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    console.error('ResetPassword error:', err);
    res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi đặt lại mật khẩu' });
  }
}

};

export default AuthController;
