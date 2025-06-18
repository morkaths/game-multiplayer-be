import bcrypt from 'bcryptjs';
import User from '../models/user.js';

// Lấy tất cả user
export const getUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json({ success: true, users: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Lấy user theo id
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Thiếu id' });

    const user = await User.getById(id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    res.json({ success: true, user: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Lấy user theo username
export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ success: false, message: 'Thiếu username' });

    const users = await User.getByUsername(username);
    res.json({ success: true, users: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Lấy user theo email
export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Thiếu email' });

    const users = await User.getByEmail(email);
    res.json({ success: true, users: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};


// Đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Lấy user từ DB
    const user = await User.getById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });

    // Kiểm tra oldPassword
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Mật khẩu cũ không đúng' });

    // Hash mật khẩu mới
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, hashed);

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.getByEmail(email);
    if (!user) return res.status(404).json({ success: false, message: 'Email không tồn tại' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(user.id, hashed);

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Cập nhật thông tin user
export const updateProfile = async (req, res) => {
  try {
    const { userId, email, username } = req.body; // Lấy userId từ body

    // Kiểm tra quyền (chỉ admin mới được update user khác)
    if (userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Không có quyền thực hiện thao tác này",
      });
    }

    // Kiểm tra email trùng
    if (email) {
      const existing = await User.getByEmail(email);
      if (existing && existing.id !== userId) {
        // So sánh với userId từ body
        return res
          .status(400)
          .json({ success: false, message: "Email đã tồn tại" });
      }
    }
    // Kiểm tra username trùng
    if (username) {
      const existing = await User.getByUsername(username);
      if (existing && existing.id !== userId) {
        // So sánh với userId từ body
        return res
          .status(400)
          .json({ success: false, message: "Username đã tồn tại" });
      }
    }

    await User.updateProfile(userId, { email, username }); // Sử dụng userId từ body
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: err.message });
  }
};
