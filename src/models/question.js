import pool from '../config/database.js';

/**
 * @typedef {Object} Question
 * @property {number} id - ID của câu hỏi
 * @property {number} question_set_id - ID của bộ câu hỏi
 * @property {string} content - Nội dung câu hỏi
 * @property {string} type - Loại câu hỏi (choice, text)
 * @property {number} points - Điểm của câu hỏi
 * @property {number} time_limit - Thời gian làm câu hỏi (giây)
 * @property {string} [image_url] - URL hình ảnh minh họa (nếu có)
 */

const Question = {
  async getBySetId(question_set_id) {
    const [rows] = await pool.query('SELECT * FROM questions WHERE question_set_id = ?', [question_set_id]);
    return rows;
  },
  async getIdsBySetId(question_set_id) {
    const [rows] = await pool.query(
      `SELECT id FROM questions WHERE question_set_id = ?`, [question_set_id]
    );
    return rows.map(row => row.id);
  },
  async getFirstBySetId(question_set_id) {
    const [rows] = await pool.query(
      `SELECT * FROM questions WHERE question_set_id = ? ORDER BY id ASC LIMIT 1`, [question_set_id]
    );
    return rows[0] || null;
  },
  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM questions WHERE id = ?', [id]);
    return rows[0] || null;
  },
  async create(data) {
    const [result] = await pool.query(
      "INSERT INTO questions (question_set_id, content, image_url, type, points, time_limit) VALUES (?, ?, ?, ?, ?, ?)",
      [data.question_set_id, data.content, data.image_url, data.type, data.points, data.time_limit]
    );
    return result.insertId;
  },
  async update(id, data) {
    await pool.query(
      "UPDATE questions SET content=?, image_url=?, type=?, points=?, time_limit=? WHERE id=?",
      [data.content, data.image_url, data.type, data.points, data.time_limit, id]
    );
  },
  async delete(id) {
    await pool.query('DELETE FROM questions WHERE id=?', [id]);
  }
};

export default Question;
