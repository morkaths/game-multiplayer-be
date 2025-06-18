import pool from '../config/database.js';

/**
 * @typedef {Object} Room
 * @property {number} id - ID của phòng
 * @property {string} pin - Mã PIN của phòng (nếu có)
 * @property {number} question_set_id - ID của bộ câu hỏi liên kết với phòng
 * @property {number} host_id - ID của người tạo phòng (host)
 * @property {string} type - Loại phòng ('solo' hoặc 'live')
 * @property {string} status - Trạng thái phòng ('waiting', 'progress', 'ended')
 * @property {Date} [created_at] - Ngày giờ tạo phòng
 * @property {Date} [ended_at] - Ngày giờ kết thúc phòng (nếu có)
 */

const Room = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM rooms');
    return rows;
  },
  async getByHostId(host_id) {
    const [rows] = await pool.query('SELECT * FROM rooms WHERE host_id = ?', [host_id]);
    return rows;
  },
  async getByPin(pin) {
    const [rows] = await pool.query('SELECT * FROM rooms WHERE pin = ? AND status = ?', [pin, 'waiting']);
    return rows[0] || null;
  },
  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
    return rows[0] || null;
  },
  async create(data) {
    const [result] = await pool.query(
      'INSERT INTO rooms (pin, question_set_id, host_id, type, status) VALUES (?, ?, ?, ?, ?)',
      [data.pin, data.question_set_id, data.host_id, data.type, data.status]
    );
    return result.insertId;
  },
  async update(id, data) {
    await pool.query(
      'UPDATE rooms SET status=?, ended_at=? WHERE id=?',
      [data.status, data.ended_at, id]
    );
  },
  async updateByPin(pin, data) {
    if (data.status === 'ended') {
      await pool.query(
        'UPDATE rooms SET status=?, ended_at=CURRENT_TIMESTAMP WHERE pin=?',
        [data.status, pin]
      );
    } else {
      await pool.query(
        'UPDATE rooms SET status=? WHERE pin=?',
        [data.status, pin]
      );
    }
  },
  async delete(id) {
    await pool.query('DELETE FROM rooms WHERE id=?', [id]);
  }
};

export default Room;
