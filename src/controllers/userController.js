import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { deleteImageOnCloudinary, getPublicIdFromUrl } from '../utils/cloudinaryUtils.js';

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

// Cập nhật user (admin)
export const updateUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Chỉ admin mới được phép thực hiện thao tác này" });
    }
    const { id } = req.params;
    const updateData = req.body;

    // Không cho phép cập nhật id
    if (updateData.id) delete updateData.id;

    // Nếu cập nhật email, kiểm tra trùng
    if (updateData.email) {
      const existing = await User.getByEmail(updateData.email);
      if (existing && existing.id != id) {
        return res.status(400).json({ success: false, message: "Email đã tồn tại" });
      }
    }

    // Nếu cập nhật username, kiểm tra trùng
    if (updateData.username) {
      const existing = await User.getByUsername(updateData.username);
      if (existing && existing.id != id) {
        return res.status(400).json({ success: false, message: "Username đã tồn tại" });
      }
    }

    await User.updateUser(id, updateData);
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
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

// Cập nhật profile (user)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, username, avatar_url } = req.body;
    const currentUser = await User.getById(userId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User không tồn tại" });
    }

    // Kiểm tra username trùng
    if (username && username !== currentUser.username) {
      const existing = await User.getByUsername(username);
      if (existing && existing.id !== userId) {
        return res.status(400).json({ success: false, message: "Username đã tồn tại" });
      }
    }

    if (avatar_url && currentUser.avatar_url) {
      const oldPublicId = getPublicIdFromUrl(currentUser.avatar_url);
      if (oldPublicId) {
        try {
          await deleteImageOnCloudinary(oldPublicId);
        } catch (err) {
          console.error('Lỗi xóa avatar cũ trên Cloudinary:', err);
        }
      }
    }

    // Tạo object chỉ chứa các trường cần update
    const updateData = {};
    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (avatar_url) updateData.avatar_url = avatar_url;

    await User.updateUser(userId, updateData);
    res.json({ success: true, message: "Cập nhật profile thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Thêm người dùng mới
export const createUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Chỉ admin mới được phép thêm người dùng" });
    }
    const { username, email, password, role, isGoogleAccount } = req.body;

    // Kiểm tra trùng email/username
    const emailExists = await User.getByEmail(email);
    if (emailExists) {
      return res.status(400).json({ success: false, message: "Email đã tồn tại" });
    }
    const usernameExists = await User.getByUsername(username);
    if (usernameExists && usernameExists.length > 0) {
      return res.status(400).json({ success: false, message: "Username đã tồn tại" });
    }

    // Hash password nếu không phải tài khoản Google
    let hashedPassword = password;
    if (!isGoogleAccount && password) {
      const bcrypt = await import('bcryptjs');
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const newUser = await User.register({
      username,
      email,
      password: hashedPassword,
      role,
      isGoogleAccount
    });

    res.json({ success: true, message: "Thêm người dùng thành công", user: newUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
}

// Xóa user (admin hoặc chính user)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Chỉ cho phép admin hoặc chính user xóa
    if (req.user.role !== 'admin' && req.user.id != id) {
      return res.status(403).json({ success: false, message: 'Không có quyền thực hiện thao tác này' });
    }
    const user = await User.getById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User không tồn tại" });
    }

    // Nếu có avatar_url thì xóa ảnh trên Cloudinary
    if (user.avatar_url) {
      const publicId = getPublicIdFromUrl(user.avatar_url);
      if (publicId) {
        try {
          await deleteImageOnCloudinary(publicId);
        } catch (err) {
          console.error('Lỗi xóa avatar trên Cloudinary:', err);
        }
      }
    }

    await User.deleteUser(id);
    res.json({ success: true, message: 'Xóa user thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};
