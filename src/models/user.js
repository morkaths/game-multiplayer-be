import pool from '../config/database.js';

// Model User
const User = {
  // Đăng ký người dùng mới
  register: async (userData) => {
    try {
      const query = 'INSERT INTO users (username, email, password, role, isGoogleAccount) VALUES (?, ?, ?, ?, ?)';
      const role = userData.role || 'user'; // Mặc định là 'user' nếu không chỉ định
      const isGoogleAccount = userData.isGoogleAccount || false;

      const [result] = await pool.query(query, [
        userData.username,
        userData.email,
        userData.password,
        role,
        isGoogleAccount
      ]);

      return {
        id: result.insertId,
        username: userData.username,
        email: userData.email,
        role: role,
        isGoogleAccount: isGoogleAccount
      };
    } catch (err) {
      throw err;
    }
  },

  // Kiểm tra username đã tồn tại chưa (chính xác)
  checkUsername: async (username) => {
    try {
      const query = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
      const [rows] = await pool.query(query, [username]);
      return rows[0].count > 0;
    } catch (err) {
      throw err;
    }
  },

  checkEmail: async (email) => {
    try {
      const query = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
      const [rows] = await pool.query(query, [email]);
      return rows[0].count > 0;
    } catch (err) {
      throw err;
    }
  },

  getAll: async () => {
    const query = 'SELECT * FROM users';
    const [rows] = await pool.query(query);
    return rows;
  },

  getById: async (id) => {
    try {
      const query = 'SELECT * FROM users WHERE id = ?';
      const [rows] = await pool.query(query, [id]);

      if (rows.length === 0) {
        return null;
      }

      return rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Tìm user theo username
  getByUsername: async (username) => {
    try {
      const query = 'SELECT * FROM users WHERE username LIKE ?';
      const [rows] = await pool.query(query, [`%${username}%`]);

      if (rows.length === 0) {
        return null;
      }

      return rows;
    } catch (err) {
      throw err;
    }
  },

  // Tìm user theo email
  getByEmail: async (email) => {
    try {
      const query = 'SELECT * FROM users WHERE email = ?';
      const [rows] = await pool.query(query, [email]);

      if (rows.length === 0) {
        return null;
      }

      return rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Thêm hàm này vào object User
  updatePassword: async (id, newHashedPassword) => {
    try {
      await pool.query('UPDATE users SET password=? WHERE id=?', [newHashedPassword, id]);
    } catch (err) {
      throw err;
    }
  },

  updateProfile: async (id, { email, username }) => {
    try {
      const fields = [];
      const values = [];
      if (email) {
        fields.push('email=?');
        values.push(email);
      }
      if (username) {
        fields.push('username=?');
        values.push(username);
      }
      if (fields.length === 0) return;
      values.push(id);
      await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id=?`, values);
    } catch (err) {
      throw err;
    }
  },
  linkPassword: async (email, newHashedPassword) => {
    try {
      await pool.query('UPDATE users SET password=?, isGoogleAccount=false WHERE email=?', [newHashedPassword, email]);
    } catch (err) {
      throw err;
    }
  },
  saveResetToken: async (userId, token, expires) => {
    const query = 'INSERT INTO password_reset_tokens (user_id, token, expires) VALUES (?, ?, ?)';
    await pool.query(query, [userId, token, expires]);
  },

  findByResetToken: async (token) => {
    const query = 'SELECT * FROM password_reset_tokens WHERE token = ?';
    const [rows] = await pool.query(query, [token]);
    return rows.length > 0 ? rows[0] : null;
  },

  deleteResetToken: async (token) => {
    const query = 'DELETE FROM password_reset_tokens WHERE token = ?';
    await pool.query(query, [token]);
  }
};

export default User; 