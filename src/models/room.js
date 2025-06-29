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
    const [rows] = await pool.query('SELECT * FROM rooms WHERE pin = ?', [pin]);
    return rows[0] || null;
  },
  async getByQuestionSetId(question_set_id) {
    const [rows] = await pool.query('SELECT * FROM rooms WHERE question_set_id = ?', [question_set_id]);
    return rows;
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
  },
  async deleteMany(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return 0;
    const placeholders = ids.map(() => '?').join(',');
    // Xóa player trước
    await pool.query(`DELETE FROM players WHERE room_id IN (${placeholders})`, ids);
    // Xóa room
    const [result] = await pool.query(
      `DELETE FROM rooms WHERE id IN (${placeholders})`,
      ids
    );
    return result.affectedRows;
  },
  async reports(host_id, type) {
    const [rows] = await pool.query(`
      SELECT
        r.id AS room_id,
        qs.title AS title,
        r.status,
        r.created_at,
        r.ended_at,
        COUNT(p.id) AS total_players
      FROM rooms r
      LEFT JOIN question_sets qs ON r.question_set_id = qs.id
      LEFT JOIN players p ON p.room_id = r.id
      WHERE r.host_id = ? AND r.type = ?
      GROUP BY r.id, qs.title, r.status, r.created_at, r.ended_at
      ORDER BY r.created_at DESC
    `, [host_id, type]);
    return rows;
  },
  async report(id) {
    const [rows] = await pool.query(`
      SELECT
        r.id AS room_id,
        r.pin,
        r.type AS room_type,
        r.status,
        r.created_at,
        r.ended_at,
        u.id AS host_id,
        u.username AS host_username,
        qs.title AS question_set_title,
        COUNT(DISTINCT p.id) AS total_players,
        COUNT(DISTINCT q.id) AS total_questions,
        SUM(CASE WHEN pa.is_correct = 1 THEN 1 ELSE 0 END) AS total_correct_answers,
        SUM(CASE WHEN pa.is_correct = 0 THEN 1 ELSE 0 END) AS total_wrong_answers,
        AVG(pa.response_time) AS avg_response_time
      FROM rooms r
      LEFT JOIN users u ON r.host_id = u.id
      LEFT JOIN question_sets qs ON r.question_set_id = qs.id
      LEFT JOIN players p ON p.room_id = r.id
      LEFT JOIN questions q ON q.question_set_id = qs.id
      LEFT JOIN player_answers pa ON pa.question_id = q.id AND pa.player_id = p.id
      WHERE r.id = ?
      GROUP BY r.id
    `, [id]);
    return rows[0];
  },
  async playerReports(room_id) {
    const [rows] = await pool.query(`
      SELECT
        p.id,
        p.nickname,
        p.score,
        SUM(CASE WHEN pa.is_correct = 1 THEN 1 ELSE 0 END) AS correct_answers,
        SUM(CASE WHEN pa.is_correct = 0 THEN 1 ELSE 0 END) AS wrong_answers
      FROM players p
      LEFT JOIN player_answers pa ON pa.player_id = p.id
      WHERE p.room_id = ?
      GROUP BY p.id, p.nickname, p.score
      ORDER BY p.score DESC
    `, [room_id]);
    return rows;
  }
};

export default Room;
