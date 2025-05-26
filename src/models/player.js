import pool from '../config/database.js';

const Player = {
  // Lấy tất cả player trong 1 room
  async getByRoomId(room_id) {
    const [rows] = await pool.query('SELECT * FROM players WHERE room_id = ?', [room_id]);
    return rows;
  },
  // Lấy player theo id
  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM players WHERE id = ?', [id]);
    return rows[0] || null;
  },
  // Thêm player mới vào room
  async create(data) {
    const [result] = await pool.query(
      'INSERT INTO players (room_id, nickname, avatar_url, score) VALUES (?, ?, ?, ?)',
      [data.room_id, data.nickname, data.avatar_url, data.score || 0]
    );
    return result.insertId;
  },
  // Cập nhật thông tin player (ví dụ: điểm số, avatar)
  async update(id, data) {
    const fields = [];
    const values = [];
    if (data.nickname) {
      fields.push('nickname=?');
      values.push(data.nickname);
    }
    if (data.avatar_url) {
      fields.push('avatar_url=?');
      values.push(data.avatar_url);
    }
    if (typeof data.score === 'number') {
      fields.push('score=?');
      values.push(data.score);
    }
    if (fields.length === 0) return;
    values.push(id);
    await pool.query(`UPDATE players SET ${fields.join(', ')} WHERE id=?`, values);
  },
  // Xoá player khỏi room
  async delete(id) {
    await pool.query('DELETE FROM players WHERE id=?', [id]);
  }
};

export default Player;
