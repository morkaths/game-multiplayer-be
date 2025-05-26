import pool from '../config/database.js';

// Model User
const User = {
  // Đăng ký người dùng mới
  register: async (userData) => {
    try {
      const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
      const role = userData.role || 'user'; // Mặc định là 'user' nếu không chỉ định
      
      const [result] = await pool.query(query, [
        userData.username, 
        userData.email, 
        userData.password, 
        role
      ]);
      
      return {
        id: result.insertId,
        username: userData.username,
        email: userData.email,
        role: role
      };
    } catch (err) {
      throw err;
    }
  },
  
  // Tìm user theo username
  findByUsername: async (username) => {
    try {
      const query = 'SELECT * FROM users WHERE username = ?';
      const [rows] = await pool.query(query, [username]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (err) {
      throw err;
    }
  },
  
  // Tìm user theo email
  findByEmail: async (email) => {
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
    await pool.query('UPDATE users SET password=? WHERE id=?', [newHashedPassword, id]);
  },

  updateProfile: async (id, { email, username }) => {
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
  }
};

export default User; 