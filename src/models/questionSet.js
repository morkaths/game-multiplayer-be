import pool from '../config/database.js';

/**
 * @typedef {Object} QuestionSet
 * @property {number} id - ID của bộ câu hỏi
 * @property {string} title - Tiêu đề bộ câu hỏi
 * @property {string} author - Tác giả bộ câu hỏi
 * @property {number} questions - Số câu hỏi
 * @property {string} [description] - Mô tả về bộ câu hỏi
 * @property {string} [image_url] - URL hình ảnh minh họa
 */

const QuestionSet = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT 
        qs.id, 
        qs.title, 
        qs.description,
        qs.image_url,
        qs.created_by,
        u.username as author,
        (SELECT COUNT(*) FROM questions q WHERE q.question_set_id = qs.id) as questions
      FROM 
        question_sets qs
      LEFT JOIN 
        users u ON qs.created_by = u.id
    `);
    return rows;
  },
  async getByUserId(user_id) {
    const [rows] = await pool.query(`
      SELECT
        qs.id,
        qs.title,
        qs.description,
        qs.image_url,
        qs.created_by,
        u.username as author,
        (SELECT COUNT(*) FROM questions q WHERE q.question_set_id = qs.id) as questions
      FROM
        question_sets qs
      LEFT JOIN
        users u ON qs.created_by = u.id
      WHERE
        qs.created_by = ?
      `, [user_id]);
    return rows;
  },
  async getById(id) {
    const [rows] = await pool.query(`
      SELECT
        qs.id, 
        qs.title, 
        qs.description,
        qs.image_url,
        qs.created_by,
        u.username as author,
        (SELECT COUNT(*) FROM questions q WHERE q.question_set_id = qs.id) as questions
      FROM
        question_sets qs
      LEFT JOIN
        users u ON qs.created_by = u.id
      WHERE
        qs.id = ?
      `, [id]);
    return rows[0] || null;
  },
  async search(keyword) {
    const [rows] = await pool.query(`
      SELECT 
        qs.id, 
        qs.title, 
        qs.description,
        qs.image_url,
        qs.created_by,
        u.username as author,
        (SELECT COUNT(*) FROM questions q WHERE q.question_set_id = qs.id) as questions
      FROM 
        question_sets qs
      LEFT JOIN 
        users u ON qs.created_by = u.id
      WHERE 
        qs.title LIKE ? OR
        qs.description LIKE ? OR
        u.username LIKE ?
    `, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]);
    return rows;
  },
  async create(data) {
    const [result] = await pool.query(
      'INSERT INTO question_sets (title, description, image_url, created_by) VALUES (?, ?, ?, ?)',
      [data.title, data.description, data.image_url, data.created_by]
    );
    return result.insertId;
  },
  async update(id, data) {
    await pool.query(
      'UPDATE question_sets SET title=?, description=? WHERE id=? AND created_by=?',
      [data.title, data.description, id, data.created_by]
    );
  },
  async delete(id, user_id) {
    await pool.query('DELETE FROM question_sets WHERE id=? AND created_by=?', [id, user_id]);
  },
  async stats(id) {
    // Số lượt chơi: số phòng sử dụng bộ câu hỏi này
    const [[{ total_rooms }]] = await pool.query(`
      SELECT COUNT(*) AS total_rooms
      FROM rooms
      WHERE question_set_id = ?
    `, [id]);

    // Số người chơi: tổng số player tham gia các phòng dùng bộ này
    const [[{ total_players }]] = await pool.query(`
      SELECT COUNT(*) AS total_players
      FROM players p
      JOIN rooms r ON p.room_id = r.id
      WHERE r.question_set_id = ?
    `, [id]);

    return { total_rooms, total_players };
  }
};

export default QuestionSet;
