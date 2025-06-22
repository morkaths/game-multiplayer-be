    import User from '../models/user.js';
    import bcrypt from 'bcryptjs';
    import jwt from 'jsonwebtoken';
    import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';
    import { OAuth2Client } from 'google-auth-library';
    import crypto from 'crypto';
    import nodemailer from 'nodemailer';

    // Khởi tạo client với Google Client ID
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
        const isUsernameExists = await User.checkUsername(username);
        if (isUsernameExists) {
            return res.status(400).json({ 
            success: false, 
            message: 'Tên đăng nhập đã được sử dụng'
            });
        }
        
        // Kiểm tra email đã tồn tại chưa
        const isEmailExists = await User.checkEmail(email);
        if (isEmailExists) {
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
        const user = await User.getByEmail(email);

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
    },
    // Đăng nhập hoặc đăng ký qua Google
        googleLogin: async (req, res) => {
        try {
        console.log('[Google Login] Body:', req.body);
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ success: false, message: 'Token Google không hợp lệ' });
        }

        // Xác minh token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        console.log('[Google Login] Payload:', payload);

        if (!payload || !payload.email) {
            return res.status(400).json({ success: false, message: 'Không lấy được thông tin tài khoản Google' });
        }

        const email = payload.email;
        const name = payload.name;

        // Kiểm tra xem user đã tồn tại chưa
        let user = await User.getByEmail(email);

        if (!user) {
            // Nếu chưa có, tạo mới tài khoản Google
            user = await User.register({
            username: name || email.split('@')[0],
            email,
            password: '-', // không có mật khẩu
            role: 'user',
            isGoogleAccount: true
            });
        }

        // Tạo JWT token
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
        const { email } = req.body;

        const user = await User.getByEmail(email);
        if (!user) {
        return res.status(404).json({ success: false, message: 'Email không tồn tại' });
        }

        const token = crypto.randomBytes(32).toString('hex');

        // Lưu vào DB hoặc RAM: giả sử bạn dùng Redis, hoặc có thể tạo bảng reset_tokens
        await User.saveResetToken(user.id, token, Date.now() + 15 * 60 * 1000); // hạn 15 phút

        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

        const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        });

        await transporter.sendMail({
        from: `"Hỗ trợ" <${process.env.EMAIL_USERNAME}>`,
        to: email,
        subject: 'Yêu cầu đặt lại mật khẩu',
        html: `
            <p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
            <p>Nhấn vào liên kết dưới đây để thay đổi mật khẩu:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
        `,
        });

        res.json({ success: true, message: 'Đã gửi email đặt lại mật khẩu' });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi gửi email khôi phục' });
    }
    },

        resetPassword: async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const record = await User.findByResetToken(token); // Tự implement trong User model
        if (!record || Date.now() > record.expires) {
        return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updatePassword(record.userId, hashedPassword);

        // Xoá token sau khi dùng
        await User.deleteResetToken(token);

        res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi đặt lại mật khẩu' });
    }
    },

    };

    export default AuthController; 