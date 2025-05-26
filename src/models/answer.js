import pool from '../config/database.js';

/**
 * @typedef {Object} Answer
 * @property {number} id - ID của câu trả lời
 * @property {number} question_id - ID của câu hỏi
 * @property {string} content - Nội dung câu trả lời
 * @property {boolean} is_correct - Đáp án đúng hay sai
 */

const Answer = {
  async getByQuestionId(question_id) {
    const [rows] = await pool.query('SELECT * FROM answers WHERE question_id = ?', [question_id]);
    return rows;
  },
  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM answers WHERE id = ?', [id]);
    return rows[0] || null;
  },
  async getCorrectAnswer(question_id) {
    const [rows] = await pool.query('SELECT * FROM answers WHERE question_id = ? AND is_correct = true', [question_id]);
    return rows[0] || null;
  },
  async create(data) {
    const [result] = await pool.query(
      'INSERT INTO answers (question_id, content, is_correct) VALUES (?, ?, ?)',
      [data.question_id, data.content, data.is_correct]
    );
    return result.insertId;
  },
  async update(id, data) {
    await pool.query(
      'UPDATE answers SET content=?, is_correct=? WHERE id=?',
      [data.content, data.is_correct, id]
    );
  },
  async delete(id) {
    await pool.query('DELETE FROM answers WHERE id=?', [id]);
  }
};

export default Answer;
